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
