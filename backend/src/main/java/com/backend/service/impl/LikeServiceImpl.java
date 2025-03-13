package com.backend.service.impl;

import com.backend.entity.pojo.Event;
import com.backend.entity.pojo.User;
import com.backend.event.EventProducer;
import com.backend.service.LikeService;
import com.backend.utils.LoggedUserUtil;
import com.backend.utils.RedisKeyUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.data.redis.core.SessionCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;

import static com.backend.entity.constant.CommunityConstant.TOPIC_COMMENT;
import static com.backend.entity.constant.CommunityConstant.TOPIC_LIKE;

@Service
public class LikeServiceImpl implements LikeService {

    @Autowired
    private EventProducer eventProducer;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    // 点赞
    @Override
    public void like(int entityType, int entityId, int entityUserId) {

        stringRedisTemplate.execute(new SessionCallback<>() {
            @Override
            public Object execute(RedisOperations operations) throws DataAccessException {
                User user = LoggedUserUtil.get();
                String entityLikeKey = RedisKeyUtil.getEntityLikeKey(entityType, entityId);
                String userLikeKey = RedisKeyUtil.getUserLikeKey(entityUserId);

                Boolean isMember = operations.opsForSet().isMember(entityLikeKey, String.valueOf(user.getId()));

                operations.multi();

                if (Boolean.TRUE.equals(isMember)) { // 已点赞
                    operations.opsForSet().remove(entityLikeKey, String.valueOf(user.getId()));
                    operations.opsForValue().decrement(userLikeKey);
                } else { // 未点赞
                    Event event = new Event();
                    event.setTopic(TOPIC_LIKE);
                    event.setUserId(user.getId());
                    event.setEntityType(entityType);
                    event.setEntityId(entityId);
                    event.setEntityUserId(entityUserId);

                    eventProducer.fireEvent(event);

                    operations.opsForSet().add(entityLikeKey, String.valueOf(user.getId()));
                    operations.opsForValue().increment(userLikeKey);
                }

                return operations.exec();
            }
        });

    }

    // 查询某实体点赞的数量
    @Override
    public Long findEntityLikeCount(int entityType, int entityId) {
        String entityLikeKey = RedisKeyUtil.getEntityLikeKey(entityType, entityId);
        return stringRedisTemplate.opsForSet().size(entityLikeKey);
    }

    // 查询某人对某实体的点赞状态
    @Override
    public Integer findEntityLikeStatus(int entityType, int entityId) {
        User user = LoggedUserUtil.get();
        String entityLikeKey = RedisKeyUtil.getEntityLikeKey(entityType, entityId);

        Boolean isMember = stringRedisTemplate.opsForSet().isMember(entityLikeKey, String.valueOf(user.getId()));

        return Boolean.TRUE.equals(isMember) ? 1 : 0;
    }

    // 查询某个用户获得的赞
    @Override
    public Integer findUserLikeCount(int userId) {
        String userLikeKey = RedisKeyUtil.getUserLikeKey(userId);
        String s = stringRedisTemplate.opsForValue().get(userLikeKey);

        if (s != null) {
            return Integer.valueOf(s);
        }

        return 0;
    }

}
