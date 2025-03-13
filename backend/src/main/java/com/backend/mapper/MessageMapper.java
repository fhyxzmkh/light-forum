package com.backend.mapper;

import com.backend.entity.pojo.Message;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MessageMapper extends BaseMapper<Message> {

    /**
     * 以下方法用于私信功能
     */
    // 查询当前用户的会话列表，针对每个会话只返回一条最新的私信
    List<Message> selectConversations(int userId, int offset, int limit);

    // 查询当前用户的会话数量
    int selectConversationCount(int userId);

    // 查询某个会话所包含的私信列表
    List<Message> selectLetters(String conversationId, int offset, int limit);

    // 查询某个会话所包含的私信数量
    int selectLetterCount(String conversationId);

    // 查询未读私信的数量
    int selectLetterUnreadCount(int userId, String conversationId);

    // 更新消息的状态
    int updateMessageStatus(String conversationId, int currentLoggedUserId, int fromStatus, int toStatus);

    /**
     * 以下方法用于系统通知消息
     */
    // 查询某个topic下最新的通知
    Message selectLatestMessage(int userId, String topic);

    // 查询某个topic所包含的通知数量
    int selectNoticeCount(int userId, String topic);

    // 查询未读的通知数量，不传topic则是查全部类型的未读通知总和
    int selectNoticeUnreadCount(int userId, String topic);

    // 查询某个topic所包含的消息列表
    List<Message> selectNotices(String conversationId, int offset, int limit);
}
