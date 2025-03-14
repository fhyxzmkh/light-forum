package com.backend.service;

import com.alibaba.fastjson.JSONObject;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface DiscussPostService {

    JSONObject getDiscussPostList(Integer page, Integer pageSize, String sortBy);

    ResponseEntity<String> addDiscussPost(String title, String content);

    ResponseEntity<JSONObject> getPostDetails(Integer postId);

    JSONObject getPostComments(Integer postId, Integer page, Integer pageSize);

    JSONObject getDiscussPostListByUserId(Integer userId, Integer page, Integer pageSize);
}
