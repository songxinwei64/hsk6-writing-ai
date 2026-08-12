import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";

export const dynamic = "force-dynamic";

const typeDetails = {
  sentence: { label: "句子缩写", href: "/practice/sentence" },
  paragraph: { label: "短文缩写", href: "/practice/paragraph" },
  mock: { label: "HSK写作模拟", href: "/practice/mock" },
} as const;

type PracticeType = keyof typeof typeDetails;

export default async function MyLibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/?auth=login&next=/my-library");

  const [{ data: items, error: itemError }, { data: attempts, error: attemptError }] = await Promise.all([
    supabase
      .from("practice_items")
      .select("id,practice_type,order_no,title")
      .eq("is_published", true)
      .order("practice_type")
      .order("order_no"),
    supabase
      .from("practice_attempts")
      .select("id,practice_item_id,answer_title,answer_text,status,completed_at,updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  if (itemError || attemptError) {
    throw new Error(itemError?.message ?? attemptError?.message ?? "Unable to load your practice records.");
  }

  const completedItemIds = new Set(
    attempts.filter((attempt) => attempt.status === "completed").map((attempt) => attempt.practice_item_id),
  );
  const itemById = new Map(items.map((item) => [item.id, item]));
  const progress = (Object.keys(typeDetails) as PracticeType[]).map((type) => {
    const typeItems = items.filter((item) => item.practice_type === type);
    const completed = typeItems.filter((item) => completedItemIds.has(item.id)).length;
    return { type, completed, total: typeItems.length, ...typeDetails[type] };
  });
  const totalCompleted = progress.reduce((sum, entry) => sum + entry.completed, 0);
  const totalItems = progress.reduce((sum, entry) => sum + entry.total, 0);
  const recentAttempts = attempts.slice(0, 8).map((attempt) => ({
    ...attempt,
    item: itemById.get(attempt.practice_item_id),
  })).filter((attempt) => attempt.item);

  return (
    <main className="page">
      <section className="my-library-shell">
        <div className="my-library-heading">
          <span className="eyebrow">Write HSK · 个人学习记录</span>
          <h1>我的题库</h1>
          <p>{user.email}，这里保存你的做题进度和写作记录。</p>
        </div>

        <div className="library-overview">
          <div>
            <small>总体进度</small>
            <strong>{totalCompleted}<span> / {totalItems}</span></strong>
            <p>已完成的不同题目</p>
          </div>
          <div className="library-overview-progress" aria-label={`总体完成 ${totalCompleted} / ${totalItems}`}>
            <span style={{ width: `${totalItems ? (totalCompleted / totalItems) * 100 : 0}%` }} />
          </div>
        </div>

        <div className="library-progress-grid">
          {progress.map((entry) => (
            <Link href={entry.href} className="library-progress-card" key={entry.type}>
              <div><span>{entry.label}</span><strong>{entry.completed} / {entry.total}</strong></div>
              <div className="library-card-track"><span style={{ width: `${entry.total ? (entry.completed / entry.total) * 100 : 0}%` }} /></div>
              <small>{entry.completed === entry.total && entry.total > 0 ? "已全部完成" : "继续练习 →"}</small>
            </Link>
          ))}
        </div>

        <section className="library-records">
          <div className="library-section-title">
            <div><span>写作记录</span><h2>最近完成的练习</h2></div>
            <small>每次重新提交都会保留一条新记录</small>
          </div>

          {recentAttempts.length ? (
            <div className="library-record-list">
              {recentAttempts.map((attempt) => {
                const item = attempt.item!;
                const details = typeDetails[item.practice_type as PracticeType];
                return (
                  <Link className="library-record" href={`/my-library/${attempt.id}`} key={attempt.id}>
                    <div>
                      <span>{details?.label ?? "缩写练习"}</span>
                      <h3>{item.title ?? `${details?.label ?? "练习"} ${item.order_no}`}</h3>
                      <p>{attempt.answer_title && <b>{attempt.answer_title} · </b>}{attempt.answer_text}</p>
                    </div>
                    <div className="library-record-meta">
                      <time>{new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(new Date(attempt.completed_at ?? attempt.updated_at))}</time>
                      <span aria-hidden="true">查看详情 →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="library-empty">
              <h3>还没有写作记录</h3>
              <p>完成并提交一次练习后，进度和答案会自动保存在这里。</p>
              <Link href="/practice">开始第一次练习</Link>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
