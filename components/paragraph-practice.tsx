"use client";

import { useEffect, useState } from "react";
import type { ParagraphPracticeItem } from "../lib/practice-items";
import type { PracticeAttemptSummary } from "../lib/practice-attempt-summary";
import { saveCompletedAttempt } from "../lib/save-practice-attempt";
import AttemptBadge from "./attempt-badge";
import PracticeLockOverlay from "./practice-lock-overlay";
import QuestionLockIcon from "./question-lock-icon";
import { useSiteLocale } from "../lib/use-site-locale";

const QUESTIONS_PER_PAGE = 10;

type PracticeStatus = "idle" | "reading" | "writing" | "submitted" | "expired";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export default function ParagraphPractice({
  items,
  totalItems,
  loggedInFreeItems,
  isAuthenticated,
  isPaidMember,
  initialAttemptSummaries,
}: {
  items: ParagraphPracticeItem[];
  totalItems: number;
  loggedInFreeItems: number;
  isAuthenticated: boolean;
  isPaidMember: boolean;
  initialAttemptSummaries: Record<string, PracticeAttemptSummary>;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [statuses, setStatuses] = useState<Record<number, PracticeStatus>>({});
  const [remainingTimes, setRemainingTimes] = useState<Record<number, number>>({});
  const [error, setError] = useState("");
  const [questionPage, setQuestionPage] = useState(0);
  const [lockedTarget, setLockedTarget] = useState<number | null>(null);
  const [attemptSummaries, setAttemptSummaries] = useState(initialAttemptSummaries);
  const locale = useSiteLocale();

  const item = items[currentIndex];
  const answer = answers[item.id] || "";
  const status = statuses[item.id] || "idle";
  const remaining = remainingTimes[item.id] ?? item.readingSeconds;
  const hasFinished = status === "submitted" || status === "expired";
  const isActive = status === "reading" || status === "writing";
  const completedCount = Object.values(statuses).filter(
    (value) => value === "submitted" || value === "expired",
  ).length;
  const attemptSummary = attemptSummaries[item.databaseId];
  const totalPages = Math.ceil(totalItems / QUESTIONS_PER_PAGE);
  const pageStart = questionPage * QUESTIONS_PER_PAGE;
  const visibleQuestionIndexes = Array.from(
    { length: Math.min(QUESTIONS_PER_PAGE, totalItems - pageStart) },
    (_, offset) => pageStart + offset,
  );

  useEffect(() => {
    if (status !== "reading" && status !== "writing") return;

    const timer = window.setInterval(() => {
      setRemainingTimes((current) => {
        const currentRemaining = current[item.id] ?? (status === "reading" ? item.readingSeconds : item.writingSeconds);
        if (currentRemaining <= 1) {
          window.clearInterval(timer);
          if (status === "reading") {
            setStatuses((allStatuses) => ({ ...allStatuses, [item.id]: "writing" }));
            return { ...current, [item.id]: item.writingSeconds };
          }
          setStatuses((allStatuses) => ({ ...allStatuses, [item.id]: "expired" }));
          return { ...current, [item.id]: 0 };
        }
        return { ...current, [item.id]: currentRemaining - 1 };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [item.id, item.readingSeconds, item.writingSeconds, status]);

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

  function startPractice() {
    setRemainingTimes((current) => ({ ...current, [item.id]: item.readingSeconds }));
    setStatuses((current) => ({ ...current, [item.id]: "reading" }));
  }

  function finishReadingEarly() {
    const confirmed = window.confirm("Once writing begins, you cannot view the original passage again. Start writing now?");
    if (!confirmed) return;
    setRemainingTimes((current) => ({ ...current, [item.id]: item.writingSeconds }));
    setStatuses((current) => ({ ...current, [item.id]: "writing" }));
  }

  async function submitAnswer() {
    if (!answer.trim()) {
      setError("Please write your summary first.");
      return;
    }
    setStatuses((current) => ({ ...current, [item.id]: "submitted" }));
    setError("");
    const result = await saveCompletedAttempt({ practiceItemId: item.databaseId, answerText: answer });
    if (result.saved) {
      setAttemptSummaries((current) => ({
        ...current,
        [item.databaseId]: {
          count: (current[item.databaseId]?.count ?? 0) + 1,
          latestAt: new Date().toISOString(),
        },
      }));
    }
  }

  return (
    <div className="paragraph-workspace">
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

      <section className="sentence-tip">
            <span>Key Skill</span>
        <div>
          <h2>{locale === "en" ? (item.skillEn ?? item.skill) : item.skill}</h2>
          <p>{locale === "en" ? (item.tipEn ?? item.tip) : item.tip}</p>
        </div>
      </section>

      {status === "idle" ? (
        <section className="paragraph-start-panel">
            <span>Exercise Flow</span>
          <p>
              Read the original passage for 3 minutes, then write your summary in 7 minutes.
            <br />
              The passage will be hidden during writing and cannot be reopened.
          </p>
            <button type="button" onClick={startPractice}>Start Reading</button>
        </section>
      ) : (
        <>
          <div className={`paragraph-timer ${remaining <= 60 ? "urgent" : ""}`} aria-live="polite">
            <span>
              {status === "reading" && "Reading Time Remaining"}
              {status === "writing" && "Writing Time Remaining"}
              {hasFinished && (status === "expired" ? "Writing Time Ended" : "Submitted")}
            </span>
            <strong>{formatTime(remaining)}</strong>
          </div>

          {(status === "reading" || hasFinished) && (
            <section className="paragraph-original">
              <span className="sentence-kicker">{status === "reading" ? "Reading Passage" : "Original Passage Review"}</span>
              <p>{item.original}</p>
            </section>
          )}

          {status === "reading" ? (
            <section className="paragraph-reading-note">
                <strong>Reading Phase</strong>
                <p>Do not take notes. Remember the main people, events, reasons, and outcome. The passage will be hidden when time ends.</p>
              <button className="finish-reading-button" type="button" onClick={finishReadingEarly}>
                  Finish Reading and Start Writing
              </button>
            </section>
          ) : (
          <section className="sentence-writing paragraph-writing">
            <div className="sentence-writing-head">
              <div>
              <span className="sentence-kicker">Your Summary</span>
              <h2>Retell the Main Content Coherently</h2>
              </div>
            </div>
            <textarea
              value={answer}
              onChange={(event) => {
                setAnswers((current) => ({ ...current, [item.id]: event.target.value }));
                setError("");
              }}
              placeholder="Write your Chinese passage summary here…"
              aria-label={`Summary for passage ${currentIndex + 1}`}
              disabled={hasFinished}
            />
            {error && <p className="sentence-practice-error" role="alert">{error}</p>}
            {!hasFinished ? (
              <button className="sentence-practice-submit" type="button" onClick={submitAnswer}>
                Submit and View Suggested Answer
              </button>
            ) : (
              <div className="sentence-reference">
            {status === "expired" && !answer.trim() && <p className="paragraph-expired-note">Time is up and no answer was submitted.</p>}
            <div><strong>Suggested Answer</strong></div>
                <p>{item.reference}</p>
                <aside>
              <small>Key Point · {locale === "en" ? (item.skillEn ?? item.skill) : item.skill}</small>
                  <span>{locale === "en" ? (item.explanationEn ?? item.explanation) : item.explanation}</span>
                </aside>
            <a className="practice-discussion-link" href={`/community/practice/${item.databaseId}`}>Discuss This Exercise →</a>
              </div>
            )}
          </section>
          )}
        </>
      )}

      <nav className="sentence-navigation" aria-label="Passage exercise navigation">
        <button type="button" onClick={() => changePage(questionPage - 1)} disabled={questionPage === 0 || isActive}>← Previous</button>
        <div>
          {visibleQuestionIndexes.map((index) => {
            const question = items[index];
            const locked = !question;
            return (
            <button
              className={`${index === currentIndex ? "current" : ""}${question && (statuses[question.id] === "submitted" || statuses[question.id] === "expired") ? " completed" : ""}${locked ? " locked" : ""}`}
              type="button"
              onClick={() => chooseQuestion(index)}
              disabled={isActive && index !== currentIndex}
              aria-label={locked ? `Passage ${index + 1}, ${isAuthenticated ? "members only" : "sign in to unlock"}` : `Passage ${index + 1}`}
              key={question?.id ?? `locked-${index}`}
            >
              {index + 1}{locked && <QuestionLockIcon />}
            </button>
            );
          })}
        </div>
        <button type="button" onClick={() => changePage(questionPage + 1)} disabled={questionPage === totalPages - 1 || isActive}>Next →</button>
      </nav>
      <p className="practice-pagination-status">Page {questionPage + 1} of {totalPages}</p>
      {!isPaidMember && lockedTarget !== null && (
        <PracticeLockOverlay
          variant={isAuthenticated ? "membership" : "login"}
          title={isAuthenticated ? "Unlock More Passage Exercises" : "Sign In for More Passage Exercises"}
          description={isAuthenticated
            ? `Your free account includes the first ${items.length} passages. Passage ${lockedTarget} and later are available with membership.`
            : `Guests can try ${items.length} passages. Sign in to access the first ${loggedInFreeItems} passages and save your practice history.`}
          loginNext="/practice/paragraph"
          onClose={closePaywall}
        />
      )}
    </div>
  );
}
