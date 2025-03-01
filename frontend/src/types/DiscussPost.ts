export type DiscussPost = {
  id: number;
  userId: string;
  title: string;
  content: string;
  type: number;
  status: number;
  createTime: string;
  commentCount: number;
  score: number;
};

export type DiscussPostResponse = {
  discuss_posts: DiscussPost[];
  discuss_posts_count: number;
};
