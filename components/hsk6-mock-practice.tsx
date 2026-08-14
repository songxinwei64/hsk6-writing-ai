"use client";

import { useEffect, useState } from "react";
import type { Hsk6MockPracticeItem } from "../lib/practice-items";
import type { PracticeAttemptSummary } from "../lib/practice-attempt-summary";
import { saveCompletedAttempt } from "../lib/save-practice-attempt";
import AiFeedbackPanel from "./ai-feedback-panel";
import AttemptBadge from "./attempt-badge";
import PracticeLockOverlay from "./practice-lock-overlay";

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
    const confirmed = window.confirm("进入缩写后将无法再次查看原文，确定现在开始缩写吗？");
    if (!confirmed) return;
    setRemainingTimes((current) => ({ ...current, [item.id]: item.writingSeconds }));
    setStatuses((current) => ({ ...current, [item.id]: "writing" }));
  }

  async function submitMock() {
    if (!title.trim()) {
      setError("请先填写标题。");
      return;
    }
    if (!answer.trim()) {
      setError("请先完成缩写。");
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
        <span>模拟题 {currentIndex + 1} / {totalItems}</span>
        <span className="sentence-progress-meta">
          {attemptSummary && <AttemptBadge summary={attemptSummary} />}
          <span>写作要求：自拟标题 · {item.targetCharCount}字左右</span>
        </span>
      </div>

      {status === "idle" ? (
        <section className="mock-start-panel">
          <span>HSK 6 写作模拟</span>
          <h2>{item.title}</h2>
          <p>阅读原文10分钟。阅读结束后原文将被隐藏，请在35分钟内自拟标题并完成约400字的缩写。阅读时不能记录，写作时不能重新查看原文。</p>
          <button type="button" onClick={startMock}>开始模拟</button>
        </section>
      ) : (
        <>
          <div className={`mock-stage-bar ${remaining <= 60 && isActive ? "urgent" : ""}`} aria-live="polite">
            <div>
              <small>{status === "reading" ? "第一阶段" : status === "writing" ? "第二阶段" : "模拟结束"}</small>
              <strong>{status === "reading" ? "阅读原文" : status === "writing" ? "完成缩写" : status === "expired" ? "写作时间已到" : "已提交"}</strong>
            </div>
            <time>{formatTime(remaining)}</time>
          </div>

          {(status === "reading" || hasFinished) && (
            <section className="mock-original">
              <span>{status === "reading" ? "阅读材料" : "原文回顾"}</span>
              <p>{item.original}</p>
            </section>
          )}

          {status === "reading" && (
            <div className="mock-reading-rule">
              <span>阅读时不能抄写或记录。请记住人物、事件发展和结果。</span>
              <button className="finish-reading-button" type="button" onClick={finishReadingEarly}>
                提前结束阅读，开始缩写
              </button>
            </div>
          )}

          {(status === "writing" || hasFinished) && (
            <section className="mock-writing">
              <label>
                <span>标题</span>
                <input
                  value={title}
                  onChange={(event) => {
                    setTitles((current) => ({ ...current, [item.id]: event.target.value }));
                    setError("");
                  }}
                  placeholder="请自拟标题"
                  disabled={hasFinished}
                />
              </label>
              <label>
                <div className="mock-writing-label">
                  <span>我的缩写</span>
                  <small className={answer.length >= 360 && answer.length <= 440 ? "near-target" : ""}>{answer.length} 字</small>
                </div>
                <textarea
                  value={answer}
                  onChange={(event) => {
                    setAnswers((current) => ({ ...current, [item.id]: event.target.value }));
                    setError("");
                  }}
                  placeholder="请根据记忆完成缩写，不要加入自己的观点……"
                  disabled={hasFinished}
                />
              </label>
              {error && <p className="sentence-practice-error" role="alert">{error}</p>}
              {status === "writing" && <button type="button" onClick={submitMock}>提交模拟作文</button>}

              {hasFinished && (
                <div className="mock-reference">
                  {status === "expired" && <p className="mock-expired">写作时间已到，当前内容已停止编辑。</p>}
                  <span>参考标题</span>
                  <h3>{item.referenceTitle}</h3>
                  <span>参考缩写</span>
                  <p>{item.reference}</p>
                  <aside>
                    <strong>缩写思路</strong>
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
                  <a className="practice-discussion-link" href={`/community/practice/${item.databaseId}`}>讨论这道题 →</a>
                </div>
              )}
            </section>
          )}
        </>
      )}

      <nav className="sentence-navigation mock-navigation" aria-label="HSK 6模拟题导航">
        <button type="button" onClick={() => changePage(questionPage - 1)} disabled={questionPage === 0 || isActive}>← 上一页</button>
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
            aria-label={locked ? `模拟题 ${index + 1}，会员专享` : `模拟题 ${index + 1}`}
            key={question?.id ?? `locked-${index}`}
          >
            {index + 1}{locked && <span aria-hidden="true"> · 锁定</span>}
          </button>
          );
        })}
        </div>
        <button type="button" onClick={() => changePage(questionPage + 1)} disabled={questionPage === totalPages - 1 || isActive}>下一页 →</button>
      </nav>
      <p className="practice-pagination-status">第 {questionPage + 1} / {totalPages} 页</p>
      {!isPaidMember && lockedTarget !== null && (
        <PracticeLockOverlay
          title={`你已完成 ${items.length} 篇免费 HSK 写作模拟`}
          description={`第 ${lockedTarget} 篇起为会员模拟题。解锁剩余 ${totalItems - items.length} 篇，按照真实 HSK 6 考试流程继续训练。`}
          onClose={closePaywall}
        />
      )}
    </div>
  );
}
