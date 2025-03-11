import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
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
  message,
  List,
  Pagination,
  Typography,
} from "antd";
import {
  UserOutlined,
  HeartOutlined,
  TeamOutlined,
  UserAddOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../../config/axiosConfig.ts";

// 用户信息接口
interface UserInfoDto {
  id: number;
  username: string;
  avatar: string;
}

// 关注/粉丝列表项接口
interface FollowItem {
  user: UserInfoDto;
  followTime: string;
  hasFollowed?: boolean;
}

// 帖子接口
interface Post {
  id: number;
  title: string;
  content: string;
  createTime: string;
}

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
  const navigate = useNavigate();
  const [interviewUser, setInterviewUser] = useState<{
    id: number;
    username: string;
    avatar: string;
    createTime: string;
  }>();
  const [activeTab, setActiveTab] = useState<
    "my-profile" | "my-post" | "my-followee" | "my-follower"
  >("my-profile");
  const [userLikeCount, setUserLikeCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followeeCount, setFolloweeCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);

  // 关注列表和粉丝列表相关状态
  const [followees, setFollowees] = useState<FollowItem[]>([]);
  const [followers, setFollowers] = useState<FollowItem[]>([]);
  const [followeePage, setFolloweePage] = useState(1);
  const [followerPage, setFollowerPage] = useState(1);
  const [followeeTotal, setFolloweeTotal] = useState(0);
  const [followerTotal, setFollowerTotal] = useState(0);
  const pageSize = 10; // 每页显示的数量

  // 帖子列表相关状态
  const [posts, setPosts] = useState<Post[]>([]);
  const [postPage, setPostPage] = useState(1);
  const [postTotal, setPostTotal] = useState(0);
  const postPageSize = 10; // 每页显示的帖子数量

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

  // 获取用户关注的数量
  const fetchFolloweeCount = async () => {
    try {
      const response = await axiosInstance.get("/followee/count", {
        params: {
          userId: userId,
          entityType: 3, // entityType为3表示用户
        },
      });
      setFolloweeCount(response.data);
    } catch (error) {
      console.error("获取用户关注数量失败:", error);
    }
  };

  // 获取用户的粉丝数量
  const fetchFollowerCount = async () => {
    try {
      const response = await axiosInstance.get("/follower/count", {
        params: {
          entityType: 3, // entityType为3表示用户
          entityId: userId,
        },
      });
      setFollowerCount(response.data);
    } catch (error) {
      console.error("获取用户粉丝数量失败:", error);
    }
  };

  // 检查当前用户是否已关注目标用户
  const checkFollowStatus = async () => {
    try {
      const response = await axiosInstance.get("/hasFollowed", {
        params: {
          userId: id, // 当前登录用户ID
          entityType: 3, // entityType为3表示用户
          entityId: userId, // 目标用户ID
        },
      });
      setIsFollowing(response.data);
    } catch (error) {
      console.error("获取关注状态失败:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "my-profile") {
      fetchUserLikeCount();
      fetchInterviewUser();
      fetchFolloweeCount();
      fetchFollowerCount();

      // 只有当查看的不是自己的主页时，才需要检查关注状态
      if (parseInt(userId) !== id) {
        checkFollowStatus();
      }
    } else if (activeTab === "my-followee") {
      fetchFollowees();
    } else if (activeTab === "my-follower") {
      fetchFollowers();
    } else if (activeTab === "my-post") {
      fetchUserPosts();
    }
  }, [activeTab, userId, id, followeePage, followerPage, postPage]);

  const tabItems: TabsProps["items"] = [
    {
      key: "my-profile",
      label: "个人信息",
    },
    {
      key: "my-post",
      label: `${parseInt(userId) !== id ? "Ta" : "我"}的帖子`,
    },
    {
      key: "my-followee",
      label: `${parseInt(userId) !== id ? "Ta" : "我"}的关注`,
    },
    {
      key: "my-follower",
      label: `${parseInt(userId) !== id ? "Ta" : "我"}的粉丝`,
    },
  ];

  const onTabChange = (key: string) => {
    setActiveTab(
      key as "my-profile" | "my-post" | "my-followee" | "my-follower"
    );
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
  const handleFollowClick = async () => {
    try {
      if (isFollowing) {
        // 取消关注
        await axiosInstance.post("/unfollow", {
          entityType: 3, // entityType为3表示用户
          entityId: userId,
        });
        message.success("已取消关注");
      } else {
        // 关注
        await axiosInstance.post("/follow", {
          entityType: 3, // entityType为3表示用户
          entityId: userId,
        });
        message.success("关注成功");
      }

      // 更新关注状态和粉丝数
      setIsFollowing(!isFollowing);
      fetchFollowerCount();
    } catch (error) {
      console.error("关注操作失败:", error);
      message.error("操作失败，请稍后重试");
    }
  };

  // 获取关注列表
  const fetchFollowees = async () => {
    try {
      const response = await axiosInstance.get("/followees/getList", {
        params: {
          userId: userId,
          offset: (followeePage - 1) * pageSize,
          limit: pageSize,
        },
      });

      // 设置关注列表数据
      setFollowees(
        response.data.map((item: any) => ({
          user: item.user,
          followTime: item.followTime,
          hasFollowed: item.hasFollowed,
        }))
      );

      // 设置总数量
      setFolloweeTotal(followeeCount);
    } catch (error) {
      console.error("获取关注列表失败:", error);
      message.error("获取关注列表失败，请稍后重试");
    }
  };

  // 获取粉丝列表
  const fetchFollowers = async () => {
    try {
      const response = await axiosInstance.get("/followers/getList", {
        params: {
          userId: userId,
          offset: (followerPage - 1) * pageSize,
          limit: pageSize,
        },
      });

      // 设置粉丝列表数据
      setFollowers(
        response.data.map((item: any) => ({
          user: item.user,
          followTime: item.followTime,
          hasFollowed: item.hasFollowed,
        }))
      );

      // 设置总数量
      setFollowerTotal(followerCount);
    } catch (error) {
      console.error("获取粉丝列表失败:", error);
      message.error("获取粉丝列表失败，请稍后重试");
    }
  };

  // 处理关注/取消关注用户列表中的用户
  const handleFollowUser = async (
    targetUserId: number,
    isFollowed: boolean,
    type: "followee" | "follower"
  ) => {
    try {
      if (isFollowed) {
        // 取消关注
        await axiosInstance.post("/unfollow", {
          entityType: 3, // entityType为3表示用户
          entityId: targetUserId,
        });
        message.success("已取消关注");
      } else {
        // 关注
        await axiosInstance.post("/follow", {
          entityType: 3, // entityType为3表示用户
          entityId: targetUserId,
        });
        message.success("关注成功");
      }

      // 更新列表状态
      if (type === "followee") {
        fetchFollowees();
      } else {
        fetchFollowers();
      }

      // 如果当前查看的是目标用户的个人资料，也需要更新关注状态
      if (parseInt(userId) === targetUserId) {
        setIsFollowing(!isFollowed);
        fetchFollowerCount();
      }
    } catch (error) {
      console.error("关注操作失败:", error);
      message.error("操作失败，请稍后重试");
    }
  };

  // 获取用户的帖子列表
  const fetchUserPosts = async () => {
    try {
      const response = await axiosInstance.get("/discussPost/getListByUserId", {
        params: {
          userId: userId,
          page: postPage,
          pageSize: postPageSize,
        },
      });

      // 设置帖子列表数据
      setPosts(response.data.my_posts);

      // 设置总数量
      setPostTotal(response.data.my_posts_count);
    } catch (error) {
      console.error("获取用户帖子列表失败:", error);
      message.error("获取帖子列表失败，请稍后重试");
    }
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
                <Statistic
                  title="关注了"
                  value={followeeCount}
                  prefix={<TeamOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="关注者"
                  value={followerCount}
                  prefix={<TeamOutlined />}
                />
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
        return (
          <div className="mt-4">
            <Card>
              <List
                itemLayout="vertical"
                dataSource={posts}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<FileTextOutlined style={{ fontSize: "20px" }} />}
                      title={
                        <h3
                          className="cursor-pointer hover:text-blue-500 hover:underline"
                          onClick={() => {
                            navigate({ to: `/home/details/${item.id}` });
                          }}
                        >
                          {item.title}
                        </h3>
                      }
                      description={`发布时间: ${formatTime(item.createTime)}`}
                    />
                    <Typography.Paragraph
                      ellipsis={{ rows: 2, expandable: false }}
                      className="mt-2"
                    >
                      {item.content}
                    </Typography.Paragraph>
                  </List.Item>
                )}
              />
              <div className="mt-4 flex justify-center">
                <Pagination
                  current={postPage}
                  pageSize={postPageSize}
                  total={postTotal}
                  onChange={(page) => setPostPage(page)}
                  showSizeChanger={false}
                />
              </div>
            </Card>
          </div>
        );
      case "my-followee":
        return (
          <div className="mt-4">
            <Card>
              <List
                itemLayout="horizontal"
                dataSource={followees}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={item.user.avatar}
                          icon={<UserOutlined />}
                        />
                      }
                      title={
                        <h3
                          className="cursor-pointer hover:text-blue-500 hover:underline font-bold"
                          onClick={() => {
                            navigate({ to: `/user/profile/${item.user.id}` });
                            setActiveTab("my-profile");
                          }}
                        >
                          {item.user.username}
                        </h3>
                      }
                      description={`关注时间: ${formatTime(item.followTime)}`}
                    />
                  </List.Item>
                )}
              />
              <div className="mt-4 flex justify-center">
                <Pagination
                  current={followeePage}
                  pageSize={pageSize}
                  total={followeeTotal}
                  onChange={(page) => setFolloweePage(page)}
                  showSizeChanger={false}
                />
              </div>
            </Card>
          </div>
        );
      case "my-follower":
        return (
          <div className="mt-4">
            <Card>
              <List
                itemLayout="horizontal"
                dataSource={followers}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={item.user.avatar}
                          icon={<UserOutlined />}
                        />
                      }
                      title={
                        <h3
                          className="cursor-pointer hover:text-blue-500 hover:underline font-bold"
                          onClick={() => {
                            navigate({ to: `/user/profile/${item.user.id}` });
                            setActiveTab("my-profile");
                          }}
                        >
                          {item.user.username}
                        </h3>
                      }
                      description={`关注时间: ${formatTime(item.followTime)}`}
                    />
                  </List.Item>
                )}
              />
              <div className="mt-4 flex justify-center">
                <Pagination
                  current={followerPage}
                  pageSize={pageSize}
                  total={followerTotal}
                  onChange={(page) => setFollowerPage(page)}
                  showSizeChanger={false}
                />
              </div>
            </Card>
          </div>
        );
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
