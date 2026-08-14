import Link from "next/link";
import QuestionLockIcon from "../../../components/question-lock-icon";
import { getMembershipAccess } from "../../../lib/membership";
import { PRACTICE_ACCESS } from "../../../lib/practice-items";
import { createClient } from "../../../utils/supabase/server";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 12;
const practiceLabels = {
  sentence: "句子缩写",
  paragraph: "短文缩写",
  mock: "HSK写作模拟",
} as const;
type PracticeType = keyof typeof practiceLabels;

const practiceOrder: Record<PracticeType, number> = { sentence: 0, paragraph: 1, mock: 2 };

function discussionHref(type: PracticeType | null, page: number) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/community/discussions${query ? `?${query}` : ""}`;
}

export default async function CommunityDiscussionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; page?: string }>;
}) {
  const { type, page } = await searchParams;
  const selectedType: PracticeType | null = type === "sentence" || type === "paragraph" || type === "mock" ? type : null;
  const requestedPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
  const supabase = await createClient();
  const access = await getMembershipAccess();

  let itemQuery = supabase
    .from("practice_items")
    .select("id,practice_type,order_no,title,skill")
    .eq("is_published", true);
  if (selectedType) itemQuery = itemQuery.eq("practice_type", selectedType);

  const [{ data: allPracticeItems, error: itemError }, { data: discussionPosts, error: discussionError }] = await Promise.all([
    itemQuery,
    supabase.from("community_posts").select("practice_item_id").eq("post_type", "practice_discussion").eq("status", "published"),
  ]);

  if (itemError || discussionError) throw new Error(itemError?.message ?? discussionError?.message ?? "Unable to load discussions.");

  const sortedItems = [...(allPracticeItems ?? [])].sort((a, b) => {
    const typeDifference = (practiceOrder[a.practice_type as PracticeType] ?? 99) - (practiceOrder[b.practice_type as PracticeType] ?? 99);
    return typeDifference || a.order_no - b.order_no;
  });
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const practiceItems = sortedItems.slice(start, start + ITEMS_PER_PAGE);

  const discussionCounts = new Map<string, number>();
  (discussionPosts ?? []).forEach((post) => {
    if (post.practice_item_id) discussionCounts.set(post.practice_item_id, (discussionCounts.get(post.practice_item_id) ?? 0) + 1);
  });

  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((number) => number === 1 || number === totalPages || Math.abs(number - currentPage) <= 2);

  return (
    <main className="page">
      <section className="discussions-index">
        <Link className="back-link" href="/community">← 返回学习社区</Link>
        <header className="discussions-index-heading">
          <span className="eyebrow">题目讨论区</span>
          <h1>{selectedType ? practiceLabels[selectedType] : "全部题目"}</h1>
          <p>全部练习题都会显示在这里。可讨论的题目范围与当前账号的练习权限一致；你的练习答案不会自动公开。</p>
        </header>

        <nav className="discussion-filter-row" aria-label="讨论题目分类">
          <Link className={!selectedType ? "active" : ""} href={discussionHref(null, 1)}>全部题目</Link>
          {(Object.keys(practiceLabels) as PracticeType[]).map((key) => (
            <Link className={selectedType === key ? "active" : ""} href={discussionHref(key, 1)} key={key}>{practiceLabels[key]}</Link>
          ))}
        </nav>

        <div className="discussion-list-summary">
          <span>共 {sortedItems.length} 道题</span>
          <small>第 {currentPage} / {totalPages} 页</small>
        </div>

        <div className="community-topic-grid discussions-full-grid discussions-with-sidebar">
          {practiceItems.map((item) => {
            const practiceType = item.practice_type as PracticeType;
            const label = practiceLabels[practiceType] ?? "缩写练习";
            const count = discussionCounts.get(item.id) ?? 0;
            const limits = PRACTICE_ACCESS[practiceType];
            const allowedItems = access.isPaidMember ? limits.total : access.isAuthenticated ? limits.free : limits.guest;
            const locked = item.order_no > allowedItems;
            const cardContent = (
              <>
                <div><span>{label} · {String(item.order_no).padStart(2, "0")}</span><small>{locked ? <><QuestionLockIcon /> 已锁定</> : count ? `${count} 条讨论` : "等待第一个想法"}</small></div>
                <h3>{item.title || item.skill || `${label}第${item.order_no}题`}</h3>
                <p>{locked ? (access.isAuthenticated ? "升级会员后可进入这道题的讨论。" : "登录后可按免费范围进入题目讨论。") : count ? "看看大家怎样判断这道题的信息主次。" : "提出一个问题，或者分享你的信息取舍。"}</p>
                <b>{locked ? (access.isAuthenticated ? "会员题目" : "需要登录") : "进入讨论"} <span>→</span></b>
              </>
            );

            return locked ? (
              <div className="community-topic-card locked" aria-disabled="true" key={item.id}>{cardContent}</div>
            ) : (
              <Link className="community-topic-card" href={`/community/practice/${item.id}`} key={item.id}>{cardContent}</Link>
            );
          })}
        </div>

        {totalPages > 1 && (
          <nav className="discussion-pagination" aria-label="讨论题目分页">
            <Link className={currentPage === 1 ? "disabled" : ""} aria-disabled={currentPage === 1} href={discussionHref(selectedType, Math.max(1, currentPage - 1))}>← 上一页</Link>
            <div>
              {visiblePages.map((pageNumber, index) => (
                <span key={pageNumber}>
                  {index > 0 && pageNumber - visiblePages[index - 1] > 1 && <i>…</i>}
                  <Link className={pageNumber === currentPage ? "active" : ""} href={discussionHref(selectedType, pageNumber)}>{pageNumber}</Link>
                </span>
              ))}
            </div>
            <Link className={currentPage === totalPages ? "disabled" : ""} aria-disabled={currentPage === totalPages} href={discussionHref(selectedType, Math.min(totalPages, currentPage + 1))}>下一页 →</Link>
          </nav>
        )}
      </section>
    </main>
  );
}
