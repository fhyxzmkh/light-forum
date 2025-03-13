import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import {
  Tabs,
  TabsProps,
  Button,
  List,
  Pagination,
  Empty,
  Spin,
  Badge,
  Modal,
  Form,
  Input,
  message,
  Card,
  Tag,
} from "antd";
import { useEffect, useState } from "react";
import useUserStore from "../../store/userStore.ts";
import axiosInstance from "../../config/axiosConfig.ts";
import {
  Conversation,
  MessageListResponse,
  SystemNotice,
  SystemMessage,
} from "../../types/Message.ts";

export const Route = createFileRoute("/message/")({
  beforeLoad: async () => {
    const { is_login } = useUserStore.getState(); // 获取当前的 is_login 状态
    if (!is_login) {
      throw redirect({ to: "/user/login" }); // 如果用户未登录，重定向到登录页面
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { username } = useUserStore.getState();
  const [activeTab, setActiveTab] = useState<"friends" | "system">("friends");
  const [messageData, setMessageData] = useState<MessageListResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [unreadFriendCount, setUnreadFriendCount] = useState(0);
  const [unreadSystemCount, setUnreadSystemCount] = useState(0);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [form] = Form.useForm();

  const [systemNotices, setSystemNotices] = useState<SystemNotice[]>([]);
  const [systemNoticesLoading, setSystemNoticesLoading] = useState(false);

  const onTabChange = (key: string) => {
    setActiveTab(key as "friends" | "system");
  };

  // 获取未读消息数量
  const fetchUnreadCount = async () => {
    try {
      // 获取朋友私信未读数量
      const friendResponse = await axiosInstance.get(
        "/message/getUnreadCount",
        {
          params: { type: "friend" },
        }
      );
      if (friendResponse.data) {
        setUnreadFriendCount(friendResponse.data);
      }

      // 获取所有系统消息未读数量
      const totalUnreadResponse = await axiosInstance.get(
        "/notice/unread/count",
        {
          params: {
            userId: useUserStore.getState().id,
            topic: "", // 空字符串表示查询所有类型的未读通知
          },
        }
      );
      if (totalUnreadResponse.data) {
        setUnreadSystemCount(totalUnreadResponse.data);
      }
    } catch (error) {
      console.error("获取未读消息数量失败:", error);
    }
  };

  const tabItems: TabsProps["items"] = [
    {
      key: "friends",
      label: (
        <Badge count={unreadFriendCount} size="small" offset={[5, 0]}>
          <span>朋友私信</span>
        </Badge>
      ),
    },
    {
      key: "system",
      label: (
        <Badge count={unreadSystemCount} size="small" offset={[5, 0]}>
          <span>系统消息</span>
        </Badge>
      ),
    },
  ];

  // 获取消息列表
  const fetchMessageList = async (
    tab: "friends" | "system",
    page: number,
    size: number
  ) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/message/getList", {
        params: {
          type: tab === "friends" ? 1 : 2, // 1代表朋友私信，2代表系统通知
          page: page,
          pageSize: size,
        },
      });
      setMessageData(response.data);
    } catch (error) {
      console.error("获取消息列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 获取消息列表
    const fetchData = async () => {
      if (activeTab === "friends") {
        await fetchMessageList(activeTab, currentPage, pageSize);
      } else {
        await fetchSystemNotices();
      }
    };

    fetchData();
    fetchUnreadCount(); // 获取未读消息数量
  }, [activeTab, currentPage, pageSize]);

  // 定期刷新未读消息数量（每30秒）
  useEffect(() => {
    const intervalId = setInterval(fetchUnreadCount, 30000);

    // 组件卸载时清除定时器
    return () => clearInterval(intervalId);
  }, []);

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
  };

  const handleConversationClick = (conversation: Conversation) => {
    navigate({
      to: `/message/details/${conversation.latestMessage.conversationId}`,
    });
  };

  // 显示发送私信模态框
  const showSendMessageModal = () => {
    setIsModalVisible(true);
    form.resetFields();
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // 发送私信
  const handleSendMessage = async (values: {
    toId: string;
    content: string;
  }) => {
    setSendingMessage(true);
    try {
      await axiosInstance.post("/message/send", {
        toId: parseInt(values.toId),
        content: values.content,
      });

      message.success("私信发送成功");
      setIsModalVisible(false);
      form.resetFields();

      // 刷新消息列表
      await fetchMessageList(activeTab, 1, pageSize);
      fetchUnreadCount();
    } catch (error) {
      console.error("发送私信失败:", error);
      message.error("发送私信失败，请稍后重试");
    } finally {
      setSendingMessage(false);
    }
  };

  const fetchSystemNotices = async () => {
    setSystemNoticesLoading(true);
    try {
      const topics = ["follow", "like", "comment"];
      const notices: SystemNotice[] = [];

      for (const topic of topics) {
        let noticeItem: SystemNotice = {
          topic: topic,
          latestMessage: {} as SystemMessage,
          count: 0,
          unreadCount: 0,
        };

        try {
          // 获取最新通知
          const latestResponse = await axiosInstance.get("/notice/latest", {
            params: {
              userId: useUserStore.getState().id,
              topic: topic,
            },
          });

          if (latestResponse.data) {
            noticeItem.latestMessage = latestResponse.data;
          }

          // 获取通知数量
          const countResponse = await axiosInstance.get("/notice/count", {
            params: {
              userId: useUserStore.getState().id,
              topic: topic,
            },
          });
          noticeItem.count = countResponse.data || 0;

          // 获取未读通知数量
          const unreadResponse = await axiosInstance.get(
            "/notice/unread/count",
            {
              params: {
                userId: useUserStore.getState().id,
                topic: topic,
              },
            }
          );
          noticeItem.unreadCount = unreadResponse.data || 0;
        } catch (error) {
          console.error(`获取${topic}类型的系统消息失败:`, error);
        }

        notices.push(noticeItem);
      }

      setSystemNotices(notices);
    } catch (error) {
      console.error("获取系统消息失败:", error);
    } finally {
      setSystemNoticesLoading(false);
    }
  };

  // 辅助函数：获取消息主题对应的标签颜色和文本
  const getTopicTag = (topic: string) => {
    switch (topic) {
      case "follow":
        return { color: "blue", text: "关注" };
      case "like":
        return { color: "red", text: "点赞" };
      case "comment":
        return { color: "green", text: "评论" };
      default:
        return { color: "default", text: "未知" };
    }
  };

  // 解析消息内容
  const parseNoticeContent = (
    topic: string,
    contentStr: string
  ): { message: string; data: any } => {
    try {
      // 尝试解析JSON内容
      const data = JSON.parse(contentStr);
      let message = "未知消息";

      switch (topic) {
        case "follow":
          message = `编号为 ${data.userId} 的用户关注了你，快来看看吧~`;
          break;
        case "like":
          message = `编号为 ${data.userId} 的用户点赞了你的帖子，快来看看吧~`;
          break;
        case "comment":
          message = `编号为 ${data.userId} 的用户评论了你的帖子，快来看看吧~`;
          break;
      }

      return { message, data };
    } catch (error) {
      // 如果解析失败，直接返回原始内容
      console.error("解析消息内容失败:", error);
      return { message: contentStr, data: null };
    }
  };

  // 查看系统消息详情
  const handleSystemNoticeClick = (topic: string, data: any) => {
    if (!data) {
      message.info(`暂无${getTopicTag(topic).text}消息`);
      return;
    }

    switch (topic) {
      case "follow":
        navigate({
          to: "/message/notice/$conversationId",
          params: { conversationId: "follow" },
        });
        break;
      case "like":
        navigate({
          to: "/message/notice/$conversationId",
          params: { conversationId: "like" },
        });
        break;
      case "comment":
        navigate({
          to: "/message/notice/$conversationId",
          params: { conversationId: "comment" },
        });
        break;
      default:
        message.error(`查看${getTopicTag(topic).text}消息详情功能正在开发中`);
    }
  };

  return (
    <>
      <div className="w-full min-h-screen bg-gray-100 flex">
        <div className="w-3/5 bg-white mx-auto mt-5">
          <div className="p-4">
            <div className="w-full flex justify-between items-center">
              <Tabs
                className="min-w-2/3"
                activeKey={activeTab}
                items={tabItems}
                onChange={onTabChange}
              />
              <Button type="primary" onClick={showSendMessageModal}>
                发私信
              </Button>
            </div>

            {activeTab === "friends" && (
              <div className="mt-4">
                <Spin spinning={loading}>
                  {messageData && messageData.conversations.length > 0 ? (
                    <>
                      <List
                        itemLayout="vertical"
                        dataSource={messageData.conversations}
                        renderItem={(item) => (
                          <List.Item
                            key={item.latestMessage.conversationId}
                            className="border-b cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start">
                              {/* <Badge
                                dot={
                                  item.latestMessage.status === 0 &&
                                  username !== item.fromUserName
                                }
                                color="red"
                                offset={[-5, 5]}
                              >
                                <Avatar src={item.fromUserAvatar} size={48} />
                              </Badge> */}
                              <div
                                className="ml-4 flex-1"
                                onClick={() => handleConversationClick(item)}
                              >
                                <div className="flex justify-between">
                                  <span className="font-medium text-base">
                                    {item.latestMessage.status === 0 ? (
                                      <span className="flex items-center">
                                        您和{" "}
                                        {item.fromUserName === username
                                          ? ""
                                          : item.fromUserName}
                                        {item.toUserName === username
                                          ? ""
                                          : item.toUserName}{" "}
                                        的对话
                                        {username !== item.fromUserName && (
                                          <span className="ml-2 w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                                        )}
                                      </span>
                                    ) : (
                                      <span>
                                        您和{" "}
                                        {item.fromUserName === username
                                          ? ""
                                          : item.fromUserName}
                                        {item.toUserName === username
                                          ? ""
                                          : item.toUserName}{" "}
                                        的对话
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-gray-500 text-sm">
                                    {item.latestMessage.createTime}
                                  </span>
                                </div>
                                <div className="mt-1 text-gray-700 truncate">
                                  {item.latestMessage.status === 0 ? (
                                    <span className="font-semibold">
                                      {item.latestMessage.content}
                                    </span>
                                  ) : (
                                    item.latestMessage.content
                                  )}
                                </div>
                                <div className="mt-2 flex justify-between float-right">
                                  <span className="text-blue-500 text-sm">
                                    历史消息: {item.historyTotal}条
                                  </span>
                                </div>
                              </div>
                            </div>
                          </List.Item>
                        )}
                      />
                      <div className="mt-4 flex justify-center">
                        <Pagination
                          current={currentPage}
                          pageSize={pageSize}
                          total={messageData.conversations_count}
                          onChange={handlePageChange}
                          showSizeChanger
                          showQuickJumper
                          showTotal={(total) => `共 ${total} 条消息`}
                        />
                      </div>
                    </>
                  ) : (
                    <Empty description="暂无私信" />
                  )}
                </Spin>
              </div>
            )}

            {activeTab === "system" && (
              <div className="mt-4">
                <Spin spinning={systemNoticesLoading}>
                  {systemNotices && systemNotices.length > 0 ? (
                    <List
                      itemLayout="vertical"
                      dataSource={systemNotices}
                      renderItem={(item) => {
                        const parsedContent = item.latestMessage
                          ? parseNoticeContent(
                              item.topic,
                              item.latestMessage.content
                            )
                          : { message: "当前暂无新消息", data: null };

                        return (
                          <List.Item
                            key={item.topic}
                            className="border-b cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() =>
                              handleSystemNoticeClick(
                                item.topic,
                                parsedContent.data
                              )
                            }
                          >
                            <Card className="w-full">
                              <div className="flex items-start">
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <span className="font-medium text-base flex items-center">
                                      <Tag
                                        color={getTopicTag(item.topic).color}
                                      >
                                        {getTopicTag(item.topic).text}
                                      </Tag>
                                      {item.unreadCount > 0 && (
                                        <Badge
                                          count={item.unreadCount}
                                          size="small"
                                          offset={[5, 0]}
                                        />
                                      )}
                                    </span>
                                    <span className="text-gray-500 text-sm">
                                      {item.latestMessage?.createTime || ""}
                                    </span>
                                  </div>
                                  <div className="mt-2 text-gray-700">
                                    <p>{parsedContent.message}</p>
                                  </div>
                                  <div className="mt-2 text-blue-500 text-sm">
                                    {item.count > 0
                                      ? `共有 ${item.count} 条${getTopicTag(item.topic).text}消息`
                                      : `暂无${getTopicTag(item.topic).text}消息`}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </List.Item>
                        );
                      }}
                    />
                  ) : (
                    <Empty description="暂无系统消息" />
                  )}
                </Spin>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 发送私信模态框 */}
      <Modal
        title="发送私信"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSendMessage}>
          <Form.Item
            name="toId"
            label="接收者ID"
            rules={[
              { required: true, message: "请输入接收者ID" },
              { pattern: /^\d+$/, message: "ID必须为数字" },
            ]}
          >
            <Input placeholder="请输入接收者的用户ID" />
          </Form.Item>

          <Form.Item
            name="content"
            label="消息内容"
            rules={[
              { required: true, message: "请输入消息内容" },
              { max: 500, message: "消息内容不能超过500字" },
            ]}
          >
            <Input.TextArea
              placeholder="请输入要发送的消息内容"
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Button onClick={handleCancel} className="mr-2">
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={sendingMessage}>
              发送
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
