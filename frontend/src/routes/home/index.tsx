import { createFileRoute, redirect } from "@tanstack/react-router";
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

  // 获取数据
  const fetchData = async (
    page: number,
    size: number,
    sortBy: "latest" | "hottest",
  ) => {
    try {
      const response = await axiosInstance.get<DiscussPostResponse>(
        "/discussPostList/getList",
        {
          params: {
            page: page,
            pageSize: size,
            sortBy: sortBy,
          },
        },
      );

      // console.log(response.data);
      setDiscussPosts(response.data.discuss_posts);
      setTotalPosts(response.data.discuss_posts_count);
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
    console.log("Success:", values);
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
                <List.Item key={post.id}>
                  <List.Item.Meta
                    title={
                      <Typography.Text strong>{post.title}</Typography.Text>
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
                              点赞数: {post.likes} &emsp; 评论数:{" "}
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
