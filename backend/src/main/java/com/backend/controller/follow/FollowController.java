package com.backend.controller.follow;

import com.backend.service.FollowService;
import com.backend.utils.LoggedUserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class FollowController {

    @Autowired
    private FollowService followService;

    @PostMapping("/follow")
    public ResponseEntity<?> follow(@RequestBody Map<String, String> data) {
        int userId = LoggedUserUtil.get().getId();

        int entityType = Integer.parseInt(data.get("entityType"));
        int entityId = Integer.parseInt(data.get("entityId"));

        followService.follow(userId, entityType, entityId);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/unfollow")
    public ResponseEntity<?> unfollow(@RequestBody Map<String, String> data) {
        int userId = LoggedUserUtil.get().getId();

        int entityType = Integer.parseInt(data.get("entityType"));
        int entityId = Integer.parseInt(data.get("entityId"));

        followService.unfollow(userId, entityType, entityId);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/followee/count")
    Long findFolloweeCount(@RequestParam int userId, @RequestParam int entityType) {
        return followService.findFolloweeCount(userId, entityType);
    }

    @GetMapping("/follower/count")
    Long findFollowerCount(@RequestParam int entityType, @RequestParam int entityId) {
        return followService.findFollowerCount(entityType, entityId);
    }

    @GetMapping("/hasFollowed")
    boolean hasFollowed(@RequestParam int userId, @RequestParam int entityType, @RequestParam int entityId) {
        return followService.hasFollowed(userId, entityType, entityId);
    }

    @GetMapping("/followees/getList")
    List<Map<String, Object>> findFollowees(int userId, int offset, int limit) {
        return followService.findFollowees(userId, offset, limit);
    }

    @GetMapping("/followers/getList")
    List<Map<String, Object>> findFollowers(int userId, int offset, int limit) {
        return followService.findFollowers(userId, offset, limit);
    }

}
