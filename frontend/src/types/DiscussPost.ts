export type DiscussPost = {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: number; // '0-普通; 1-置顶;'
  status: number; // '0-正常; 1-精华; 2-拉黑;'
  createTime: string;
  commentCount: number;
  likes: number;
};

export type DiscussPostResponse = {
  discuss_posts: DiscussPost[];
  discuss_posts_count: number;
};

export type DiscussPostDetails = {
  discussPost: DiscussPost;
  user_id: number;
  user_name: string;
  user_avatar: string;
  user_status: number;
  user_type: number;
};

export type DiscussPostComment = {
  createTime: string;
  id: number;
  user_id: number;
  user_name: string;
  user_avatar: string;
  content: string;
  status: number;
};

export type CommentComment = {
  createTime: string;
  id: number;
  content: string;
  status: number;
  comment_author_name: string;
  reply_to_user_name: string;
};