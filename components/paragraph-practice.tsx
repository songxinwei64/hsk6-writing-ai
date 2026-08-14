"use client";

import { useEffect, useState } from "react";
import type { ParagraphPracticeItem } from "../lib/practice-items";
import type { PracticeAttemptSummary } from "../lib/practice-attempt-summary";
import { saveCompletedAttempt } from "../lib/save-practice-attempt";
import AttemptBadge from "./attempt-badge";
import PracticeLockOverlay from "./practice-lock-overlay";
import QuestionLockIcon from "./question-lock-icon";

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
    const confirmed = window.confirm("进入缩写后将无法再次查看原文，确定现在开始缩写吗？");
    if (!confirmed) return;
    setRemainingTimes((current) => ({ ...current, [item.id]: item.writingSeconds }));
    setStatuses((current) => ({ ...current, [item.id]: "writing" }));
  }

  async function submitAnswer() {
    if (!answer.trim()) {
      setError("请先写下你的缩写。");
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
        <span>练习 {currentIndex + 1} / {totalItems}</span>
        <span className="sentence-progress-meta">
          {attemptSummary && <AttemptBadge summary={attemptSummary} />}
          <span>已完成 {completedCount} / {totalItems}</span>
        </span>
      </div>

      <div className="sentence-progress-track">
        <span style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }} />
      </div>

      <section className="sentence-tip">
        <span>本题技巧</span>
        <div>
          <h2>{item.skill}</h2>
          <p>{item.tip}</p>
        </div>
      </section>

      {status === "idle" ? (
        <section className="paragraph-start-panel">
          <span>本题流程</span>
          <p>
            先阅读原文3分钟，再用7分钟完成缩写。
            <br />
            进入写作阶段后原文会被隐藏，不能重新查看。
          </p>
          <button type="button" onClick={startPractice}>开始阅读</button>
        </section>
      ) : (
        <>
          <div className={`paragraph-timer ${remaining <= 60 ? "urgent" : ""}`} aria-live="polite">
            <span>
              {status === "reading" && "阅读剩余时间"}
              {status === "writing" && "写作剩余时间"}
              {hasFinished && (status === "expired" ? "写作时间已到" : "本题已提交")}
            </span>
            <strong>{formatTime(remaining)}</strong>
          </div>

          {(status === "reading" || hasFinished) && (
            <section className="paragraph-original">
              <span className="sentence-kicker">{status === "reading" ? "阅读材料" : "原文回顾"}</span>
              <p>{item.original}</p>
            </section>
          )}

          {status === "reading" ? (
            <section className="paragraph-reading-note">
              <strong>阅读阶段</strong>
              <p>阅读时不能记录。请记住主要人物、核心事件、原因和结果，倒计时结束后原文将自动隐藏。</p>
              <button className="finish-reading-button" type="button" onClick={finishReadingEarly}>
                提前结束阅读，开始缩写
              </button>
            </section>
          ) : (
          <section className="sentence-writing paragraph-writing">
            <div className="sentence-writing-head">
              <div>
                <span className="sentence-kicker">我的缩写</span>
                <h2>用连贯的短文保留主要内容</h2>
              </div>
            </div>
            <textarea
              value={answer}
              onChange={(event) => {
                setAnswers((current) => ({ ...current, [item.id]: event.target.value }));
                setError("");
              }}
              placeholder="在这里写下你的短文缩写……"
              aria-label={`第 ${currentIndex + 1} 篇短文的缩写`}
              disabled={hasFinished}
            />
            {error && <p className="sentence-practice-error" role="alert">{error}</p>}
            {!hasFinished ? (
              <button className="sentence-practice-submit" type="button" onClick={submitAnswer}>
                提交并查看参考答案
              </button>
            ) : (
              <div className="sentence-reference">
                {status === "expired" && !answer.trim() && <p className="paragraph-expired-note">本题时间已到，你还没有提交答案。</p>}
                <div><strong>参考答案</strong></div>
                <p>{item.reference}</p>
                <aside>
                  <small>技巧解析 · {item.skill}</small>
                  <span>{item.explanation}</span>
                </aside>
                <a className="practice-discussion-link" href={`/community/practice/${item.databaseId}`}>讨论这道题 →</a>
              </div>
            )}
          </section>
          )}
        </>
      )}

      <nav className="sentence-navigation" aria-label="短文练习题目导航">
        <button type="button" onClick={() => changePage(questionPage - 1)} disabled={questionPage === 0 || isActive}>← 上一页</button>
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
              aria-label={locked ? `第 ${index + 1} 篇短文，${isAuthenticated ? "会员专享" : "登录后解锁"}` : `第 ${index + 1} 篇短文`}
              key={question?.id ?? `locked-${index}`}
            >
              {index + 1}{locked && <QuestionLockIcon />}
            </button>
            );
          })}
        </div>
        <button type="button" onClick={() => changePage(questionPage + 1)} disabled={questionPage === totalPages - 1 || isActive}>下一页 →</button>
      </nav>
      <p className="practice-pagination-status">第 {questionPage + 1} / {totalPages} 页</p>
      {!isPaidMember && lockedTarget !== null && (
        <PracticeLockOverlay
          variant={isAuthenticated ? "membership" : "login"}
          title={isAuthenticated ? `继续解锁短文缩写练习` : `登录后继续短文缩写`}
          description={isAuthenticated
            ? `当前免费范围开放前 ${items.length} 篇。第 ${lockedTarget} 篇起为会员练习，解锁后可继续训练完整主线与连贯表达。`
            : `游客可以体验 ${items.length} 篇。登录后可免费练习前 ${loggedInFreeItems} 篇，并保存每次练习记录。`}
          loginNext="/practice/paragraph"
          onClose={closePaywall}
        />
      )}
    </div>
  );
}
