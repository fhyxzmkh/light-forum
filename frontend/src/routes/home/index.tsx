import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import useUserStore from "../../store/userStore.ts";
import axiosInstance from "../../config/axiosConfig.ts";
import { useEffect, useState } from "react";
import {
  Tabs,
  Pagination,
  List,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  FormProps,
  message,
} from "antd";
import type { TabsProps } from "antd";
import { DiscussPost, DiscussPostResponse } from "../../types/DiscussPost.ts";

const { TextArea } = Input;

export const Route = createFileRoute("/home/")({
  beforeLoad: async () => {
    const { is_login } = useUserStore.getState(); // 获取当前的 is_login 状态
    if (!is_login) {
      throw redirect({ to: "/user/login" }); // 如果用户未登录，重定向到登录页面
    }
  },
  component: RouteComponent,
});

type FieldType = {
  title?: string;
  content?: string;
};

function RouteComponent() {
  const [discussPosts, setDiscussPosts] = useState<DiscussPost[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"latest" | "hottest">("latest");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const navigate = useNavigate();

  // 获取帖子点赞数
  const fetchLikeCounts = async (posts: DiscussPost[]) => {
    try {
      const likesData: Record<number, number> = {};

      // 为每个帖子获取点赞数
      for (const post of posts) {
        const response = await axiosInstance.get("/like/entity/count", {
          params: {
            entityType: 1, // 1表示帖子
            entityId: post.id,
          },
        });
        likesData[post.id] = response.data;
      }

      setLikeCounts(likesData);
    } catch (error) {
      console.error("Error fetching like counts:", error);
    }
  };

  // 获取数据
  const fetchData = async (
    page: number,
    size: number,
    sortBy: "latest" | "hottest"
  ) => {
    try {
      const response = await axiosInstance.get<DiscussPostResponse>(
        "/discussPost/getList",
        {
          params: {
            page: page,
            pageSize: size,
            sortBy: sortBy,
          },
        }
      );

      // console.log(response.data);
      setDiscussPosts(response.data.discuss_posts);
      setTotalPosts(response.data.discuss_posts_count);

      // 获取帖子的点赞数
      fetchLikeCounts(response.data.discuss_posts);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // 初始化时触发
  useEffect(() => {
    fetchData(currentPage, pageSize, activeTab);
  }, []);

  // 切换 Tab 时触发
  const onTabChange = (key: string) => {
    setActiveTab(key as "latest" | "hottest");
    fetchData(1, pageSize, key as "latest" | "hottest");
  };

  // 分页变化时触发
  const onPageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
    fetchData(page, size, activeTab);
  };

  // Tab 配置
  const tabItems: TabsProps["items"] = [
    {
      key: "latest",
      label: "最新",
    },
    {
      key: "hottest",
      label: "最热",
    },
  ];

  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    // console.log("Success:", values);

    axiosInstance
      .post("/discussPost/add", {
        title: values.title,
        content: values.content,
      })
      .then((response) => {
        console.log(response);
        message.info("发布成功");
        setIsModalOpen(false);
        fetchData(currentPage, pageSize, activeTab);
      })
      .catch((error) => {
        console.error("Error adding post:", error);
      });
  };

  const handleClickPost = (postId: number) => {
    navigate({
      to: `/home/details/${postId}`,
    });
  };

  return (
    <>
      <div className="w-full min-h-screen bg-gray-100 flex">
        <div className="w-3/5 bg-white mx-auto mt-5">
          <div className="p-4">
            {/* Tabs */}
            <div className="flex justify-between items-center">
              <Tabs
                activeKey={activeTab}
                items={tabItems}
                onChange={onTabChange}
              />
              <Button type="primary" onClick={() => setIsModalOpen(true)}>
                我要发布
              </Button>
            </div>

            {/* 帖子列表 */}
            <List
              dataSource={discussPosts}
              renderItem={(post) => (
                <List.Item
                  key={post.id}
                  onClick={() => handleClickPost(post.id)}
                >
                  <List.Item.Meta
                    title={
                      <Typography.Text strong className="cursor-pointer">
                        {post.title}
                      </Typography.Text>
                    }
                    description={
                      <>
                        {/*<Typography.Text>{post.content}</Typography.Text>*/}
                        {/*<br />*/}
                        <Typography.Text type="secondary">
                          <div className="flex justify-between">
                            <div>
                              发布时间:{" "}
                              {new Date(post.createTime).toLocaleString()}
                            </div>
                            <div>
                              点赞数: {likeCounts[post.id] || 0} &emsp; 评论数:{" "}
                              {post.commentCount}
                            </div>
                          </div>
                        </Typography.Text>
                      </>
                    }
                  />
                </List.Item>
              )}
            />

            {/* 分页 */}
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalPosts}
              onChange={onPageChange}
              showSizeChanger
              pageSizeOptions={["10", "20", "30", "50"]}
              align="center"
              style={{ marginTop: 16, textAlign: "center" }}
            />
          </div>
        </div>
      </div>
      <Modal
        title="发个帖子"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose={true}
      >
        <div className="p-4">
          <Form name="addForm" onFinish={onFinish}>
            <Form.Item<FieldType>
              label="标题"
              name="title"
              rules={[{ required: true, message: "Please input title!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item<FieldType>
              label="内容"
              name="content"
              rules={[{ required: true, message: "Please input content!" }]}
            >
              <TextArea rows={10} />
            </Form.Item>

            <Form.Item label={null}>
              <Button type="primary" htmlType="submit" className="float-right">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
}
