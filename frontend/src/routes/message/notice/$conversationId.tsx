import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import useUserStore from "../../../store/userStore";
import { useEffect, useState } from "react";
import axiosInstance from "../../../config/axiosConfig";
import {
  List,
  Pagination,
  Card,
  Empty,
  Spin,
  message,
  Badge,
  Typography,
  Avatar,
  Space,
  Tooltip,
} from "antd";
import { SystemMessage } from "../../../types/Message";
import {
  LikeOutlined,
  CommentOutlined,
  UserAddOutlined,
  BellOutlined,
  ReadOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// 扩展SystemMessage类型，添加UI相关属性
interface ExtendedSystemMessage extends SystemMessage {
  message?: string;
  link?: string;
  icon?: React.ReactNode;
  color?: string;
}

export const Route = createFileRoute("/message/notice/$conversationId")({
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
  const navigate = useNavigate();
  const [messagesMarkedAsRead, setMessagesMarkedAsRead] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState<ExtendedSystemMessage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 获取消息类型标题和图标
  const getNoticeTypeInfo = () => {
    switch (conversationId) {
      case "like":
        return {
          title: "点赞通知",
          icon: <LikeOutlined style={{ fontSize: 24, color: "#f56a00" }} />,
        };
      case "comment":
        return {
          title: "评论通知",
          icon: <CommentOutlined style={{ fontSize: 24, color: "#1890ff" }} />,
        };
      case "follow":
        return {
          title: "关注通知",
          icon: <UserAddOutlined style={{ fontSize: 24, color: "#52c41a" }} />,
        };
      default:
        return {
          title: "系统通知",
          icon: <BellOutlined style={{ fontSize: 24, color: "#722ed1" }} />,
        };
    }
  };

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

      // 更新本地状态，将所有消息标记为已读
      setNotices((prevNotices) =>
        prevNotices.map((notice) => ({
          ...notice,
          status: 1,
        }))
      );
    } catch (error) {
      console.error("标记消息已读失败:", error);
      message.error("标记消息已读失败，请稍后再试");
    }
  };

  // 解析通知内容
  const parseNoticeContent = (
    content: string
  ): {
    message: string;
    link: string;
    icon: React.ReactNode;
    color: string;
  } => {
    try {
      const { entityId, userId } = JSON.parse(content);

      if (conversationId === "like") {
        return {
          message: `用户 #${userId} 点赞了你的帖子`,
          link: `/home/details/${entityId}`,
          icon: <LikeOutlined style={{ color: "#f56a00" }} />,
          color: "#fff2e8",
        };
      } else if (conversationId === "comment") {
        return {
          message: `用户 #${userId} 评论了你的帖子`,
          link: `/home/details/${entityId}`,
          icon: <CommentOutlined style={{ color: "#1890ff" }} />,
          color: "#e6f7ff",
        };
      } else if (conversationId === "follow") {
        return {
          message: `用户 #${userId} 关注了你`,
          link: `/user/profile/${userId}`,
          icon: <UserAddOutlined style={{ color: "#52c41a" }} />,
          color: "#f6ffed",
        };
      }
      return {
        message: "系统通知",
        link: "",
        icon: <BellOutlined style={{ color: "#722ed1" }} />,
        color: "#f9f0ff",
      };
    } catch (error) {
      console.error("解析消息内容失败:", error);
      return {
        message: "无法解析的通知",
        link: "",
        icon: <BellOutlined style={{ color: "#722ed1" }} />,
        color: "#f9f0ff",
      };
    }
  };

  // 获取消息详情
  const fetchSystemNotice = async (page: number, size: number) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/message/notice", {
        params: {
          conversationId: conversationId,
          page: page,
          pageSize: size,
        },
      });

      if (
        !messagesMarkedAsRead &&
        response.data &&
        response.data.notices &&
        response.data.notices.length > 0
      ) {
        await markMessagesAsRead();
      }

      const parsedNotices = response.data.notices.map((notice: any) => {
        const parsedContent = parseNoticeContent(notice.content);
        return { ...notice, ...parsedContent };
      });

      setNotices(parsedNotices);
      setTotal(response.data.notices_count || 0);
    } catch (error) {
      console.error("获取消息详情失败:", error);
      message.error("获取消息详情失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
    fetchSystemNotice(page, pageSize || 10);
  };

  // 处理点击通知事件
  const handleNoticeClick = (link: string) => {
    if (link) {
      navigate({ to: link });
    }
  };

  useEffect(() => {
    fetchSystemNotice(currentPage, pageSize);
  }, [conversationId]); // 当会话ID变化时重新获取

  const { title, icon } = getNoticeTypeInfo();

  // 获取通知项背景色
  const getNoticeItemBackground = (notice: ExtendedSystemMessage) => {
    // 只有未读消息(status=0)才显示背景色
    return notice.status === 0 && notice.color ? notice.color : "transparent";
  };

  // 获取通知项左边框
  const getNoticeItemBorderLeft = (notice: ExtendedSystemMessage) => {
    if (notice.status === 0 && notice.color) {
      const borderColor = notice.color.replace(
        /#([0-9a-f])([0-9a-f])([0-9a-f])$/,
        "#$1$1$2$2$3$3"
      );
      return `3px solid ${borderColor}`;
    }
    return "none";
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 py-8">
      <div className="w-4/5 max-w-4xl mx-auto">
        <Card
          className="shadow-md rounded-lg overflow-hidden mb-6"
          title={
            <Space size="middle">
              {icon}
              <Title level={4} style={{ margin: 0 }}>
                {title}
              </Title>
              {total > 0 && <Badge count={total} overflowCount={999} />}
            </Space>
          }
          extra={
            <Space>
              <Tooltip title="标记为已读">
                <Badge dot={!messagesMarkedAsRead}>
                  <ReadOutlined
                    style={{ fontSize: 18, cursor: "pointer" }}
                    onClick={markMessagesAsRead}
                  />
                </Badge>
              </Tooltip>
            </Space>
          }
        >
          <Spin spinning={loading} tip="加载中...">
            {notices.length > 0 ? (
              <List
                dataSource={notices}
                renderItem={(item) => (
                  <List.Item
                    key={item.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleNoticeClick(item.link || "")}
                    style={{
                      background: getNoticeItemBackground(item),
                      borderLeft: getNoticeItemBorderLeft(item),
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={item.icon}
                          className="flex items-center justify-center"
                          size="large"
                        />
                      }
                      title={
                        <Space>
                          <Text strong={item.status === 0}>{item.message}</Text>
                          {item.status === 0 && (
                            <Badge dot color="red" style={{ marginLeft: 4 }} />
                          )}
                        </Space>
                      }
                      description={
                        <Space>
                          <ClockCircleOutlined />
                          <Text type="secondary">{item.createTime}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={loading ? "加载中..." : "暂无通知消息"}
              />
            )}
          </Spin>
        </Card>

        {total > 0 && (
          <div className="flex justify-center mt-4">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `共 ${total} 条通知`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
