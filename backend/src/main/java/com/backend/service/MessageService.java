package com.backend.service;

import com.alibaba.fastjson.JSONObject;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface MessageService {

    JSONObject getMessageList(Integer page, Integer pageSize);

    ResponseEntity<Integer> getUnreadCount(String type);

    JSONObject getMessageDetail(String conversationId, Integer page, Integer pageSize);

    ResponseEntity<String> markRead(String conversationId);

    ResponseEntity<String> sendMessage(Integer toId, String content);
}
