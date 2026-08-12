export type CommunityPost = {
  id: string;
  user_id: string;
  post_type: "wall" | "practice_discussion";
  practice_item_id: string | null;
  category: "check_in" | "insight" | "question" | "encouragement";
  content: string;
  display_name: string;
  is_anonymous: boolean;
  created_at: string;
};

export const communityCategoryLabels = {
  check_in: "今日打卡",
  insight: "学习心得",
  question: "遇到困难",
  encouragement: "给大家加油",
} as const;

export const officialWallPrompts = [
  "先找主线，再删除次要细节",
  "今天也认真完成一次缩写",
  "不怕写错，每次修改都是进步",
  "记住人物、事件、原因和结果",
  "坚持练习，表达会越来越准确",
  "写得更短，也要保留原来的意思",
  "一起准备HSK六级写作",
  "完成比完美更重要",
] as const;
