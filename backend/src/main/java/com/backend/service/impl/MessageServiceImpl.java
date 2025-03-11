package com.backend.service.impl;

import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.backend.entity.dto.MessageDetailsDto;
import com.backend.entity.dto.MessageDto;
import com.backend.entity.pojo.Message;
import com.backend.entity.pojo.User;
import com.backend.mapper.MessageMapper;
import com.backend.mapper.UserMapper;
import com.backend.service.MessageService;
import com.backend.utils.LoggedUserUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.LinkedList;
import java.util.List;

@Service
public class MessageServiceImpl implements MessageService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private MessageMapper messageMapper;

    @Override
    public JSONObject getMessageList(Integer page, Integer pageSize) {
        User user = LoggedUserUtil.get();

        List<Message> messages = messageMapper
                .selectConversations(user.getId(), (page - 1) * pageSize, pageSize);

        JSONObject resp = new JSONObject();
        List<JSONObject> items = new LinkedList<>();

        for (Message message : messages) {
            MessageDto messageDto = new MessageDto();

            messageDto.setLatestMessage(message);
            messageDto.setHistoryTotal(messageMapper.selectLetterCount(message.getConversationId()));

            User fromUser = userMapper.selectById(message.getFromId());
            messageDto.setFromUserName(fromUser.getUsername());
            messageDto.setFromUserAvatar(fromUser.getAvatar());

            User toUser = userMapper.selectById(message.getToId());
            messageDto.setToUserName(toUser.getUsername());

            items.add(JSONObject.parseObject(JSON.toJSONString(messageDto)));
        }

        resp.put("conversations", items);
        resp.put("conversations_count", messageMapper.selectConversationCount(user.getId()));

        return resp;
    }

    @Override
    public ResponseEntity<Integer> getUnreadCount(String type) {
        if (StrUtil.isBlank(type) || (!type.equals("friend") && !type.equals("system"))) {
            return ResponseEntity.badRequest().build();
        }
        User user = LoggedUserUtil.get();
        if (type.equals("friend")) {
            return ResponseEntity.ok(
                    messageMapper.selectLetterUnreadCount(user.getId(), null)
            );
        }
        else {
            QueryWrapper<Message> queryWrapper = new QueryWrapper<>();
            QueryWrapper<Message> eq = queryWrapper.eq("from_id", 1)
                    .eq("status", 0)
                    .eq("to_id", user.getId());

            return ResponseEntity.ok(
                    Math.toIntExact(messageMapper.selectCount(queryWrapper))
            );
        }
    }

    @Override
    public JSONObject getMessageDetail(String conversationId, Integer page, Integer pageSize) {

        List<Message> letters = messageMapper.selectLetters(conversationId, (page - 1) * pageSize, pageSize);

        if (letters == null || letters.isEmpty()) {
            return null;
        }

        JSONObject resp = new JSONObject();
        User fromUser = userMapper.selectById(letters.get(0).getFromId());
        User toUser = userMapper.selectById(letters.get(0).getToId());

        MessageDetailsDto messageDetailsDto = new MessageDetailsDto();
        messageDetailsDto.setMessageList(letters);

        messageDetailsDto.setFromUserId(fromUser.getId());
        messageDetailsDto.setFromUserName(fromUser.getUsername());
        messageDetailsDto.setFromUserAvatar(fromUser.getAvatar());

        messageDetailsDto.setToUserId(toUser.getId());
        messageDetailsDto.setToUserName(toUser.getUsername());
        messageDetailsDto.setToUserAvatar(toUser.getAvatar());

        messageDetailsDto.setHistoryTotal(letters.size());

        resp.put("letters", messageDetailsDto);
        return resp;
    }

    @Override
    public ResponseEntity<String> markRead(String conversationId) {
        if (StrUtil.isBlank(conversationId)) {
            return ResponseEntity.badRequest().build();
        }

        messageMapper.updateMessageStatus(conversationId, LoggedUserUtil.get().getId(), 0, 1);

        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<String> sendMessage(Integer toId, String content) {
        if (StrUtil.isBlank(content)) {
            return ResponseEntity.badRequest().build();
        }

        User toUser = userMapper.selectById(toId);
        if (toUser == null) {
            return ResponseEntity.badRequest().build();
        }

        User fromUser = LoggedUserUtil.get();

        Message message = new Message();
        message.setContent(content);
        message.setStatus(0);
        message.setFromId(fromUser.getId());
        message.setToId(toId);
        message.setCreateTime(new Date());
        message.setConversationId(Math.min(fromUser.getId(), toId) + "_" + Math.max(fromUser.getId(), toId));

        messageMapper.insert(message);

        return ResponseEntity.ok().build();
    }

}
