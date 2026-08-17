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
      if (!response.ok || !result.feedback) throw new Error(result.error || "AI feedback could not be generated. Please try again later.");
      setFeedback(result.feedback);
      setRemaining(result.remaining ?? null);
      setQuotaType(result.quotaType ?? null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "AI feedback could not be generated. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="ai-feedback-panel">
      <div className="ai-feedback-heading">
        <div><span>Write HSK AI Tutor</span><h3>Personalized Feedback on Your Summary</h3></div>
        {!feedback && isAuthenticated && (
          <button type="button" onClick={requestFeedback} disabled={isLoading}>
          {isLoading ? "Reviewing your summary…" : "Get AI Feedback"}
          </button>
        )}
      </div>

      {!isAuthenticated && <p className="ai-feedback-access">Sign in to try AI feedback three times for free.</p>}
      {isAuthenticated && !isPaidMember && !feedback && <p className="ai-feedback-access">Free accounts include three AI feedback sessions.</p>}
      {error && <p className="ai-feedback-error" role="alert">{error}</p>}

      {feedback && (
        <div className="ai-feedback-content">
          {feedback.priorityIssues.length > 0 && (
            <section className="ai-feedback-priority">
            <strong>Top Priority</strong>
              <ol>{feedback.priorityIssues.map((item, index) => <li key={`priority-${index}`}>{item}</li>)}</ol>
            </section>
          )}
          <section className="ai-feedback-requirements">
            <h4>Task Requirements</h4>
            <dl>
              <div><dt>Title</dt><dd>{feedback.titleFeedback}</dd></div>
              <div><dt>Length</dt><dd>{feedback.lengthFeedback}</dd></div>
              <div><dt>Fidelity</dt><dd>{feedback.fidelityFeedback}</dd></div>
              <div><dt>Personal Opinion</dt><dd>{feedback.viewpointFeedback}</dd></div>
            </dl>
          </section>
          <div className="ai-feedback-grid">
            <section>
            <h4>What You Did Well</h4>
            {feedback.retained.length ? <ul>{feedback.retained.map((item, index) => <li key={`retained-${index}`}>{item}</li>)}</ul> : <p>The current summary does not yet contain enough accurate content to highlight.</p>}
            </section>
            <section>
            <h4>What Needs Improvement</h4>
              {[...feedback.revisions, ...feedback.expression].length ? (
                <ul>{[...feedback.revisions, ...feedback.expression].map((item, index) => <li key={`change-${index}`}>{item}</li>)}</ul>
            ) : <p>No clear issues were found.</p>}
            </section>
          </div>
          <section className="ai-feedback-example"><h4>Suggested Revision</h4><p>{feedback.improvedExample}</p></section>
          {remaining !== null && <small>{quotaType === "trial" ? `${remaining} free AI feedback sessions remaining` : `${remaining} AI feedback sessions remaining in the current 24-hour period`}</small>}
        </div>
      )}

      <p className="ai-feedback-note">AI feedback is provided for revision support and is not an official HSK assessment.</p>
    </section>
  );
}
