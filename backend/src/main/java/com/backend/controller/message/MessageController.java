package com.backend.controller.message;

import com.alibaba.fastjson.JSONObject;
import com.backend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class MessageController {

    @Autowired
    private MessageService messageService;

    @GetMapping("/message/getUnreadCount")
    ResponseEntity<Integer> getNotReadCount(@RequestParam String type) {
        return messageService.getUnreadCount(type);
    }

    @GetMapping("/message/getList")
    JSONObject getMessageList(
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize
    )
    {
        return messageService.getMessageList(page, pageSize);
    }

    @GetMapping("/message/getDetails")
    JSONObject getMessageDetail(
            @RequestParam("conversationId") String conversationId,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize
    )
    {
        return messageService.getMessageDetail(conversationId, page, pageSize);
    }

    @PostMapping("/message/markRead")
    ResponseEntity<String> markRead(@RequestParam("conversationId") String conversationId) {
        return messageService.markRead(conversationId);
    }

    @PostMapping("/message/send")
    ResponseEntity<String> sendMessage(@RequestBody Map<String, Object> data) {
        Integer toId = (Integer) data.get("toId");
        String content = (String) data.get("content");
        return messageService.sendMessage(toId, content);
    }

    @GetMapping("/message/notice")
    JSONObject getSystemNotices(
            @RequestParam("conversationId") String conversationId,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize
    )
    {
        return messageService.getSystemNotices(conversationId, page, pageSize);
    }

}
