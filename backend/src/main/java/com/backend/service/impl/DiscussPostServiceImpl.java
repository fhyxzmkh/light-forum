package com.backend.service.impl;

import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson.JSONObject;
import com.backend.config.security.UserDetailsImpl;
import com.backend.entity.dto.DiscussPostDetailsDto;
import com.backend.entity.pojo.Comment;
import com.backend.entity.pojo.DiscussPost;
import com.backend.entity.pojo.Event;
import com.backend.entity.pojo.User;
import com.backend.event.EventProducer;
import com.backend.mapper.CommentMapper;
import com.backend.mapper.DiscussPostMapper;
import com.backend.mapper.UserMapper;
import com.backend.service.CommentService;
import com.backend.service.DiscussPostService;
import com.backend.utils.SensitiveWordsFilter;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import static com.backend.entity.constant.CommunityConstant.ENTITY_TYPE_POST;
import static com.backend.entity.constant.CommunityConstant.TOPIC_PUBLISH;

@Service
public class DiscussPostServiceImpl implements DiscussPostService {

    @Autowired
    private DiscussPostMapper discussPostMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private SensitiveWordsFilter sensitiveWordsFilter;

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private EventProducer eventProducer;

    @Override
    public JSONObject getDiscussPostList(Integer page, Integer pageSize, String sortBy) {
        // 创建分页对象
        IPage<DiscussPost> recordIPage = new Page<>(page, pageSize);

        // 创建查询条件
        QueryWrapper<DiscussPost> queryWrapper = new QueryWrapper<>();

        // 根据 sortBy 参数设置排序规则
        if ("latest".equals(sortBy)) {
            queryWrapper.orderByDesc("create_time"); // 按创建时间降序排序
        } else {
            queryWrapper.orderByDesc("score"); // 按热度降序排序
        }

        // 查询分页数据
        List<DiscussPost> posts = discussPostMapper.selectPage(recordIPage, queryWrapper).getRecords();

        // 构造返回结果
        JSONObject resp = new JSONObject();
        List<JSONObject> items = new LinkedList<>();

        for (DiscussPost post : posts) {
            JSONObject item = new JSONObject();
            item.put("id", post.getId());
            item.put("userId", post.getUserId());
            item.put("title", post.getTitle());
            item.put("content", post.getContent());
            item.put("type", post.getType());
            item.put("status", post.getStatus());
            item.put("createTime", post.getCreateTime());
            item.put("commentCount", post.getCommentCount());
            items.add(item);
        }

        // 设置返回数据
        resp.put("discuss_posts", items);
        resp.put("discuss_posts_count", discussPostMapper.selectCount(queryWrapper)); // 查询总数

        return resp;
    }

    @Override
    @Transactional
    public ResponseEntity<String> addDiscussPost(String title, String content) {
        UsernamePasswordAuthenticationToken authenticationToken =
                (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();

        UserDetailsImpl loginUser = (UserDetailsImpl) authenticationToken.getPrincipal();
        User user = loginUser.getUser();

        if (StrUtil.isBlank(title) || StrUtil.isBlank(content)) {
            ResponseEntity.badRequest().body("Title or content is null");
        }

        DiscussPost post = new DiscussPost();
        post.setUserId(user.getId());
        post.setTitle(sensitiveWordsFilter.filter(title));
        post.setContent(sensitiveWordsFilter.filter(content));
        post.setCreateTime(new Date());
        post.setStatus(0);
        post.setType(0);
        post.setCommentCount(0);
        post.setScore(0);

        discussPostMapper.insert(post);

        // 触发发帖事件
        Event event = new Event();
        event.setTopic(TOPIC_PUBLISH);
        event.setUserId(user.getId());
        event.setEntityType(ENTITY_TYPE_POST);
        event.setEntityUserId(user.getId());
        eventProducer.fireEvent(event);

        return ResponseEntity.ok("success");
    }

    @Override
    public ResponseEntity<JSONObject> getPostDetails(Integer postId) {
        JSONObject response = new JSONObject();

        if (postId == null) {
            response.put("error", "Post ID cannot be empty");
            return ResponseEntity.badRequest().body(response);
        }

        DiscussPost post = discussPostMapper.selectById(postId);
        User user = userMapper.selectById(post.getUserId());

        DiscussPostDetailsDto discussPostDetailsDto = new DiscussPostDetailsDto();
        discussPostDetailsDto.setDiscussPost(post);
        discussPostDetailsDto.setUsername(user.getUsername());
        discussPostDetailsDto.setAvatar(user.getAvatar());
        discussPostDetailsDto.setId(user.getId());
        discussPostDetailsDto.setStatus(user.getStatus());
        discussPostDetailsDto.setType(user.getType());

        response.put("post", discussPostDetailsDto);
        
        return ResponseEntity.ok(response);
    }

    @Override
    public JSONObject getPostComments(Integer postId, Integer page, Integer pageSize) {
        IPage<Comment> commentIPage = new Page<>(page, pageSize);

        QueryWrapper<Comment> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("entity_type", ENTITY_TYPE_POST).eq("entity_id", postId);

        List<Comment> comments = commentMapper.selectPage(commentIPage, queryWrapper).getRecords();

        JSONObject resp = new JSONObject();
        List<JSONObject> items = new LinkedList<>();

        for (Comment comment : comments) {
            JSONObject item = new JSONObject();
            item.put("id", comment.getId());
            item.put("user_id", comment.getUserId());
            item.put("user_name", userMapper.selectById(comment.getUserId()).getUsername());
            item.put("user_avatar", userMapper.selectById(comment.getUserId()).getAvatar());
            item.put("content", comment.getContent());
            item.put("status", comment.getStatus());
            item.put("createTime", comment.getCreateTime());
            items.add(item);
        }

        resp.put("post_comments", items);
        resp.put("post_comments_count", commentMapper.selectCount(queryWrapper)); // 查询总数

        return resp;

    }

    @Override
    public JSONObject getDiscussPostListByUserId(Integer userId, Integer page, Integer pageSize) {
        IPage<DiscussPost> recordIPage = new Page<>(page, pageSize);

        QueryWrapper<DiscussPost> queryWrapper = new QueryWrapper<>();
        queryWrapper.orderByDesc("create_time");
        List<DiscussPost> posts = discussPostMapper.selectPage(recordIPage, queryWrapper).getRecords();

        JSONObject resp = new JSONObject();
        List<JSONObject> items = new LinkedList<>();

        for (DiscussPost post : posts) {
            JSONObject item = new JSONObject();
            item.put("id", post.getId());
            item.put("title", post.getTitle());
            item.put("content", post.getContent());
            item.put("createTime", post.getCreateTime());
            items.add(item);
        }

        resp.put("my_posts", items);
        resp.put("my_posts_count", discussPostMapper.selectCount(queryWrapper));

        return resp;
    }


}
