package com.backend.controller.user;

import com.alibaba.fastjson.JSONObject;
import com.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class UserProfileController {

    @Autowired
    private UserService userService;

    @GetMapping("/user/profile")
    public JSONObject getUserProfile(@RequestParam String userId) {
        return userService.getUserProfile(userId);
    }

}
