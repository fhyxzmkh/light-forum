package com.backend.controller.comment;

import com.alibaba.fastjson.JSONObject;
import com.backend.entity.pojo.Comment;
import com.backend.entity.pojo.DiscussPost;
import com.backend.entity.pojo.Event;
import com.backend.event.EventProducer;
import com.backend.mapper.CommentMapper;
import com.backend.mapper.DiscussPostMapper;
import com.backend.service.CommentService;
import com.backend.utils.LoggedUserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import static com.backend.entity.constant.CommunityConstant.*;

@RestController
public class CommentController {

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private CommentService commentService;

    @Autowired
    private EventProducer eventProducer;

    @Autowired
    private DiscussPostMapper discussPostMapper;

    @PostMapping("/comment/add")
    public ResponseEntity<String> addComment(@RequestBody Map<String, Object> data) {
        String content = (String) data.get("content");
        Integer entityType = (Integer) data.get("entity_type");
        Integer entityId = (Integer) data.get("entity_id");
        Integer targetId = (Integer) data.get("target_id");

        Event event = new Event();
        event.setTopic(TOPIC_COMMENT);
        event.setUserId(LoggedUserUtil.get().getId());
        event.setEntityType(entityType);
        event.setEntityId(entityId);

        if (entityType == ENTITY_TYPE_POST) {
            DiscussPost post = discussPostMapper.selectById(entityId);
            event.setEntityUserId(post.getUserId()); // 目标帖子的作者

            eventProducer.fireEvent(event);

            return commentService.addPostComment(content, entityId);
        }
        else if (entityType == ENTITY_TYPE_COMMENT) {
            // 评论的评论暂不通知
//            Comment comment = commentMapper.selectById(targetId);
//            event.setEntityUserId(comment.getUserId()); // 目标评论的作者
//
//            eventProducer.fireEvent(event);

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
