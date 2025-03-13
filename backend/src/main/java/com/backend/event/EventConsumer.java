package com.backend.event;

import com.alibaba.fastjson.JSONObject;
import com.backend.entity.pojo.Event;
import com.backend.entity.pojo.Message;
import com.backend.es.EsService;
import com.backend.mapper.DiscussPostMapper;
import com.backend.mapper.MessageMapper;
import com.backend.service.MessageService;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static com.backend.entity.constant.CommunityConstant.*;

@Component
public class EventConsumer {

    private Logger logger = LoggerFactory.getLogger(EventConsumer.class);

    @Autowired
    private MessageMapper messageMapper;

    @Autowired
    private DiscussPostMapper discussPostMapper;

    @Autowired
    private EsService esService;

    @KafkaListener(topics = {TOPIC_COMMENT, TOPIC_LIKE, TOPIC_FOLLOW})
    public void handleCommentMessage(ConsumerRecord<String, String> record) {
        if (record == null || record.value() == null) {
            logger.error("消息的内容为空！");
            return;
        }

        Event event = JSONObject.parseObject(record.value(), Event.class);
        if (event == null) {
            logger.error("消息格式错误！");
            return;
        }

        // 发送站内通知
        Message message = new Message();
        message.setFromId(SYSTEM_USER_ID);
        message.setToId(event.getEntityUserId());
        message.setConversationId(event.getTopic());
        message.setStatus(0);
        message.setCreateTime(new Date());

        Map<String, Object> data = new HashMap<>();
        data.put("userId", event.getUserId());
        data.put("entityType", event.getEntityType());
        data.put("entityId", event.getEntityId());
        data.put("entityUserId", event.getEntityUserId());

        if (!event.getData().isEmpty()) {
            data.putAll(event.getData());
        }

        message.setContent(JSONObject.toJSONString(data));
        messageMapper.insert(message);
    }

    @KafkaListener(topics = {TOPIC_PUBLISH})
    public void handlePublishMessage(ConsumerRecord<String, String> record) {
        if (record == null || record.value() == null) {
            logger.error("消息的内容为空！");
            return;
        }

        Event event = JSONObject.parseObject(record.value(), Event.class);
        if (event == null) {
            logger.error("消息格式错误！");
            return;
        }

        // 向 ES 中存储帖子
        esService.saveDiscussPost(discussPostMapper.selectById(event.getEntityId()));
    }

}
