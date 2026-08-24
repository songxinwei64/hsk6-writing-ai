"use client";

import type { PracticeAttemptSummary } from "../lib/practice-attempt-summary";
import { useSiteLocale } from "../lib/use-site-locale";

export default function AttemptBadge({ summary }: { summary: PracticeAttemptSummary }) {
  const locale = useSiteLocale();
  const latestDate = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : locale === "ko" ? "ko-KR" : "en", { dateStyle: "medium" }).format(
    new Date(summary.latestAt),
  );
  const label = locale === "zh" ? `已练习 ${summary.count} 次` : locale === "ko" ? `${summary.count}회 연습` : `Practiced ${summary.count} ${summary.count === 1 ? "time" : "times"}`;
  const title = locale === "zh" ? `上次练习：${latestDate}` : locale === "ko" ? `최근 연습: ${latestDate}` : `Last practiced: ${latestDate}`;

  return (
    <span className="practice-attempt-badge" title={title}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 7v5l3 2M21 12a9 9 0 1 1-2.64-6.36M21 4v5h-5" />
      </svg>
      {label}
    </span>
  );
}
