"use client";

import { useState } from "react";
import type { SentencePracticeItem } from "../lib/practice-items";
import type { PracticeAttemptSummary } from "../lib/practice-attempt-summary";
import { saveCompletedAttempt } from "../lib/save-practice-attempt";
import AttemptBadge from "./attempt-badge";
import PracticeLockOverlay from "./practice-lock-overlay";
import QuestionLockIcon from "./question-lock-icon";

const QUESTIONS_PER_PAGE = 10;

export default function SentencePractice({
  items,
  totalItems,
  loggedInFreeItems,
  isAuthenticated,
  isPaidMember,
  initialAttemptSummaries,
}: {
  items: SentencePracticeItem[];
  totalItems: number;
  loggedInFreeItems: number;
  isAuthenticated: boolean;
  isPaidMember: boolean;
  initialAttemptSummaries: Record<string, PracticeAttemptSummary>;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [error, setError] = useState("");
  const [questionPage, setQuestionPage] = useState(0);
  const [lockedTarget, setLockedTarget] = useState<number | null>(null);
  const [attemptSummaries, setAttemptSummaries] = useState(initialAttemptSummaries);

  const item = items[currentIndex];
  const answer = answers[item.id] || "";
  const isSubmitted = Boolean(submitted[item.id]);
  const completedCount = Object.keys(submitted).length;
  const attemptSummary = attemptSummaries[item.databaseId];
  const totalPages = Math.ceil(totalItems / QUESTIONS_PER_PAGE);
  const pageStart = questionPage * QUESTIONS_PER_PAGE;
  const visibleQuestionIndexes = Array.from(
    { length: Math.min(QUESTIONS_PER_PAGE, totalItems - pageStart) },
    (_, offset) => pageStart + offset,
  );

  function moveTo(index: number) {
    const nextIndex = Math.min(Math.max(index, 0), items.length - 1);
    setCurrentIndex(nextIndex);
    setQuestionPage(Math.floor(nextIndex / QUESTIONS_PER_PAGE));
    setError("");
  }

  function changePage(page: number) {
    const nextPage = Math.min(Math.max(page, 0), totalPages - 1);
    chooseQuestion(nextPage * QUESTIONS_PER_PAGE);
  }

  function chooseQuestion(index: number) {
    if (index >= items.length) {
      setQuestionPage(Math.floor(index / QUESTIONS_PER_PAGE));
      setLockedTarget(index + 1);
      return;
    }
    setLockedTarget(null);
    moveTo(index);
  }

  function closePaywall() {
    setLockedTarget(null);
    setQuestionPage(Math.floor((items.length - 1) / QUESTIONS_PER_PAGE));
  }

  async function submitAnswer() {
    if (!answer.trim()) {
      setError("Please write your summary first.");
      return;
    }
    setSubmitted((current) => ({ ...current, [item.id]: true }));
    setError("");
    const result = await saveCompletedAttempt({ practiceItemId: item.databaseId, answerText: answer });
    if (result.saved) {
      const latestAt = new Date().toISOString();
      setAttemptSummaries((current) => ({
        ...current,
        [item.databaseId]: {
          count: (current[item.databaseId]?.count ?? 0) + 1,
          latestAt,
        },
      }));
    }
  }

  function editAnswer() {
    setSubmitted((current) => ({ ...current, [item.id]: false }));
  }

  return (
    <div className="sentence-workspace">
      <div className="sentence-progress-head">
          <span>Exercise {currentIndex + 1} / {totalItems}</span>
        <span className="sentence-progress-meta">
          {attemptSummary && <AttemptBadge summary={attemptSummary} />}
          <span>Completed {completedCount} / {totalItems}</span>
        </span>
      </div>

      <div className="sentence-progress-track">
        <span style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }} />
      </div>

      <section className="sentence-tip" aria-labelledby={`sentence-skill-${item.id}`}>
            <span>Key Skill</span>
        <div>
          <h2 id={`sentence-skill-${item.id}`}>{item.skill}</h2>
          <p>{item.tip}</p>
        </div>
      </section>

      <section className="sentence-original">
          <span className="sentence-kicker">Original Sentence</span>
        <p>{item.original}</p>
      </section>

      <section className="sentence-writing">
        <div className="sentence-writing-head">
          <div>
            <span className="sentence-kicker">Your Summary</span>
            <h2>Keep the Main Idea in Fewer Words</h2>
          </div>
        </div>

        <textarea
          value={answer}
          onChange={(event) => {
            setAnswers((current) => ({ ...current, [item.id]: event.target.value }));
            setError("");
          }}
            placeholder="Write your Chinese summary here…"
            aria-label={`Summary for exercise ${currentIndex + 1}`}
          disabled={isSubmitted}
        />

        {error && <p className="sentence-practice-error" role="alert">{error}</p>}

        {!isSubmitted ? (
          <button className="sentence-practice-submit" type="button" onClick={submitAnswer}>
              Submit and View Suggested Answer
          </button>
        ) : (
          <div className="sentence-reference">
            <div>
                <strong>Suggested Answer</strong>
            </div>
            <p>{item.reference}</p>
            <aside>
                <small>Key Point · {item.skill}</small>
              <span>{item.explanation}</span>
            </aside>
            <div className="practice-result-actions">
                <button type="button" onClick={editAnswer}>Edit My Answer</button>
                <a href={`/community/practice/${item.databaseId}`}>Discuss This Exercise →</a>
            </div>
          </div>
        )}
      </section>

      <nav className="sentence-navigation" aria-label="Sentence exercise navigation">
        <button type="button" onClick={() => changePage(questionPage - 1)} disabled={questionPage === 0}>
          ← Previous
        </button>
        <div>
          {visibleQuestionIndexes.map((index) => {
            const question = items[index];
            const locked = !question;
            return (
            <button
              className={`${index === currentIndex ? "current" : ""}${question && submitted[question.id] ? " completed" : ""}${locked ? " locked" : ""}`}
              type="button"
              onClick={() => chooseQuestion(index)}
              aria-label={locked ? `Exercise ${index + 1}, ${isAuthenticated ? "members only" : "sign in to unlock"}` : `Exercise ${index + 1}`}
              key={question?.id ?? `locked-${index}`}
            >
              {index + 1}{locked && <QuestionLockIcon />}
            </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => changePage(questionPage + 1)}
          disabled={questionPage === totalPages - 1}
        >
          Next →
        </button>
      </nav>
      <p className="practice-pagination-status">Page {questionPage + 1} of {totalPages}</p>
      {!isPaidMember && lockedTarget !== null && (
        <PracticeLockOverlay
          variant={isAuthenticated ? "membership" : "login"}
          title={isAuthenticated ? "Unlock More Sentence Exercises" : "Sign In for More Sentence Exercises"}
          description={isAuthenticated
            ? `Your free account includes the first ${items.length} exercises. Exercise ${lockedTarget} and later are available with membership.`
            : `Guests can try ${items.length} exercises. Sign in to access the first ${loggedInFreeItems} exercises and save your practice history.`}
          loginNext="/practice/sentence"
          onClose={closePaywall}
        />
      )}
    </div>
  );
}
