package com.backend.service.impl;

import com.backend.entity.dto.UserInfoDto;
import com.backend.entity.pojo.Event;
import com.backend.entity.pojo.User;
import com.backend.event.EventProducer;
import com.backend.mapper.UserMapper;
import com.backend.service.FollowService;
import com.backend.utils.LoggedUserUtil;
import com.backend.utils.RedisKeyUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.data.redis.core.SessionCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

import static com.backend.entity.constant.CommunityConstant.TOPIC_FOLLOW;
import static com.backend.entity.constant.CommunityConstant.TOPIC_LIKE;

@Service
public class FollowServiceImpl implements FollowService {

    @Autowired
    private EventProducer eventProducer;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private UserMapper userMapper;

    @Override
    public void follow(int userId, int entityType, int entityId) {
        Event event = new Event();
        event.setTopic(TOPIC_FOLLOW);
        event.setUserId(LoggedUserUtil.get().getId());
        event.setEntityType(entityType);
        event.setEntityId(entityId);
        event.setEntityUserId(entityId);

        eventProducer.fireEvent(event);

        stringRedisTemplate.execute(new SessionCallback<>() {
            @Override
            public Object execute(RedisOperations operations) throws DataAccessException {
                String followeeKey = RedisKeyUtil.getFolloweeKey(userId, entityType);
                String followerKey = RedisKeyUtil.getFollowerKey(entityType, entityId);

                operations.multi();

                operations.opsForZSet().add(followeeKey, String.valueOf(entityId), System.currentTimeMillis());
                operations.opsForZSet().add(followerKey, String.valueOf(userId), System.currentTimeMillis());

                return operations.exec();
            }
        });
    }

    @Override
    public void unfollow(int userId, int entityType, int entityId) {
        stringRedisTemplate.execute(new SessionCallback<>() {
            @Override
            public Object execute(RedisOperations operations) throws DataAccessException {
                String followeeKey = RedisKeyUtil.getFolloweeKey(userId, entityType);
                String followerKey = RedisKeyUtil.getFollowerKey(entityType, entityId);

                operations.multi();

                operations.opsForZSet().remove(followeeKey, String.valueOf(entityId));
                operations.opsForZSet().remove(followerKey, String.valueOf(userId));

                return operations.exec();
            }
        });
    }

    @Override
    public Long findFolloweeCount(int userId, int entityType) {
        String followeeKey = RedisKeyUtil.getFolloweeKey(userId, entityType);
        return stringRedisTemplate.opsForZSet().zCard(followeeKey);
    }

    @Override
    public Long findFollowerCount(int entityType, int entityId) {
        String followerKey = RedisKeyUtil.getFollowerKey(entityType, entityId);
        return stringRedisTemplate.opsForZSet().zCard(followerKey);
    }

    @Override
    public boolean hasFollowed(int userId, int entityType, int entityId) {
        String followeeKey = RedisKeyUtil.getFolloweeKey(userId, entityType);
        return stringRedisTemplate.opsForZSet().score(followeeKey, String.valueOf(entityId)) != null;
    }

    @Override
    public List<Map<String, Object>> findFollowees(int userId, int offset, int limit) {
        String followeeKey = RedisKeyUtil.getFolloweeKey(userId, 3);
        Set<String> targetIds = stringRedisTemplate.opsForZSet().reverseRange(followeeKey, offset, offset + limit - 1);

        if (targetIds == null) {
            return null;
        }

        List<Map<String, Object>> list = new ArrayList<>();
        for (String targetId : targetIds) {
            Map<String, Object> map = new HashMap<>();
            User user = userMapper.selectById(Integer.parseInt(targetId));
            map.put("user", user);
            Double score = stringRedisTemplate.opsForZSet().score(followeeKey, targetId);
            map.put("followTime", new Date(score.longValue()));
            list.add(map);
        }

        return list;
    }

    @Override
    public List<Map<String, Object>> findFollowers(int userId, int offset, int limit) {
        String followerKey = RedisKeyUtil.getFollowerKey(3, userId);
        Set<String> targetIds = stringRedisTemplate.opsForZSet().reverseRange(followerKey, offset, offset + limit - 1);

        if (targetIds == null) {
            return null;
        }

        List<Map<String, Object>> list = new ArrayList<>();
        for (String targetId : targetIds) {
            Map<String, Object> map = new HashMap<>();

            User user = userMapper.selectById(Integer.parseInt(targetId));
            UserInfoDto userInfoDto = new UserInfoDto();
            userInfoDto.setId(user.getId());
            userInfoDto.setUsername(user.getUsername());
            userInfoDto.setAvatar(user.getAvatar());
            map.put("user", userInfoDto);

            Double score = stringRedisTemplate.opsForZSet().score(followerKey, targetId);
            map.put("followTime", new Date(score.longValue()));
            list.add(map);
        }

        return list;
    }

}
