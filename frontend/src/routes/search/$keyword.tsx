import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import axiosConfig from "../../config/axiosConfig";
import { List, Typography, Space, Tag, Avatar, Pagination } from "antd";
import {
  LikeOutlined,
  CommentOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import useUserStore from "../../store/userStore";

export const Route = createFileRoute("/search/$keyword")({
  beforeLoad: async () => {
    const { is_login } = useUserStore.getState(); // 获取当前的 is_login 状态
    if (!is_login) {
      throw redirect({ to: "/user/login" }); // 如果用户未登录，重定向到登录页面
    }
  },
  component: RouteComponent,
});

interface SearchResult {
  post: {
    id: number;
    userId: number;
    title: string;
    content: string;
    type: number;
    status: number;
    createTime: string;
    commentCount: number;
    score: number;
  };
  author: string;
  likes: number;
}

function RouteComponent() {
  const { keyword } = Route.useParams();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchSearchResults = (page: number, size: number) => {
    setLoading(true);
    axiosConfig
      .get(`/search`, {
        params: {
          keyword,
          current: page,
          limit: size,
        },
      })
      .then((res) => {
        setSearchResults(res.data.search_result || []);
        // 假设后端返回了总数据量，如果没有，这里可能需要调整
        setTotal(res.data.total);
        setLoading(false);
      })
      .catch((error) => {
        console.error("搜索请求失败:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    setCurrentPage(1); // 关键词变化时重置页码
    fetchSearchResults(1, pageSize);
  }, [keyword, pageSize]);

  // 处理页码变化
  const handlePageChange = (page: number, pageSizeParam?: number) => {
    const newPageSize = pageSizeParam || pageSize;
    setCurrentPage(page);
    if (pageSizeParam) {
      setPageSize(pageSizeParam);
    }
    fetchSearchResults(page, newPageSize);
  };

  // 处理高亮显示的HTML内容
  const createMarkup = (html: string) => {
    return { __html: html };
  };

  return (
    <>
      <div className="w-full min-h-screen bg-gray-100 flex">
        <div className="w-3/5 bg-white mx-auto mt-5 p-4 mb-5 rounded-lg shadow-sm">
          <Typography.Title level={4} className="mb-4">
            搜索关键词: <Tag color="blue">{keyword}</Tag>
          </Typography.Title>

          <List
            itemLayout="vertical"
            size="large"
            loading={loading}
            dataSource={searchResults}
            renderItem={(item) => (
              <List.Item
                key={item.post.id}
                actions={[
                  <Space key="likes">
                    <LikeOutlined /> {item.likes} 赞
                  </Space>,
                  <Space key="comments">
                    <CommentOutlined /> {item.post.commentCount} 评论
                  </Space>,
                  <Space key="date">
                    <ClockCircleOutlined />{" "}
                    {dayjs(item.post.createTime).format("YYYY-MM-DD HH:mm")}
                  </Space>,
                ]}
                extra={
                  item.post.type === 1 ? (
                    <Tag color="red" className="font-bold">
                      置顶
                    </Tag>
                  ) : null
                }
              >
                <Link
                  to="/home/details/$postId"
                  params={{ postId: item.post.id.toString() }}
                  className="hover:text-blue-500"
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <div className="text-lg font-bold">
                        <span
                          dangerouslySetInnerHTML={createMarkup(
                            item.post.title
                          )}
                        />
                      </div>
                    }
                    description={
                      <span className="text-gray-500">
                        <UserOutlined className="mr-1" /> {item.author}
                      </span>
                    }
                  />
                  <div className="mt-2 text-gray-700">
                    <span
                      dangerouslySetInnerHTML={createMarkup(item.post.content)}
                    />
                  </div>
                </Link>
              </List.Item>
            )}
            locale={{ emptyText: "暂无搜索结果" }}
            pagination={false}
          />

          {total > 0 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                onChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(totalItems) => `共 ${totalItems} 条结果`}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
