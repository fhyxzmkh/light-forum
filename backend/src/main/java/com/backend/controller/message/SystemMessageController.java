package com.backend.controller.message;

import cn.hutool.core.util.StrUtil;
import com.backend.entity.pojo.Message;
import com.backend.mapper.MessageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SystemMessageController {

    @Autowired
    private MessageMapper messageMapper;

    @GetMapping("/notice/latest")
    Message selectLatestMessage(@RequestParam int userId, @RequestParam String topic) {
        return messageMapper.selectLatestMessage(userId, topic);
    }

    @GetMapping("/notice/count")
    int selectNoticeCount(@RequestParam int userId, @RequestParam String topic) {
        return messageMapper.selectNoticeCount(userId, topic);
    }

    @GetMapping("/notice/unread/count")
    int selectNoticeUnreadCount(@RequestParam int userId, @RequestParam String topic) {
        if (StrUtil.isBlank(topic)) {
            return messageMapper.selectNoticeUnreadCount(userId, null);
        }
        return messageMapper.selectNoticeUnreadCount(userId, topic);
    }

}
