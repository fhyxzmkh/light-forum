package com.backend.service.impl;

import com.backend.entity.pojo.User;
import com.backend.service.UserSettingService;
import com.backend.utils.LoggedUserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserSettingServiceImpl implements UserSettingService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public ResponseEntity<String> uploadAvatar(String url) {
        User user = LoggedUserUtil.get();

        user.setAvatar(url);

        return ResponseEntity.ok("success");
    }

    @Override
    public ResponseEntity<String> changePassword(String oldPassword, String newPassword) {
        User user = LoggedUserUtil.get();

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body("Incorrect old password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));

        return ResponseEntity.ok("success");
    }

}
