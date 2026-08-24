"use client";

import { useState } from "react";
import type { AiWritingFeedback } from "../lib/ai-feedback";
import { getSiteLocale, useSiteLocale } from "../lib/use-site-locale";

type Props = {
  practiceItemId: string;
  answerTitle: string;
  answerText: string;
  isAuthenticated: boolean;
  isPaidMember: boolean;
};

export default function AiFeedbackPanel({ practiceItemId, answerTitle, answerText, isAuthenticated, isPaidMember }: Props) {
  const [feedback, setFeedback] = useState<AiWritingFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [quotaType, setQuotaType] = useState<"daily" | "trial" | null>(null);
  const locale = useSiteLocale();
  const zh = locale === "zh";
  const ko = locale === "ko";
  const text = (z: string, e: string, k: string) => zh ? z : ko ? k : e;

  async function requestFeedback() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ practiceItemId, answerTitle, answerText, responseLanguage: getSiteLocale() }),
      });
      const result = await response.json() as { feedback?: AiWritingFeedback; remaining?: number; quotaType?: "daily" | "trial"; error?: string };
      if (!response.ok || !result.feedback) throw new Error(result.error || text("暂时无法生成AI反馈，请稍后再试。", "AI feedback could not be generated. Please try again later.", "AI 피드백을 생성할 수 없습니다. 잠시 후 다시 시도하세요."));
      setFeedback(result.feedback);
      setRemaining(result.remaining ?? null);
      setQuotaType(result.quotaType ?? null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text("暂时无法生成AI反馈，请稍后再试。", "AI feedback could not be generated. Please try again later.", "AI 피드백을 생성할 수 없습니다. 잠시 후 다시 시도하세요."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="ai-feedback-panel">
      <div className="ai-feedback-heading">
        <div><span>{text("Write HSK AI助教", "Write HSK AI Tutor", "Write HSK AI 튜터")}</span><h3>{text("针对你的缩写进行具体反馈", "Personalized Feedback on Your Summary", "작성한 요약문 맞춤 피드백")}</h3></div>
        {!feedback && isAuthenticated && (
          <button type="button" onClick={requestFeedback} disabled={isLoading}>
          {isLoading ? text("正在分析你的缩写……", "Reviewing your summary…", "요약문을 분석하고 있습니다……") : text("获取AI反馈", "Get AI Feedback", "AI 피드백 받기")}
          </button>
        )}
      </div>

      {!isAuthenticated && <p className="ai-feedback-access">{text("登录后可免费体验3次AI反馈。", "Sign in to try AI feedback three times for free.", "로그인하면 AI 피드백을 3회 무료로 체험할 수 있습니다.")}</p>}
      {isAuthenticated && !isPaidMember && !feedback && <p className="ai-feedback-access">{text("免费账户包含3次AI反馈体验。", "Free accounts include three AI feedback sessions.", "무료 계정은 AI 피드백 3회를 이용할 수 있습니다.")}</p>}
      {error && <p className="ai-feedback-error" role="alert">{error}</p>}

      {feedback && (
        <div className="ai-feedback-content">
          {feedback.priorityIssues.length > 0 && (
            <section className="ai-feedback-priority">
            <strong>{text("优先修改的问题", "Top Priority", "가장 먼저 고칠 부분")}</strong>
              <ol>{feedback.priorityIssues.map((item, index) => <li key={`priority-${index}`}>{item}</li>)}</ol>
            </section>
          )}
          <section className="ai-feedback-requirements">
            <h4>{text("任务要求检查", "Task Requirements", "과제 조건 확인")}</h4>
            <dl>
              <div><dt>{text("标题", "Title", "제목")}</dt><dd>{feedback.titleFeedback}</dd></div>
              <div><dt>{text("字数", "Length", "분량")}</dt><dd>{feedback.lengthFeedback}</dd></div>
              <div><dt>{text("忠于原文", "Fidelity", "원문 충실도")}</dt><dd>{feedback.fidelityFeedback}</dd></div>
              <div><dt>{text("个人观点", "Personal Opinion", "개인 의견")}</dt><dd>{feedback.viewpointFeedback}</dd></div>
            </dl>
          </section>
          <div className="ai-feedback-grid">
            <section>
            <h4>{text("做得好的地方", "What You Did Well", "잘한 점")}</h4>
            {feedback.retained.length ? <ul>{feedback.retained.map((item, index) => <li key={`retained-${index}`}>{item}</li>)}</ul> : <p>{locale === "en" ? "The current summary does not yet contain enough accurate content to highlight." : locale === "ko" ? "현재 요약문에는 장점으로 제시할 만큼 정확하게 반영된 내용이 아직 충분하지 않습니다." : "当前缩写还没有足够准确的内容可以作为优点说明。"}</p>}
            </section>
            <section>
            <h4>{text("需要修改的地方", "What Needs Improvement", "수정할 부분")}</h4>
              {[...feedback.revisions, ...feedback.expression].length ? (
                <ul>{[...feedback.revisions, ...feedback.expression].map((item, index) => <li key={`change-${index}`}>{item}</li>)}</ul>
            ) : <p>{locale === "en" ? "No clear issues were found." : locale === "ko" ? "명확하게 수정해야 할 문제는 발견되지 않았습니다." : "没有发现需要明确修改的问题。"}</p>}
            </section>
          </div>
          <section className="ai-feedback-example"><h4>{text("改进示例", "Suggested Revision", "개선 예시")}</h4><p>{feedback.improvedExample}</p></section>
          {remaining !== null && <small>{quotaType === "trial" ? text(`还可免费使用 ${remaining} 次AI反馈`, `${remaining} free AI feedback sessions remaining`, `무료 AI 피드백 ${remaining}회 남음`) : text(`当前24小时内还可使用 ${remaining} 次AI反馈`, `${remaining} AI feedback sessions remaining in the current 24-hour period`, `현재 24시간 동안 AI 피드백 ${remaining}회 남음`)}</small>}
        </div>
      )}

      <p className="ai-feedback-note">{text("AI反馈仅用于帮助修改，不属于HSK官方评定。", "AI feedback is provided for revision support and is not an official HSK assessment.", "AI 피드백은 수정을 돕기 위한 것이며 HSK 공식 평가가 아닙니다.")}</p>
    </section>
  );
}
