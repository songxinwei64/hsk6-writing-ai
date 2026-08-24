import SentencePractice from "../../../components/sentence-practice";
import PracticePageHeading from "../../../components/practice-page-heading";
import { getSentencePracticeItems, PRACTICE_ACCESS } from "../../../lib/practice-items";
import { getMembershipAccess } from "../../../lib/membership";
import { getPracticeAttemptSummaries } from "../../../lib/practice-attempt-summary";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "HSK 6 Sentence Summarization Practice",
  description: "Practice shortening Chinese sentences for HSK 6. Learn to preserve the key person, action, cause, and result while removing unnecessary details.",
  path: "/practice/sentence",
  keywords: ["HSK 6 sentence practice", "Chinese sentence summarization", "句子缩写练习"],
});

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
        <PracticePageHeading kind="sentence" totalItems={totalItems} />
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
