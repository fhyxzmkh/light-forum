package com.backend.service;

import com.alibaba.fastjson.JSONObject;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface DiscussPostService {

    JSONObject getDiscussPostList(Integer page, Integer pageSize, String sortBy);

    ResponseEntity<String> addDiscussPost(String title, String content);
}
