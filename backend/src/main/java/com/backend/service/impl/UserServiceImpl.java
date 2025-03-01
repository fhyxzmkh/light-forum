package com.backend.service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.backend.config.security.JwtUtil;
import com.backend.config.security.UserDetailsImpl;
import com.backend.entity.pojo.User;
import com.backend.mapper.UserMapper;
import com.backend.service.UserService;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;


    @Override
    public Map<String, String> login(String username, String password) {
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(username, password);

        Authentication authenticate = authenticationManager.authenticate(authenticationToken);

        UserDetailsImpl loginUser = (UserDetailsImpl) authenticate.getPrincipal();

        User user = loginUser.getUser();

        String jwt = JwtUtil.createJWT(user.getId().toString());

        Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "success");
        response.put("token", jwt);

        User userInfo = new User();

        userInfo.setId(user.getId());
        userInfo.setUsername(user.getUsername());
        userInfo.setAvatar(user.getAvatar());

        response.put("userInfo", JSON.toJSONString(userInfo));

        return response;
    }

    @Override
    public Map<String, String> register(String username, String password, String confirmPassword) {
        Map<String, String> response = new HashMap<>();

        if (username == null || username.isEmpty()) {
            response.put("message", "Username is required");
            return response;
        }

        if (password == null || password.isEmpty()) {
            response.put("message", "Password is required");
            return response;
        }

        if (confirmPassword == null || confirmPassword.isEmpty()) {
            response.put("message", "Confirm password is required");
            return response;
        }

        username = username.trim();
        if (username.length() < 3 || username.length() > 30) {
            response.put("message", "Username must be between 3 and 30 characters");
            return response;
        }

        if (password.length() < 3 || password.length() > 60) {
            response.put("message", "Password must be between 3 and 60 characters");
            return response;
        }

        if (!password.equals(confirmPassword)) {
            response.put("message", "Passwords do not match");
            return response;
        }

        // 用户名不能重复
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", username);
        List<User> users = userMapper.selectList(queryWrapper);
        if (!users.isEmpty()) {
            response.put("message", "Username already exists");
            return response;
        }

        String encodedPassword = passwordEncoder.encode(password);
        String avatar = "https://api.multiavatar.com/Binx Bond.png";

        User user = new User(null, username, encodedPassword, avatar, 1, 0, new Date());
        userMapper.insert(user);

        response.put("message", "success");
        return response;
    }
}
