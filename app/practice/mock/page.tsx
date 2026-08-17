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
        <Link className="back-link" href="/practice">← Back to Writing Practice</Link>
        <div className="mock-page-heading">
          <span className="eyebrow">HSK 6 · Writing Mock Test</span>
          <h1>Practice with the Official Exam Flow</h1>
          <p>Read for 10 minutes and write for 35 minutes. Once hidden, the original passage cannot be viewed again.</p>
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
