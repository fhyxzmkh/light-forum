package com.backend.service;

import com.alibaba.fastjson.JSONObject;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface CommentService {

    ResponseEntity<String> addPostComment(String content, Integer entityId);

    ResponseEntity<String> addCommentComment(String content, Integer entityId, Integer targetId);

    JSONObject getSubComment(Integer commentId);

}
