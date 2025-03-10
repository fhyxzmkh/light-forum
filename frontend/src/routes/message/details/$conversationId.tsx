import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import axiosInstance from "../../../config/axiosConfig.ts";
import useUserStore from "../../../store/userStore";
import { MessageDetailsResponse, Message } from "../../../types/Message.ts";
import {
  Avatar,
  Input,
  Button,
  Spin,
  Empty,
  Pagination,
  List,
  Typography,
  Badge,
} from "antd";
import { ArrowLeftOutlined, SendOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Title } = Typography;

export const Route = createFileRoute("/message/details/$conversationId")({
  beforeLoad: async () => {
    const { is_login } = useUserStore.getState(); // 获取当前的 is_login 状态
    if (!is_login) {
      throw redirect({ to: "/user/login" }); // 如果用户未登录，重定向到登录页面
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { conversationId } = Route.useParams();
  const { username } = useUserStore.getState();
  const [messageData, setMessageData] = useState<MessageDetailsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messagesMarkedAsRead, setMessagesMarkedAsRead] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { id: currentUserId, avatar: currentUserAvatar } = useUserStore();

  // 标记消息为已读
  const markMessagesAsRead = async () => {
    if (messagesMarkedAsRead) return;

    try {
      await axiosInstance.post("/message/markRead", null, {
        params: {
          conversationId: conversationId,
        },
      });
      setMessagesMarkedAsRead(true);
      // 刷新未读消息数量（如果有相关组件需要更新）
      // 这里可以添加一个事件或者回调函数来通知其他组件刷新未读消息数量
    } catch (error) {
      console.error("标记消息已读失败:", error);
    }
  };

  // 获取消息详情
  const fetchMessageDetails = async (page: number, size: number) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/message/getDetails", {
        params: {
          conversationId: conversationId,
          page: page,
          pageSize: size,
        },
      });
      setMessageData(response.data);

      // 只有在首次加载时标记消息为已读
      if (
        !messagesMarkedAsRead &&
        response.data &&
        response.data.letters &&
        response.data.letters.messageList.length > 0
      ) {
        await markMessagesAsRead();
      }
    } catch (error) {
      console.error("获取消息详情失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 首次加载时获取消息详情
  useEffect(() => {
    fetchMessageDetails(currentPage, pageSize);
    // 当conversationId变化时，重置标记状态
    return () => {
      setMessagesMarkedAsRead(false);
    };
  }, [conversationId]);

  // 当页码或页面大小变化时，重新获取消息
  useEffect(() => {
    if (messageData) {
      // 确保不是首次加载
      fetchMessageDetails(currentPage, pageSize);
    }
  }, [currentPage, pageSize]);

  // 滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messageData]);

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !messageData?.letters?.fromUserId) return;

    setSendingMessage(true);
    try {
      // 使用后端提供的发送消息接口
      await axiosInstance.post("/message/send", {
        toId:
          messageData.letters.fromUserName === username
            ? messageData.letters.toUserId
            : messageData.letters.fromUserId,
        content: newMessage.trim(),
      });

      // 发送成功后清空输入框并刷新消息列表
      setNewMessage("");
      fetchMessageDetails(1, pageSize); // 刷新到第一页以查看最新消息
      setCurrentPage(1);
    } catch (error) {
      console.error("发送消息失败:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  // 判断消息是否来自当前用户
  const isCurrentUserMessage = (message: Message) => {
    return message.fromId === currentUserId;
  };

  // 格式化时间
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <>
      <div className="w-full min-h-screen bg-gray-100 flex">
        <div
          className="w-3/5 bg-white mx-auto mt-5 rounded-lg shadow-sm overflow-hidden flex flex-col"
          style={{ height: "calc(100vh - 80px)" }}
        >
          {/* 头部 */}
          <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center">
              <Link
                to="/message"
                className="mr-3 text-gray-600 hover:text-blue-500"
              >
                <ArrowLeftOutlined />
              </Link>
              {messageData?.letters && (
                <div className="flex items-center">
                  <Title level={5} className="m-0 ml-2">
                    和{" "}
                    {messageData.letters.fromUserName === username
                      ? messageData.letters.toUserName
                      : messageData.letters.fromUserName}{" "}
                    的对话
                  </Title>
                </div>
              )}
            </div>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <Spin spinning={loading}>
              {messageData?.letters?.messageList &&
              messageData.letters.messageList.length > 0 ? (
                <>
                  <List
                    dataSource={messageData.letters.messageList}
                    renderItem={(item) => {
                      const isCurrentUser = isCurrentUserMessage(item);
                      return (
                        <List.Item
                          className={`border-0 p-2 ${isCurrentUser ? "flex justify-end" : "flex justify-start"}`}
                        >
                          <div
                            className={`w-full flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
                          >
                            {!isCurrentUser && (
                              <Avatar
                                src={
                                  messageData.letters.fromUserName === username
                                    ? messageData.letters.toUserAvatar
                                    : messageData.letters.fromUserAvatar
                                }
                                size={36}
                                className="mt-1"
                              />
                            )}
                            <div
                              className={`mx-2 flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
                            >
                              <div className="mb-1 text-xs text-gray-500">
                                {formatTime(item.createTime)}
                              </div>
                              <div
                                className={`p-3 rounded-lg ${
                                  isCurrentUser
                                    ? "bg-blue-500 text-white rounded-tr-none"
                                    : "bg-white text-gray-800 rounded-tl-none"
                                } shadow-sm`}
                              >
                                {item.content}
                              </div>
                              {item.status === 0 && !isCurrentUser && (
                                <Badge
                                  count="未读"
                                  size="small"
                                  className="mt-1"
                                  style={{ backgroundColor: "#ff4d4f" }}
                                />
                              )}
                            </div>
                            {isCurrentUser && (
                              <Avatar
                                src={currentUserAvatar}
                                size={36}
                                className="mt-1"
                              />
                            )}
                          </div>
                        </List.Item>
                      );
                    }}
                  />
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <Empty description="暂无消息记录" />
              )}
            </Spin>
          </div>

          {/* 分页 */}
          {messageData?.letters?.messageList &&
            messageData.letters.messageList.length > 0 && (
              <div className="p-2 flex justify-center border-t bg-white">
                <Pagination
                  simple
                  current={currentPage}
                  pageSize={pageSize}
                  total={messageData.letters.historyTotal}
                  onChange={handlePageChange}
                />
              </div>
            )}

          {/* 发送消息 */}
          <div className="p-3 border-t bg-white">
            <div className="flex">
              <TextArea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="输入消息..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                className="ml-2"
                onClick={handleSendMessage}
                loading={sendingMessage}
              >
                发送
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              按 Enter 发送消息，Shift + Enter 换行
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
