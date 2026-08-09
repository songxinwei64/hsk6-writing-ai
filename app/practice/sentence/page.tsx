import Link from "next/link";
import SentencePractice from "../../../components/sentence-practice";
import SiteHeader from "../../../components/site-header";
import { getSentencePracticeItems } from "../../../lib/practice-items";

export default async function SentencePracticePage() {
  const items = await getSentencePracticeItems();

  return (
    <main className="page">
      <SiteHeader />
      <section className="sentence-page-shell">
        <Link className="back-link" href="/practice">← 返回缩写练习</Link>
        <div className="sentence-page-heading">
          <span className="eyebrow">句子缩写 · {items.length}道练习</span>
          <h1>留下重点，删去细节</h1>
          <p>完成缩写后，对照参考答案和简要解析。</p>
        </div>
        <SentencePractice items={items} />
      </section>
    </main>
  );
}
