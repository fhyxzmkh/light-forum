package com.backend.service;

import com.alibaba.fastjson.JSONObject;

import java.util.Map;

public interface UserService {
    Map<String, String> login(String username, String password);

    Map<String, String> register(String username, String password, String confirmPassword);

    JSONObject getUserProfile(String userId);
}
