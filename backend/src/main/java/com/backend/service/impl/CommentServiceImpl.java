package com.backend.service.impl;

import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson.JSONObject;
import com.backend.config.security.UserDetailsImpl;
import com.backend.entity.pojo.Comment;
import com.backend.entity.pojo.DiscussPost;
import com.backend.entity.pojo.Event;
import com.backend.entity.pojo.User;
import com.backend.event.EventProducer;
import com.backend.mapper.CommentMapper;
import com.backend.mapper.DiscussPostMapper;
import com.backend.mapper.UserMapper;
import com.backend.service.CommentService;
import com.backend.utils.LoggedUserUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;

import static com.backend.entity.constant.CommunityConstant.*;

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private DiscussPostMapper discussPostMapper;

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private EventProducer eventProducer;

    @Override
    public ResponseEntity<String> addPostComment(String content, Integer entityId) {
        if (content == null || StrUtil.isBlank(content)) {
            return ResponseEntity.badRequest().body("评论内容不能为空");
        }

        DiscussPost post = discussPostMapper.selectById(entityId);
        if (post == null) {
            return ResponseEntity.badRequest().body("帖子不存在");
        }

        User user = LoggedUserUtil.get();

        Comment comment = new Comment();
        comment.setUserId(user.getId());
        comment.setEntityType(ENTITY_TYPE_POST);
        comment.setEntityId(entityId);
        comment.setTargetId(-1);
        comment.setContent(content);
        comment.setStatus(0);
        comment.setCreateTime(new Date());

        commentMapper.insert(comment);

        // 评论数+1
        discussPostMapper.PlusPostCommentCount(entityId);

        // 触发发帖事件
        Event event = new Event();
        event.setTopic(TOPIC_PUBLISH);
        event.setUserId(user.getId());
        event.setEntityType(ENTITY_TYPE_POST);
        event.setEntityUserId(user.getId());
        eventProducer.fireEvent(event);

        return ResponseEntity.ok().body("评论成功");
    }

    @Override
    public ResponseEntity<String> addCommentComment(String content, Integer entityId, Integer targetId) {
        if (content == null || StrUtil.isBlank(content)) {
            return ResponseEntity.badRequest().body("评论内容不能为空");
        }

        Comment TargetComment = commentMapper.selectById(targetId);
        if (TargetComment == null) {
            return ResponseEntity.badRequest().body("目标评论不存在");
        }

        Comment comment = new Comment();
        comment.setUserId(TargetComment.getUserId());
        comment.setEntityType(ENTITY_TYPE_COMMENT);
        comment.setEntityId(entityId);
        comment.setTargetId(targetId);
        comment.setContent(content);
        comment.setStatus(0);
        comment.setCreateTime(new Date());

        commentMapper.insert(comment);

        return ResponseEntity.ok().body("评论成功");
    }

    @Override
    public JSONObject getSubComment(Integer commentId) {
        if (commentId == null) {
            return null;
        }

        QueryWrapper<Comment> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("entity_type", ENTITY_TYPE_COMMENT)
                .eq("entity_id", commentId)
                .eq("status", 0)
                .orderByAsc("create_time");

        List<Comment> comments = commentMapper.selectList(queryWrapper);

        JSONObject resp = new JSONObject();
        List<JSONObject> items = new LinkedList<>();

        for (Comment comment : comments) {
            JSONObject item = new JSONObject();

            item.put("id", comment.getId());

            User commentAuthor = userMapper.selectById(comment.getUserId());
            item.put("comment_author_name", commentAuthor.getUsername());

            if (!Objects.equals(comment.getTargetId(), comment.getEntityId())) {
                Comment replyToComment = commentMapper.selectById(comment.getTargetId());
                User replyToUser = userMapper.selectById(replyToComment.getUserId());
                item.put("reply_to_user_name", replyToUser.getUsername());
            }

            item.put("createTime", comment.getCreateTime());
            item.put("content", comment.getContent());
            item.put("status", comment.getStatus());

            items.add(item);
        }

        resp.put("sub_comments", items);

        return resp;
    }
}
