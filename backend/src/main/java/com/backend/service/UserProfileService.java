package com.backend.service;

import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface UserProfileService {

    ResponseEntity<String> uploadAvatar(String url);

    ResponseEntity<String> changePassword(String oldPassword, String newPassword);

}
