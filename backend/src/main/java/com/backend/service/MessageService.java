package com.backend.service;

import com.alibaba.fastjson.JSONObject;
import org.springframework.http.ResponseEntity;

public interface MessageService {

    /**
     * 以下方法用于私信功能
     */
    JSONObject getMessageList(Integer page, Integer pageSize);

    ResponseEntity<Integer> getUnreadCount(String type);

    JSONObject getMessageDetail(String conversationId, Integer page, Integer pageSize);

    ResponseEntity<String> markRead(String conversationId);

    ResponseEntity<String> sendMessage(Integer toId, String content);

    /**
     * 以下方法用于系统通知功能
     */
    JSONObject getSystemNotices(String conversationId, Integer page, Integer pageSize);
}
