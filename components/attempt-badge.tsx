import type { PracticeAttemptSummary } from "../lib/practice-attempt-summary";

export default function AttemptBadge({ summary }: { summary: PracticeAttemptSummary }) {
  const latestDate = new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(summary.latestAt),
  );

  return (
    <span className="practice-attempt-badge" title={`Last practiced: ${latestDate}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 7v5l3 2M21 12a9 9 0 1 1-2.64-6.36M21 4v5h-5" />
      </svg>
      Practiced {summary.count} {summary.count === 1 ? "time" : "times"}
    </span>
  );
}
