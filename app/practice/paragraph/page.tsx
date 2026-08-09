import Link from "next/link";
import ParagraphPractice from "../../../components/paragraph-practice";
import SiteHeader from "../../../components/site-header";
import { getParagraphPracticeItems } from "../../../lib/practice-items";

export default async function ParagraphPracticePage() {
  const items = await getParagraphPracticeItems();

  return (
    <main className="page">
      <SiteHeader />
      <section className="sentence-page-shell">
        <Link className="back-link" href="/practice">← 返回缩写练习</Link>
        <div className="sentence-page-heading">
          <span className="eyebrow">短文缩写 · {items.length}篇练习</span>
          <h1>梳理主线，写出完整短文</h1>
          <p>先阅读3分钟，再限时缩写7分钟。写作时不能重新查看原文。</p>
        </div>
        <ParagraphPractice items={items} />
      </section>
    </main>
  );
}
