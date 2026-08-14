import Link from "next/link";
import { redirect } from "next/navigation";
import Hsk6MockPractice from "../../../components/hsk6-mock-practice";
import { getHsk6MockPracticeItems, PRACTICE_ACCESS } from "../../../lib/practice-items";
import { getMembershipAccess } from "../../../lib/membership";
import { getPracticeAttemptSummaries } from "../../../lib/practice-attempt-summary";

export const dynamic = "force-dynamic";

export default async function Hsk6MockPracticePage() {
  const access = await getMembershipAccess();
  if (!access.isAuthenticated) {
    redirect("/?auth=login&next=%2Fpractice%2Fmock");
  }
  const limits = PRACTICE_ACCESS.mock;
  const items = await getHsk6MockPracticeItems(access.isPaidMember ? undefined : limits.free);
  const totalItems = limits.total;
  const attemptSummaries = await getPracticeAttemptSummaries(items.map((item) => item.databaseId));

  return (
    <main className="page">
      <section className="mock-page-shell">
        <Link className="back-link" href="/practice">← 返回缩写练习</Link>
        <div className="mock-page-heading">
          <span className="eyebrow">HSK 6 · 写作模拟</span>
          <h1>按照真实流程完成缩写</h1>
          <p>阅读10分钟，写作35分钟。原文隐藏后不能重新查看。</p>
        </div>
        <Hsk6MockPractice
          items={items}
          totalItems={totalItems}
          isAuthenticated={access.isAuthenticated}
          isPaidMember={access.isPaidMember}
          initialAttemptSummaries={attemptSummaries}
        />
      </section>
    </main>
  );
}
