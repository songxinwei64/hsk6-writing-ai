import Link from "next/link";
import ParagraphPractice from "../../../components/paragraph-practice";
import { getParagraphPracticeItems, PRACTICE_ACCESS } from "../../../lib/practice-items";
import { getMembershipAccess } from "../../../lib/membership";
import { getPracticeAttemptSummaries } from "../../../lib/practice-attempt-summary";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "HSK 6 Passage Summarization Practice",
  description: "Practice summarizing short Chinese passages for HSK 6 by identifying essential events, removing minor details, and writing a concise response.",
  path: "/practice/paragraph",
  keywords: ["HSK 6 passage summary", "Chinese passage summarization", "短文缩写练习"],
});

export const dynamic = "force-dynamic";

export default async function ParagraphPracticePage() {
  const access = await getMembershipAccess();
  const limits = PRACTICE_ACCESS.paragraph;
  const itemLimit = access.isPaidMember
    ? undefined
    : access.isAuthenticated
      ? limits.free
      : limits.guest;
  const items = await getParagraphPracticeItems(itemLimit);
  const totalItems = limits.total;
  const attemptSummaries = await getPracticeAttemptSummaries(items.map((item) => item.databaseId));

  return (
    <main className="page">
      <section className="sentence-page-shell">
        <Link className="back-link" href="/practice">← Back to Writing Practice</Link>
        <div className="sentence-page-heading">
          <span className="eyebrow">Passage Summarization · {totalItems} Exercises</span>
          <h1>Follow the Main Thread</h1>
          <p>Read for 3 minutes, then write for 7 minutes. The original passage cannot be reopened during writing.</p>
        </div>
        <ParagraphPractice
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
