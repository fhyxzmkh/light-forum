package com.backend.entity.dto;

import com.backend.entity.pojo.Message;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageDto {
    Message latestMessage;

    String fromUserName;

    String fromUserAvatar;

    String toUserName;

    int historyTotal;
}
