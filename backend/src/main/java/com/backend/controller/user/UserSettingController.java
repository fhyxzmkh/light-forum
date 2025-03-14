package com.backend.controller.user;

import com.backend.service.UserSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class UserSettingController {

    @Autowired
    private UserSettingService userProfileService;

    @PostMapping("/user/setting/uploadAvatar")
    public ResponseEntity<String> uploadAvatar(@RequestBody Map<String, String> data) {
        String url = data.get("avatarUrl");
        return userProfileService.uploadAvatar(url);
    }

    @PostMapping("/user/setting/changePassword")
    public ResponseEntity<String> changePassword(@RequestBody Map<String, String> data) {
        String oldPassword = data.get("oldPassword");
        String newPassword = data.get("newPassword");
        return userProfileService.changePassword(oldPassword, newPassword);
    }

}
