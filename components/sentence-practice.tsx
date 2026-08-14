"use client";

import { useState } from "react";
import type { SentencePracticeItem } from "../lib/practice-items";
import type { PracticeAttemptSummary } from "../lib/practice-attempt-summary";
import { saveCompletedAttempt } from "../lib/save-practice-attempt";
import AttemptBadge from "./attempt-badge";
import PracticeLockOverlay from "./practice-lock-overlay";

const QUESTIONS_PER_PAGE = 10;

export default function SentencePractice({
  items,
  totalItems,
  isPaidMember,
  initialAttemptSummaries,
}: {
  items: SentencePracticeItem[];
  totalItems: number;
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
      setError("请先写下你的缩写。");
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
        <span>练习 {currentIndex + 1} / {totalItems}</span>
        <span className="sentence-progress-meta">
          {attemptSummary && <AttemptBadge summary={attemptSummary} />}
          <span>已完成 {completedCount} / {totalItems}</span>
        </span>
      </div>

      <div className="sentence-progress-track">
        <span style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }} />
      </div>

      <section className="sentence-tip" aria-labelledby={`sentence-skill-${item.id}`}>
        <span>本题技巧</span>
        <div>
          <h2 id={`sentence-skill-${item.id}`}>{item.skill}</h2>
          <p>{item.tip}</p>
        </div>
      </section>

      <section className="sentence-original">
        <span className="sentence-kicker">原句</span>
        <p>{item.original}</p>
      </section>

      <section className="sentence-writing">
        <div className="sentence-writing-head">
          <div>
            <span className="sentence-kicker">我的缩写</span>
            <h2>用更简洁的话保留主要意思</h2>
          </div>
        </div>

        <textarea
          value={answer}
          onChange={(event) => {
            setAnswers((current) => ({ ...current, [item.id]: event.target.value }));
            setError("");
          }}
          placeholder="在这里写下你的缩写……"
          aria-label={`第 ${currentIndex + 1} 题的缩写`}
          disabled={isSubmitted}
        />

        {error && <p className="sentence-practice-error" role="alert">{error}</p>}

        {!isSubmitted ? (
          <button className="sentence-practice-submit" type="button" onClick={submitAnswer}>
            提交并查看参考答案
          </button>
        ) : (
          <div className="sentence-reference">
            <div>
              <strong>参考答案</strong>
            </div>
            <p>{item.reference}</p>
            <aside>
              <small>技巧解析 · {item.skill}</small>
              <span>{item.explanation}</span>
            </aside>
            <div className="practice-result-actions">
              <button type="button" onClick={editAnswer}>修改我的答案</button>
              <a href={`/community/practice/${item.databaseId}`}>讨论这道题 →</a>
            </div>
          </div>
        )}
      </section>

      <nav className="sentence-navigation" aria-label="句子练习题目导航">
        <button type="button" onClick={() => changePage(questionPage - 1)} disabled={questionPage === 0}>
          ← 上一页
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
              aria-label={locked ? `第 ${index + 1} 题，会员专享` : `第 ${index + 1} 题`}
              key={question?.id ?? `locked-${index}`}
            >
              {index + 1}{locked && <span aria-hidden="true"> · 锁定</span>}
            </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => changePage(questionPage + 1)}
          disabled={questionPage === totalPages - 1}
        >
          下一页 →
        </button>
      </nav>
      <p className="practice-pagination-status">第 {questionPage + 1} / {totalPages} 页</p>
      {!isPaidMember && lockedTarget !== null && (
        <PracticeLockOverlay
          title={`你已完成 ${items.length} 道免费句子缩写`}
          description={`第 ${lockedTarget} 道起为会员练习。解锁剩余 ${totalItems - items.length} 道题，继续提高信息提取与压缩能力。`}
          onClose={closePaywall}
        />
      )}
    </div>
  );
}
