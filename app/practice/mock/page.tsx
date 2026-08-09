import Link from "next/link";
import Hsk6MockPractice from "../../../components/hsk6-mock-practice";
import SiteHeader from "../../../components/site-header";
import { getHsk6MockPracticeItems } from "../../../lib/practice-items";

export default async function Hsk6MockPracticePage() {
  const items = await getHsk6MockPracticeItems();

  return (
    <main className="page">
      <SiteHeader />
      <section className="mock-page-shell">
        <Link className="back-link" href="/practice">← 返回缩写练习</Link>
        <div className="mock-page-heading">
          <span className="eyebrow">HSK 6 · 写作模拟</span>
          <h1>按照真实流程完成缩写</h1>
          <p>阅读10分钟，写作35分钟。原文隐藏后不能重新查看。</p>
        </div>
        <Hsk6MockPractice items={items} />
      </section>
    </main>
  );
}
