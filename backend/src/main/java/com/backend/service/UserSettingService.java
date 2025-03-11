package com.backend.service;

import org.springframework.http.ResponseEntity;

public interface UserSettingService {

    ResponseEntity<String> uploadAvatar(String url);

    ResponseEntity<String> changePassword(String oldPassword, String newPassword);

}
