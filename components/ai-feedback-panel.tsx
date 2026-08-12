"use client";

import { useState } from "react";
import type { AiWritingFeedback } from "../lib/ai-feedback";

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

  async function requestFeedback() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ practiceItemId, answerTitle, answerText }),
      });
      const result = await response.json() as { feedback?: AiWritingFeedback; remaining?: number; quotaType?: "daily" | "trial"; error?: string };
      if (!response.ok || !result.feedback) throw new Error(result.error || "AI反馈生成失败。请稍后重试。");
      setFeedback(result.feedback);
      setRemaining(result.remaining ?? null);
      setQuotaType(result.quotaType ?? null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "AI反馈生成失败。请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="ai-feedback-panel">
      <div className="ai-feedback-heading">
        <div><span>Write HSK AI助教</span><h3>针对你的缩写进行具体反馈</h3></div>
        {!feedback && isAuthenticated && (
          <button type="button" onClick={requestFeedback} disabled={isLoading}>
            {isLoading ? "正在阅读你的缩写…" : "获取AI反馈"}
          </button>
        )}
      </div>

      {!isAuthenticated && <p className="ai-feedback-access">登录后可免费体验3次AI反馈。</p>}
      {isAuthenticated && !isPaidMember && !feedback && <p className="ai-feedback-access">免费账户可累计体验3次AI反馈。</p>}
      {error && <p className="ai-feedback-error" role="alert">{error}</p>}

      {feedback && (
        <div className="ai-feedback-content">
          {feedback.priorityIssues.length > 0 && (
            <section className="ai-feedback-priority">
              <strong>优先修改的问题</strong>
              <ol>{feedback.priorityIssues.map((item, index) => <li key={`priority-${index}`}>{item}</li>)}</ol>
            </section>
          )}
          <section className="ai-feedback-requirements">
            <h4>任务要求检查</h4>
            <dl>
              <div><dt>标题</dt><dd>{feedback.titleFeedback}</dd></div>
              <div><dt>字数</dt><dd>{feedback.lengthFeedback}</dd></div>
              <div><dt>忠于原文</dt><dd>{feedback.fidelityFeedback}</dd></div>
              <div><dt>个人观点</dt><dd>{feedback.viewpointFeedback}</dd></div>
            </dl>
          </section>
          <div className="ai-feedback-grid">
            <section>
              <h4>做得好的地方</h4>
              {feedback.retained.length ? <ul>{feedback.retained.map((item, index) => <li key={`retained-${index}`}>{item}</li>)}</ul> : <p>这次缩写还没有充分呈现出可以保留的内容。</p>}
            </section>
            <section>
              <h4>需要修改的地方</h4>
              {[...feedback.revisions, ...feedback.expression].length ? (
                <ul>{[...feedback.revisions, ...feedback.expression].map((item, index) => <li key={`change-${index}`}>{item}</li>)}</ul>
              ) : <p>暂未发现明显需要修改的地方。</p>}
            </section>
          </div>
          <section className="ai-feedback-example"><h4>改进示例</h4><p>{feedback.improvedExample}</p></section>
          {remaining !== null && <small>{quotaType === "trial" ? `免费体验还剩 ${remaining} 次` : `最近24小时还可以获取 ${remaining} 次AI反馈`}</small>}
        </div>
      )}

      <p className="ai-feedback-note">AI反馈仅用于帮助你修改缩写，不代表官方HSK考试评价。</p>
    </section>
  );
}
