import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/server";

export const dynamic = "force-dynamic";

const typeDetails = {
  sentence: { label: "句子缩写", href: "/practice/sentence" },
  paragraph: { label: "短文缩写", href: "/practice/paragraph" },
  mock: { label: "HSK 6 写作模拟", href: "/practice/mock" },
} as const;

export default async function AttemptDetailPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/?auth=login&next=/my-library/${attemptId}`);

  const { data: attempt, error: attemptError } = await supabase
    .from("practice_attempts")
    .select("id,practice_item_id,answer_title,answer_text,completed_at,updated_at")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (attemptError) throw new Error(attemptError.message);
  if (!attempt) notFound();

  const { data: item, error: itemError } = await supabase
    .from("practice_items")
    .select("id,practice_type,order_no,title,skill,original_text,reference_title,reference_text,explanation")
    .eq("id", attempt.practice_item_id)
    .maybeSingle();

  if (itemError) throw new Error(itemError.message);
  if (!item) notFound();

  const details = typeDetails[item.practice_type as keyof typeof typeDetails];
  const label = details?.label ?? "缩写练习";
  const completedAt = attempt.completed_at ?? attempt.updated_at;

  return (
    <main className="page">
      <article className="attempt-detail-shell">
        <Link className="back-link" href="/my-library">← 返回我的题库</Link>
        <header className="attempt-detail-heading">
          <div>
            <span className="eyebrow">{label} · 第 {item.order_no} 题</span>
            <h1>{item.title || item.skill || label}</h1>
          </div>
          <time>{new Intl.DateTimeFormat("zh-CN", { dateStyle: "long", timeStyle: "short" }).format(new Date(completedAt))}</time>
        </header>

        <section className="attempt-detail-section original">
          <span>原题</span>
          <p>{item.original_text}</p>
        </section>
        <section className="attempt-detail-section answer">
          <span>我的答案</span>
          {attempt.answer_title && <h2>{attempt.answer_title}</h2>}
          <p>{attempt.answer_text}</p>
        </section>
        <div className="attempt-reference-grid">
          <section className="attempt-detail-section">
            <span>参考答案</span>
            {item.reference_title && <h2>{item.reference_title}</h2>}
            <p>{item.reference_text}</p>
          </section>
          <section className="attempt-detail-section">
            <span>简要解析</span>
            <p>{item.explanation || "请对照原文和参考答案，检查主要人物、事件发展和结果是否完整。"}</p>
          </section>
        </div>
        <div className="attempt-detail-actions">
          <Link href={details?.href ?? "/practice"}>继续练习</Link>
          <Link href="/my-library">查看全部记录</Link>
        </div>
      </article>
    </main>
  );
}
