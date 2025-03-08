package com.backend.controller.comment;

import com.alibaba.fastjson.JSONObject;
import com.backend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import static com.backend.entity.constant.CommunityConstant.ENTITY_TYPE_COMMENT;
import static com.backend.entity.constant.CommunityConstant.ENTITY_TYPE_POST;

@RestController
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping("/comment/add")
    public ResponseEntity<String> addComment(@RequestBody Map<String, Object> data) {
        String content = (String) data.get("content");
        Integer entityType = (Integer) data.get("entity_type");
        Integer entityId = (Integer) data.get("entity_id");
        Integer targetId = (Integer) data.get("target_id");

        if (entityType == ENTITY_TYPE_POST) {
            return commentService.addPostComment(content, entityId);
        }
        else if (entityType == ENTITY_TYPE_COMMENT) {
            return commentService.addCommentComment(content, entityId, targetId);
        }
        else {
            return ResponseEntity.badRequest().body("非法的实体类型");
        }
    }

    @GetMapping("/comment/getSubComment")
    public JSONObject getSubComment(@RequestParam Integer commentId) {
        return commentService.getSubComment(commentId);
    }

}
