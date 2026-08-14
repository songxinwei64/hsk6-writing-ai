import type { PracticeAttemptSummary } from "../lib/practice-attempt-summary";

export default function AttemptBadge({ summary }: { summary: PracticeAttemptSummary }) {
  const latestDate = new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(
    new Date(summary.latestAt),
  );

  return (
    <span className="practice-attempt-badge" title={`最近练习：${latestDate}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 7v5l3 2M21 12a9 9 0 1 1-2.64-6.36M21 4v5h-5" />
      </svg>
      已练习 {summary.count} 次
    </span>
  );
}
