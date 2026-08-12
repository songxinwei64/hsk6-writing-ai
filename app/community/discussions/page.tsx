import Link from "next/link";
import { createClient } from "../../../utils/supabase/server";

export const dynamic = "force-dynamic";

const practiceLabels = {
  sentence: "句子缩写",
  paragraph: "短文缩写",
  mock: "HSK写作模拟",
} as const;

export default async function CommunityDiscussionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const selectedType = type === "sentence" || type === "paragraph" || type === "mock" ? type : null;
  const supabase = await createClient();
  let itemQuery = supabase
    .from("practice_items")
    .select("id,practice_type,order_no,title,skill")
    .eq("is_published", true)
    .order("practice_type")
    .order("order_no")
    .limit(25);

  if (selectedType) itemQuery = itemQuery.eq("practice_type", selectedType);

  const [{ data: practiceItems, error: itemError }, { data: discussionPosts, error: discussionError }] = await Promise.all([
    itemQuery,
    supabase.from("community_posts").select("practice_item_id").eq("post_type", "practice_discussion").eq("status", "published"),
  ]);

  if (itemError || discussionError) throw new Error(itemError?.message ?? discussionError?.message ?? "Unable to load discussions.");

  const discussionCounts = new Map<string, number>();
  discussionPosts.forEach((post) => {
    if (post.practice_item_id) discussionCounts.set(post.practice_item_id, (discussionCounts.get(post.practice_item_id) ?? 0) + 1);
  });

  return (
    <main className="page">
      <section className="discussions-index">
        <Link className="back-link" href="/community">← 返回学习社区</Link>
        <header className="discussions-index-heading">
          <span className="eyebrow">题目讨论区</span>
          <h1>{selectedType ? practiceLabels[selectedType] : "全部题目"}</h1>
          <p>选择一道题，讨论主线、细节取舍和表达方法。你的练习答案不会自动公开。</p>
        </header>

        <div className="community-topic-grid discussions-full-grid discussions-with-sidebar">
          {practiceItems.map((item) => {
            const label = practiceLabels[item.practice_type as keyof typeof practiceLabels] ?? "缩写练习";
            const count = discussionCounts.get(item.id) ?? 0;
            return (
              <Link className="community-topic-card" href={`/community/practice/${item.id}`} key={item.id}>
                <div><span>{label} · {String(item.order_no).padStart(2, "0")}</span><small>{count ? `${count} 条讨论` : "等待第一个想法"}</small></div>
                <h3>{item.title || item.skill || `${label}第${item.order_no}题`}</h3>
                <p>{count ? "看看大家怎样判断这道题的信息主次。" : "提出一个问题，或者分享你的信息取舍。"}</p>
                <b>进入讨论 <span>→</span></b>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
