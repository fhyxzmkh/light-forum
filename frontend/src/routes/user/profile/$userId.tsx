import { createFileRoute, redirect } from "@tanstack/react-router";
import useUserStore from "../../../store/userStore.ts";
import { useState, useEffect } from "react";
import {
  Tabs,
  TabsProps,
  Card,
  Avatar,
  Statistic,
  Row,
  Col,
  Divider,
  Button,
} from "antd";
import {
  UserOutlined,
  HeartOutlined,
  TeamOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../../config/axiosConfig.ts";

export const Route = createFileRoute("/user/profile/$userId")({
  beforeLoad: async () => {
    const { is_login } = useUserStore.getState(); // 获取当前的 is_login 状态
    if (!is_login) {
      throw redirect({ to: "/user/login" }); // 如果用户未登录，重定向到登录页面
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = useUserStore();
  const { userId } = Route.useParams();
  const [interviewUser, setInterviewUser] = useState<{
    id: number;
    username: string;
    avatar: string;
    createTime: string;
  }>();
  const [activeTab, setActiveTab] = useState<
    "my-profile" | "my-post" | "my-comment"
  >("my-profile");
  const [userLikeCount, setUserLikeCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  // 获取用户获得的点赞数
  const fetchUserLikeCount = async () => {
    try {
      const response = await axiosInstance.get("/like/user/count", {
        params: {
          userId: userId,
        },
      });
      setUserLikeCount(response.data);
    } catch (error) {
      console.error("获取用户点赞数失败:", error);
    }
  };

  // 获取访问的用户信息
  const fetchInterviewUser = async () => {
    try {
      const response = await axiosInstance.get("/user/profile", {
        params: {
          userId: userId,
        },
      });
      setInterviewUser(response.data);
    } catch (error) {
      console.error("获取用户信息失败:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "my-profile") {
      fetchUserLikeCount();
      fetchInterviewUser();
    }
  }, [activeTab, userId]);

  const tabItems: TabsProps["items"] = [
    {
      key: "my-profile",
      label: "个人信息",
    },
    {
      key: "my-post",
      label: "我的帖子",
    },
    {
      key: "my-comment",
      label: "我的评论",
    },
  ];

  const onTabChange = (key: string) => {
    setActiveTab(key as "my-profile" | "my-post" | "my-comment");
  };

  // 格式化时间
  const formatTime = (time: string | undefined) => {
    if (!time) return "";
    try {
      return new Date(time).toLocaleString("zh-CN");
    } catch {
      return "";
    }
  };

  // 处理关注/取消关注按钮点击
  const handleFollowClick = () => {
    // 暂时只切换状态，不实现实际逻辑
    setIsFollowing(!isFollowing);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "my-profile":
        return (
          <Card className="mt-4">
            <div className="flex flex-col items-center mb-6">
              <Avatar
                size={100}
                src={interviewUser?.avatar}
                icon={<UserOutlined />}
                className="mb-4"
              />
              <h2 className="text-2xl font-bold">{interviewUser?.username}</h2>
              <p className="text-gray-500">
                注册时间: {formatTime(interviewUser?.createTime)}
              </p>

              {parseInt(userId) !== id && (
                <Button
                  type={isFollowing ? "default" : "primary"}
                  icon={<UserAddOutlined />}
                  className="mt-4"
                  onClick={handleFollowClick}
                >
                  {isFollowing ? "取消关注" : "关注"}
                </Button>
              )}
            </div>

            <Divider />

            <Row gutter={24} className="text-center">
              <Col span={8}>
                <Statistic title="关注了" value={0} prefix={<TeamOutlined />} />
              </Col>
              <Col span={8}>
                <Statistic title="关注者" value={0} prefix={<TeamOutlined />} />
              </Col>
              <Col span={8}>
                <Statistic
                  title="获得的赞"
                  value={userLikeCount}
                  prefix={<HeartOutlined />}
                />
              </Col>
            </Row>
          </Card>
        );
      case "my-post":
        return <div className="mt-4">Ta的帖子内容（待实现）</div>;
      case "my-comment":
        return <div className="mt-4">Ta的评论内容（待实现）</div>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="w-full min-h-screen bg-gray-100 flex">
        <div className="w-3/5 bg-white mx-auto mt-5">
          <div className="p-4">
            <Tabs
              activeKey={activeTab}
              items={tabItems}
              onChange={onTabChange}
            />
            {renderTabContent()}
          </div>
        </div>
      </div>
    </>
  );
}
