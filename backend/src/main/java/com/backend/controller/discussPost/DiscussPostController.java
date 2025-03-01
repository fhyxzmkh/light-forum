package com.backend.controller.discussPost;

import com.alibaba.fastjson.JSONObject;
import com.backend.service.DiscussPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DiscussPostController {

    @Autowired
    private DiscussPostService discussPostService;

    @GetMapping("/discussPostList/getList")
    public JSONObject getDiscussPostList(
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "latest") String sortBy) {
        return discussPostService.getDiscussPostList(page, pageSize, sortBy);
    }
}
