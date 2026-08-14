import Link from "next/link";
import SentencePractice from "../../../components/sentence-practice";
import { getSentencePracticeItems, PRACTICE_ACCESS } from "../../../lib/practice-items";
import { getMembershipAccess } from "../../../lib/membership";
import { getPracticeAttemptSummaries } from "../../../lib/practice-attempt-summary";

export const dynamic = "force-dynamic";

export default async function SentencePracticePage() {
  const access = await getMembershipAccess();
  const limits = PRACTICE_ACCESS.sentence;
  const itemLimit = access.isPaidMember
    ? undefined
    : access.isAuthenticated
      ? limits.free
      : limits.guest;
  const items = await getSentencePracticeItems(itemLimit);
  const totalItems = limits.total;
  const attemptSummaries = await getPracticeAttemptSummaries(items.map((item) => item.databaseId));

  return (
    <main className="page">
      <section className="sentence-page-shell">
        <Link className="back-link" href="/practice">← 返回缩写练习</Link>
        <div className="sentence-page-heading">
          <span className="eyebrow">句子缩写 · {totalItems}道练习</span>
          <h1>留下重点，删去细节</h1>
          <p>完成缩写后，对照参考答案和简要解析。</p>
        </div>
        <SentencePractice
          items={items}
          totalItems={totalItems}
          loggedInFreeItems={limits.free}
          isAuthenticated={access.isAuthenticated}
          isPaidMember={access.isPaidMember}
          initialAttemptSummaries={attemptSummaries}
        />
      </section>
    </main>
  );
}
