package com.backend.service.impl;

import com.alibaba.fastjson.JSONObject;
import com.backend.entity.pojo.DiscussPost;
import com.backend.mapper.DiscussPostMapper;
import com.backend.service.DiscussPostService;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.List;

@Service
public class DiscussPostServiceImpl implements DiscussPostService {

    @Autowired
    private DiscussPostMapper discussPostMapper;

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
            queryWrapper.orderByDesc("score"); // 按评分降序排序
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
            item.put("score", post.getScore());
            items.add(item);
        }

        // 设置返回数据
        resp.put("discuss_posts", items);
        resp.put("discuss_posts_count", discussPostMapper.selectCount(queryWrapper)); // 查询总数

        return resp;
    }

}
