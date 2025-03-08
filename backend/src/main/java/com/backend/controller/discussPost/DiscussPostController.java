package com.backend.controller.discussPost;

import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson.JSONObject;
import com.backend.service.DiscussPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class DiscussPostController {

    @Autowired
    private DiscussPostService discussPostService;

    @GetMapping("/discussPost/getList")
    public JSONObject getDiscussPostList(
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "latest") String sortBy) {
        return discussPostService.getDiscussPostList(page, pageSize, sortBy);
    }

    @PostMapping("/discussPost/add")
    public ResponseEntity<String> addDiscussPost(@RequestBody Map<String, String> data) {
        String title = data.get("title");
        String content = data.get("content");

        if (StrUtil.isBlank(title) || StrUtil.isBlank(content)) {
            return ResponseEntity.badRequest().body("Title or content cannot be empty");
        }

        return discussPostService.addDiscussPost(title, content);
    }

    @GetMapping("/discussPost/details")
    public ResponseEntity<JSONObject> getPostDetails(@RequestParam Integer postId) {
        return discussPostService.getPostDetails(postId);
    }

    @GetMapping("/discussPost/getPostComment")
    public JSONObject getPostComment(
            @RequestParam Integer postId,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "5") Integer pageSize) {
        return discussPostService.getPostComments(postId, page, pageSize);
    }
}
