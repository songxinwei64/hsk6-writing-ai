import Link from "next/link";
import { notFound } from "next/navigation";
import PracticeDiscussion from "../../../../components/practice-discussion";
import type { CommunityPost } from "../../../../lib/community";
import { getMembershipAccess } from "../../../../lib/membership";
import { PRACTICE_ACCESS } from "../../../../lib/practice-items";
import { createClient } from "../../../../utils/supabase/server";

export const dynamic = "force-dynamic";

const labels = {
  sentence: "Sentence Summarization",
  paragraph: "Passage Summarization",
  mock: "HSK 6 Mock Test",
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

  const label = labels[item.practice_type as keyof typeof labels] ?? "Writing Practice";

  return (
    <main>
      <section className="discussion-shell">
        <Link className="back-link" href="/community/discussions">← Back to Exercise Discussions</Link>
        <header className="discussion-heading">
          <span className="eyebrow">{label} · Exercise {item.order_no}</span>
          <h1>{item.title || item.skill || "Discuss This Exercise"}</h1>
          <p>{item.tip || "Discuss the main thread, information selection, and wording."}</p>
          <div className="discussion-privacy-note">This space is for discussing your approach. Saved practice answers are never published automatically; only content you choose to post appears here.</div>
        </header>
        <PracticeDiscussion practiceItemId={item.id} posts={(posts ?? []) as CommunityPost[]} />
      </section>
    </main>
  );
}
