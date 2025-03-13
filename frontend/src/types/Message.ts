export interface Message {
  id: number;
  fromId: number;
  toId: number;
  conversationId: string;
  content: string;
  status: number; // 0-未读;1-已读;2-删除;
  createTime: string;
}

export interface LatestMessage extends Message {}

export interface Conversation {
  fromUserName: string;
  toUserName: string;
  latestMessage: LatestMessage;
  historyTotal: number;
}

export interface MessageListResponse {
  conversations_count: number;
  conversations: Conversation[];
}

export interface MessageDetailsDto {
  messageList: Message[];
  fromUserId: number;
  fromUserName: string;
  fromUserAvatar: string;
  toUserId: number;
  toUserName: string;
  toUserAvatar: string;
  historyTotal: number;
}

export interface MessageDetailsResponse {
  letters: MessageDetailsDto;
}

export interface SystemMessage {
  id: number;
  userId: number;
  content: string;
  topic: string; // follow, like, comment
  createTime: string;
  status: number; // 0-未读;1-已读
}

export interface SystemNotice {
  topic: string;
  latestMessage: SystemMessage;
  count: number;
  unreadCount: number;
}

export interface SystemNoticeResponse {
  notices: SystemMessage[];
  notices_count: number;
}