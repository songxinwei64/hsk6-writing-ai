import Link from "next/link";
import ParagraphPractice from "../../../components/paragraph-practice";
import { getParagraphPracticeItems, PRACTICE_ACCESS } from "../../../lib/practice-items";
import { getMembershipAccess } from "../../../lib/membership";

export const dynamic = "force-dynamic";

export default async function ParagraphPracticePage() {
  const access = await getMembershipAccess();
  const limits = PRACTICE_ACCESS.paragraph;
  const items = await getParagraphPracticeItems(access.isPaidMember ? undefined : limits.free);
  const totalItems = limits.total;

  return (
    <main className="page">
      <section className="sentence-page-shell">
        <Link className="back-link" href="/practice">← 返回缩写练习</Link>
        <div className="sentence-page-heading">
          <span className="eyebrow">短文缩写 · {totalItems}篇练习</span>
          <h1>梳理主线，写出完整短文</h1>
          <p>先阅读3分钟，再限时缩写7分钟。写作时不能重新查看原文。</p>
        </div>
        <ParagraphPractice items={items} totalItems={totalItems} isPaidMember={access.isPaidMember} />
      </section>
    </main>
  );
}
