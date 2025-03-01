package com.backend.service;

import com.alibaba.fastjson.JSONObject;

import java.util.Map;

public interface DiscussPostService {

    JSONObject getDiscussPostList(Integer page, Integer pageSize, String sortBy);

}
