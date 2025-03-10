package com.backend.entity.dto;

import com.backend.entity.pojo.Message;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageDetailsDto {

    List<Message> messageList;

    Integer fromUserId;

    String fromUserName;

    String fromUserAvatar;

    Integer toUserId;

    String toUserName;

    String toUserAvatar;

    int historyTotal;

}
