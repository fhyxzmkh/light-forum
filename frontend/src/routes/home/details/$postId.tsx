import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Card, Input, Button, message, List, Avatar, Modal } from "antd";
import { useEffect, useState } from "react";

import axiosInstance from "../../../config/axiosConfig.ts";
import useUserStore from "../../../store/userStore.ts";
import {
  DiscussPostDetails,
  DiscussPostComment,
  CommentComment,
} from "../../../types/DiscussPost.ts";
import { LikeOutlined, LikeFilled } from "@ant-design/icons";

// 格式化时间
const formatTime = (time: string | undefined) => {
  if (!time) return "";
  try {
    return new Date(time).toLocaleString("zh-CN");
  } catch {
    return "";
  }
};

export const Route = createFileRoute("/home/details/$postId")({
  beforeLoad: async () => {
    const { is_login } = useUserStore.getState(); // 获取当前的 is_login 状态
    if (!is_login) {
      throw redirect({ to: "/user/login" }); // 如果用户未登录，重定向到登录页面
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { postId } = Route.useParams();
  const navigate = useNavigate();
  const [discussPostDetails, setDiscussPostDetails] =
    useState<DiscussPostDetails>();
  const [commentContent, setCommentContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState<DiscussPostComment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 5;
  const [replyTo, setReplyTo] = useState<{
    commentId: number;
    userName: string;
  } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentComment, setCurrentComment] =
    useState<DiscussPostComment | null>(null);
  const [subComments, setSubComments] = useState<CommentComment[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [likeStatus, setLikeStatus] = useState(0); // 0-未点赞; 1-已点赞

  const fetchComments = (page: number) => {
    axiosInstance
      .get(`/discussPost/getPostComment`, {
        params: {
          postId,
          page,
          pageSize,
        },
      })
      .then((response) => {
        setComments(response.data.post_comments);
        setTotal(response.data.post_comments_count);
      });
  };

  const fetchSubComments = async (commentId: number) => {
    try {
      const response = await axiosInstance.get(
        `/comment/getSubComment?commentId=${commentId}`
      );
      setSubComments(response.data.sub_comments || []);
    } catch (error) {
      message.error("获取回复失败");
    }
  };

  // 获取点赞数量
  const fetchLikeCount = async () => {
    try {
      const response = await axiosInstance.get("/like/entity/count", {
        params: {
          entityType: 1, // 1表示帖子
          entityId: parseInt(postId),
        },
      });
      setLikeCount(response.data);
    } catch (error) {
      console.error("获取点赞数量失败:", error);
    }
  };

  // 获取点赞状态
  const fetchLikeStatus = async () => {
    try {
      const response = await axiosInstance.get("/like/entity/status", {
        params: {
          entityType: 1, // 1表示帖子
          entityId: parseInt(postId),
        },
      });
      setLikeStatus(response.data);
    } catch (error) {
      console.error("获取点赞状态失败:", error);
    }
  };

  // 点赞/取消点赞
  const handleLike = async () => {
    try {
      await axiosInstance.post("/like/click", {
        entityType: 1, // 1表示帖子
        entityId: parseInt(postId),
        entityUserId: discussPostDetails?.user_id,
      });

      // 更新点赞状态和数量
      fetchLikeStatus();
      fetchLikeCount();

      message.success(likeStatus === 1 ? "取消点赞成功" : "点赞成功");
    } catch (error) {
      console.error("点赞操作失败:", error);
      message.error("操作失败，请稍后再试");
    }
  };

  useEffect(() => {
    axiosInstance
      .get(`/discussPost/details?postId=${postId}`)
      .then((response) => {
        const data = response.data.post;
        const post: DiscussPostDetails = {
          discussPost: data.discussPost,
          user_id: data.id,
          user_name: data.username,
          user_avatar: data.avatar,
          user_status: data.status,
          user_type: data.type,
        };
        setDiscussPostDetails(post);

        // 获取点赞数量和状态
        fetchLikeCount();
        fetchLikeStatus();
      });

    fetchComments(1);
  }, []);

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      message.error("评论内容不能为空");
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post("/comment/add", {
        content: commentContent,
        entity_type: 1,
        entity_id: parseInt(postId),
      });

      message.success("评论发布成功");
      setCommentContent("");
      fetchComments(currentPage);
    } catch (error) {
      message.error("评论发布失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) {
      message.error("回复内容不能为空");
      return;
    }

    if (!currentComment && !replyTo) {
      message.error("回复对象不存在");
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post("/comment/add", {
        content: replyContent,
        entity_type: 2,
        entity_id: currentComment?.id, // 永远指向主评论的id
        target_id: replyTo?.commentId || currentComment?.id, // 如果是回复其他人的评论，则指向被回复的评论id
      });

      message.success("回复发布成功");
      setReplyContent("");
      setReplyTo(null);

      // 如果在模态框中，刷新子评论列表
      if (modalVisible && currentComment) {
        fetchSubComments(currentComment.id);
      } else {
        fetchComments(currentPage);
      }
    } catch (error) {
      message.error("回复发布失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenCommentDetail = async (comment: DiscussPostComment) => {
    setCurrentComment(comment);
    setModalVisible(true);
    await fetchSubComments(comment.id);
  };

  const handleUserClick = (userId: number | undefined) => {
    if (!userId) return;
    navigate({ to: `/user/profile/${userId}` });
  };

  return (
    <>
      <div className="w-full min-h-screen bg-gray-100 flex">
        <div className="w-3/5 bg-gray-100 mx-auto mt-5">
          <Card>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">
                  {discussPostDetails?.discussPost.title}
                </h2>
                <div className="text-gray-500 text-sm mb-4 flex items-center">
                  <span
                    className="mr-4 flex items-center hover:cursor-pointer hover:text-blue-500"
                    onClick={() => handleUserClick(discussPostDetails?.user_id)}
                  >
                    发布人：
                    {discussPostDetails?.user_name}
                  </span>
                  <span className="mx-4 flex items-center">
                    发布时间：
                    {formatTime(discussPostDetails?.discussPost.createTime)}
                  </span>
                  <span className="mx-4 flex items-center">
                    <Button
                      type="text"
                      icon={
                        likeStatus === 1 ? <LikeFilled /> : <LikeOutlined />
                      }
                      onClick={handleLike}
                      className={likeStatus === 1 ? "text-blue-500" : ""}
                    >
                      {likeCount}
                    </Button>
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">💬</span>
                    {discussPostDetails?.discussPost.commentCount}
                  </span>
                </div>
                <div className="flex gap-2 mb-4">
                  {discussPostDetails?.discussPost.type === 1 && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-md text-xs mr-2">
                      置顶
                    </span>
                  )}
                  {discussPostDetails?.discussPost.status === 1 && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs">
                      精华
                    </span>
                  )}
                </div>
                <div className="mt-4 text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {discussPostDetails?.discussPost.content}
                </div>
              </div>
            </div>
          </Card>

          <Card title={`${total} 条评论`} className="mt-4">
            <List
              itemLayout="vertical"
              dataSource={comments}
              className="comment-list"
              pagination={{
                onChange: (page) => {
                  setCurrentPage(page);
                  fetchComments(page);
                },
                current: currentPage,
                pageSize: pageSize,
                total: total,
                showSizeChanger: false,
              }}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  className="hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <div className="flex justify-between items-start w-full">
                    <div className="flex-1">
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            src={item.user_avatar}
                            className="border border-gray-200"
                          >
                            用户
                          </Avatar>
                        }
                        title={
                          <span className="font-medium">{item.user_name}</span>
                        }
                        description={formatTime(item.createTime)}
                      />
                      <div className="ml-12 mt-2 text-gray-700">
                        {item.content}
                      </div>
                    </div>
                    <div className="flex gap-4 ml-4">
                      <a
                        key="detail"
                        onClick={() => handleOpenCommentDetail(item)}
                        className="text-blue-500 hover:text-blue-600 cursor-pointer"
                      >
                        查看详情
                      </a>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>

          <Modal
            title={currentComment ? `${currentComment.user_name} 的评论` : ""}
            open={modalVisible}
            onCancel={() => {
              setModalVisible(false);
              setCurrentComment(null);
              setReplyTo(null);
              setReplyContent("");
            }}
            footer={null}
            width={700}
            className="comment-detail-modal"
          >
            {currentComment && (
              <div className="flex flex-col gap-4">
                <div className="border-b pb-4">
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={currentComment.user_avatar}
                        className="border border-gray-200"
                      >
                        用户
                      </Avatar>
                    }
                    title={
                      <span className="font-medium">
                        {currentComment.user_name}
                      </span>
                    }
                    description={formatTime(currentComment.createTime)}
                  />
                  <div className="ml-12 mt-2 text-gray-700">
                    {currentComment.content}
                  </div>
                </div>

                <List
                  itemLayout="vertical"
                  dataSource={subComments}
                  className="sub-comment-list"
                  renderItem={(item) => (
                    <List.Item
                      key={item.id}
                      className="hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className="flex-1 ml-12">
                          <span className="font-medium text-blue-600">
                            {item.comment_author_name}
                          </span>
                          {item.reply_to_user_name && (
                            <>
                              <span className="mx-2 text-gray-500">回复给</span>
                              <span className="font-medium text-blue-600">
                                {item.reply_to_user_name ===
                                item.comment_author_name
                                  ? "自己"
                                  : item.reply_to_user_name}
                              </span>
                            </>
                          )}
                          <span className="text-gray-400 text-sm ml-4">
                            {formatTime(item.createTime)}
                          </span>
                          <div className="mt-2 text-gray-700">
                            {item.content}
                          </div>
                        </div>
                        <div className="flex gap-4 ml-4">
                          <a
                            key="reply"
                            onClick={() => {
                              setReplyTo({
                                commentId: item.id,
                                userName: item.comment_author_name,
                              });
                            }}
                            className="text-blue-500 hover:text-blue-600 cursor-pointer whitespace-nowrap"
                          >
                            回复
                          </a>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />

                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <Input.TextArea
                    rows={3}
                    placeholder={
                      replyTo
                        ? `回复 ${replyTo.userName}...`
                        : "写下你的回复..."
                    }
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="resize-none"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    {replyTo && (
                      <Button
                        onClick={() => setReplyTo(null)}
                        className="hover:bg-gray-200"
                      >
                        取消回复
                      </Button>
                    )}
                    <Button
                      type="primary"
                      onClick={handleSubmitReply}
                      loading={submitting}
                      disabled={submitting || !replyContent.trim()}
                    >
                      发表回复
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Modal>

          <Card title="畅所欲言" className="mt-4">
            <div className="flex flex-col gap-4">
              <Input.TextArea
                rows={4}
                placeholder="写下你的评论..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button
                  type="primary"
                  onClick={handleSubmitComment}
                  loading={submitting}
                  disabled={submitting || !commentContent.trim()}
                >
                  发表评论
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
