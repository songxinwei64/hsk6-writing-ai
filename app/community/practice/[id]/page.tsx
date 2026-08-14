import Link from "next/link";
import { notFound } from "next/navigation";
import PracticeDiscussion from "../../../../components/practice-discussion";
import type { CommunityPost } from "../../../../lib/community";
import { getMembershipAccess } from "../../../../lib/membership";
import { PRACTICE_ACCESS } from "../../../../lib/practice-items";
import { createClient } from "../../../../utils/supabase/server";

export const dynamic = "force-dynamic";

const labels = {
  sentence: "句子缩写",
  paragraph: "短文缩写",
  mock: "HSK写作模拟",
} as const;

export default async function CommunityPracticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: item, error: itemError }, { data: posts, error: postsError }] = await Promise.all([
    supabase
      .from("practice_items")
      .select("id,practice_type,order_no,title,skill,tip")
      .eq("id", id)
      .eq("is_published", true)
      .maybeSingle(),
    supabase
      .from("community_posts")
      .select("id,user_id,post_type,practice_item_id,category,content,display_name,is_anonymous,created_at")
      .eq("practice_item_id", id)
      .eq("post_type", "practice_discussion")
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  ]);

  if (itemError || postsError) throw new Error(itemError?.message ?? postsError?.message ?? "Unable to load discussion.");
  if (!item) notFound();

  const practiceType = item.practice_type as keyof typeof PRACTICE_ACCESS;
  if (!(practiceType in PRACTICE_ACCESS)) notFound();
  const access = await getMembershipAccess();
  const limits = PRACTICE_ACCESS[practiceType];
  const allowedItems = access.isPaidMember ? limits.total : access.isAuthenticated ? limits.free : limits.guest;
  if (item.order_no > allowedItems) notFound();

  const label = labels[item.practice_type as keyof typeof labels] ?? "缩写练习";

  return (
    <main>
      <section className="discussion-shell">
        <Link className="back-link" href="/community/discussions">← 返回题目讨论区</Link>
        <header className="discussion-heading">
          <span className="eyebrow">{label} · 第{item.order_no}题</span>
          <h1>{item.title || item.skill || "讨论这道缩写题"}</h1>
          <p>{item.tip || "讨论这道题的主线、信息取舍和表达方法。"}</p>
          <div className="discussion-privacy-note">这里讨论解题思路。你的练习答案不会自动公开，只有你主动发表的内容才会出现在社区。</div>
        </header>
        <PracticeDiscussion practiceItemId={item.id} posts={(posts ?? []) as CommunityPost[]} />
      </section>
    </main>
  );
}
