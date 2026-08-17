"use client";

import { useEffect, useState } from "react";
import type { Hsk6MockPracticeItem } from "../lib/practice-items";
import type { PracticeAttemptSummary } from "../lib/practice-attempt-summary";
import { saveCompletedAttempt } from "../lib/save-practice-attempt";
import AiFeedbackPanel from "./ai-feedback-panel";
import AttemptBadge from "./attempt-badge";
import PracticeLockOverlay from "./practice-lock-overlay";
import QuestionLockIcon from "./question-lock-icon";

const QUESTIONS_PER_PAGE = 10;

type MockStatus = "idle" | "reading" | "writing" | "submitted" | "expired";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export default function Hsk6MockPractice({
  items,
  totalItems,
  isAuthenticated,
  isPaidMember,
  initialAttemptSummaries,
}: {
  items: Hsk6MockPracticeItem[];
  totalItems: number;
  isAuthenticated: boolean;
  isPaidMember: boolean;
  initialAttemptSummaries: Record<string, PracticeAttemptSummary>;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [titles, setTitles] = useState<Record<number, string>>({});
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [statuses, setStatuses] = useState<Record<number, MockStatus>>({});
  const [remainingTimes, setRemainingTimes] = useState<Record<number, number>>({});
  const [error, setError] = useState("");
  const [questionPage, setQuestionPage] = useState(0);
  const [lockedTarget, setLockedTarget] = useState<number | null>(null);
  const [attemptSummaries, setAttemptSummaries] = useState(initialAttemptSummaries);

  const item = items[currentIndex];
  const status = statuses[item.id] || "idle";
  const title = titles[item.id] || "";
  const answer = answers[item.id] || "";
  const remaining = remainingTimes[item.id] ?? item.readingSeconds;
  const isActive = status === "reading" || status === "writing";
  const hasFinished = status === "submitted" || status === "expired";
  const attemptSummary = attemptSummaries[item.databaseId];
  const totalPages = Math.ceil(totalItems / QUESTIONS_PER_PAGE);
  const pageStart = questionPage * QUESTIONS_PER_PAGE;
  const visibleQuestionIndexes = Array.from(
    { length: Math.min(QUESTIONS_PER_PAGE, totalItems - pageStart) },
    (_, offset) => pageStart + offset,
  );

  useEffect(() => {
    if (!isActive) return;
    const timer = window.setInterval(() => {
      setRemainingTimes((current) => {
        const fallback = status === "reading" ? item.readingSeconds : item.writingSeconds;
        const currentRemaining = current[item.id] ?? fallback;
        if (currentRemaining <= 1) {
          window.clearInterval(timer);
          if (status === "reading") {
            setStatuses((all) => ({ ...all, [item.id]: "writing" }));
            return { ...current, [item.id]: item.writingSeconds };
          }
          setStatuses((all) => ({ ...all, [item.id]: "expired" }));
          return { ...current, [item.id]: 0 };
        }
        return { ...current, [item.id]: currentRemaining - 1 };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isActive, item.id, item.readingSeconds, item.writingSeconds, status]);

  function startMock() {
    setRemainingTimes((current) => ({ ...current, [item.id]: item.readingSeconds }));
    setStatuses((current) => ({ ...current, [item.id]: "reading" }));
  }

  function finishReadingEarly() {
    const confirmed = window.confirm("Once writing begins, you cannot view the original passage again. Start writing now?");
    if (!confirmed) return;
    setRemainingTimes((current) => ({ ...current, [item.id]: item.writingSeconds }));
    setStatuses((current) => ({ ...current, [item.id]: "writing" }));
  }

  async function submitMock() {
    if (!title.trim()) {
      setError("Please add a title first.");
      return;
    }
    if (!answer.trim()) {
      setError("Please complete your summary first.");
      return;
    }
    setStatuses((current) => ({ ...current, [item.id]: "submitted" }));
    setError("");
    const result = await saveCompletedAttempt({
      practiceItemId: item.databaseId,
      answerTitle: title,
      answerText: answer,
    });
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

  return (
    <div className="mock-workspace">
      <div className="mock-progress">
          <span>Mock Test {currentIndex + 1} / {totalItems}</span>
        <span className="sentence-progress-meta">
          {attemptSummary && <AttemptBadge summary={attemptSummary} />}
          <span>Requirements: Add a title · About {item.targetCharCount} Chinese characters</span>
        </span>
      </div>

      {status === "idle" ? (
        <section className="mock-start-panel">
            <span>HSK 6 Writing Mock Test</span>
          <h2>{item.title}</h2>
            <p>Read for 10 minutes. After the passage is hidden, add your own title and write a summary of about 400 Chinese characters within 35 minutes. Do not take notes or reopen the passage.</p>
            <button type="button" onClick={startMock}>Start Mock Test</button>
        </section>
      ) : (
        <>
          <div className={`mock-stage-bar ${remaining <= 60 && isActive ? "urgent" : ""}`} aria-live="polite">
            <div>
              <small>{status === "reading" ? "Phase One" : status === "writing" ? "Phase Two" : "Test Finished"}</small>
              <strong>{status === "reading" ? "Read the Passage" : status === "writing" ? "Write Your Summary" : status === "expired" ? "Writing Time Ended" : "Submitted"}</strong>
            </div>
            <time>{formatTime(remaining)}</time>
          </div>

          {(status === "reading" || hasFinished) && (
            <section className="mock-original">
              <span>{status === "reading" ? "Reading Passage" : "Original Passage Review"}</span>
              <p>{item.original}</p>
            </section>
          )}

          {status === "reading" && (
            <div className="mock-reading-rule">
                <span>Do not copy or take notes. Remember the people, sequence of events, and outcome.</span>
              <button className="finish-reading-button" type="button" onClick={finishReadingEarly}>
                  Finish Reading and Start Writing
              </button>
            </div>
          )}

          {(status === "writing" || hasFinished) && (
            <section className="mock-writing">
              <label>
                <span>Title</span>
                <input
                  value={title}
                  onChange={(event) => {
                    setTitles((current) => ({ ...current, [item.id]: event.target.value }));
                    setError("");
                  }}
                placeholder="Add a Chinese title"
                  disabled={hasFinished}
                />
              </label>
              <label>
                <div className="mock-writing-label">
                <span>Your Summary</span>
                <small className={answer.length >= 360 && answer.length <= 440 ? "near-target" : ""}>{answer.length} characters</small>
                </div>
                <textarea
                  value={answer}
                  onChange={(event) => {
                    setAnswers((current) => ({ ...current, [item.id]: event.target.value }));
                    setError("");
                  }}
                placeholder="Write your Chinese summary from memory without adding personal opinions…"
                  disabled={hasFinished}
                />
              </label>
              {error && <p className="sentence-practice-error" role="alert">{error}</p>}
              {status === "writing" && <button type="button" onClick={submitMock}>Submit Mock Response</button>}

              {hasFinished && (
                <div className="mock-reference">
            {status === "expired" && <p className="mock-expired">Writing time has ended. Your response can no longer be edited.</p>}
            <span>Suggested Title</span>
                  <h3>{item.referenceTitle}</h3>
            <span>Suggested Summary</span>
                  <p>{item.reference}</p>
                  <aside>
              <strong>Summary Approach</strong>
                    <p>{item.analysis}</p>
                  </aside>
                  {status === "submitted" && (
                    <AiFeedbackPanel
                      practiceItemId={item.databaseId}
                      answerTitle={title}
                      answerText={answer}
                      isAuthenticated={isAuthenticated}
                      isPaidMember={isPaidMember}
                    />
                  )}
            <a className="practice-discussion-link" href={`/community/practice/${item.databaseId}`}>Discuss This Exercise →</a>
                </div>
              )}
            </section>
          )}
        </>
      )}

      <nav className="sentence-navigation mock-navigation" aria-label="HSK 6 mock test navigation">
        <button type="button" onClick={() => changePage(questionPage - 1)} disabled={questionPage === 0 || isActive}>← Previous</button>
        <div>
          {visibleQuestionIndexes.map((index) => {
          const question = items[index];
          const locked = !question;
          return (
          <button
            type="button"
            className={`${index === currentIndex ? "current" : ""}${locked ? " locked" : ""}`}
            onClick={() => chooseQuestion(index)}
            disabled={isActive && index !== currentIndex}
              aria-label={locked ? `Mock test ${index + 1}, members only` : `Mock test ${index + 1}`}
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
          title="Unlock More HSK 6 Mock Tests"
          description={`Your free account includes the first ${items.length} mock tests. Mock test ${lockedTarget} and later are available with membership.`}
          onClose={closePaywall}
        />
      )}
    </div>
  );
}
