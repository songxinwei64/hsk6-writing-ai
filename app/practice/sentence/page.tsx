import Link from "next/link";
import SentencePractice from "../../../components/sentence-practice";
import { getSentencePracticeItems, PRACTICE_ACCESS } from "../../../lib/practice-items";

export const dynamic = "force-dynamic";

export default async function SentencePracticePage() {
  const limits = PRACTICE_ACCESS.sentence;
  const items = await getSentencePracticeItems();
  const totalItems = limits.total;

  return (
    <main className="page">
      <section className="sentence-page-shell">
        <Link className="back-link" href="/practice">← 返回缩写练习</Link>
        <div className="sentence-page-heading">
          <span className="eyebrow">句子缩写 · {totalItems}道练习</span>
          <h1>留下重点，删去细节</h1>
          <p>完成缩写后，对照参考答案和简要解析。</p>
        </div>
        <SentencePractice items={items} totalItems={totalItems} />
      </section>
    </main>
  );
}
