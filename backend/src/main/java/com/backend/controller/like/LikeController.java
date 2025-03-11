package com.backend.controller.like;

import com.backend.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class LikeController {

    @Autowired
    private LikeService likeService;

    @PostMapping("/like/click")
    public void likeClick(@RequestBody Map<String, Integer> data) {
        Integer entityType = data.get("entityType");
        Integer entityId = data.get("entityId");
        Integer entityUserId = data.get("entityUserId");

        likeService.like(entityType, entityId, entityUserId);
    }

    @GetMapping("/like/entity/count")
    Long findEntityLikeCount(@RequestParam int entityType, @RequestParam int entityId) {
        return likeService.findEntityLikeCount(entityType, entityId);
    }

    @GetMapping("/like/entity/status")
    Integer findEntityLikeStatus(@RequestParam int entityType, @RequestParam int entityId) {
        return likeService.findEntityLikeStatus(entityType, entityId);
    }

    @GetMapping("/like/user/count")
    Integer findUserLikeCount(@RequestParam int userId) {
        return likeService.findUserLikeCount(userId);
    }
}
