"use client";

import { useState } from "react";
import type { SentencePracticeItem } from "../lib/practice-items";
import { saveCompletedAttempt } from "../lib/save-practice-attempt";

export default function SentencePractice({
  items,
  totalItems,
  isPaidMember,
}: {
  items: SentencePracticeItem[];
  totalItems: number;
  isPaidMember: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [error, setError] = useState("");

  const item = items[currentIndex];
  const answer = answers[item.id] || "";
  const isSubmitted = Boolean(submitted[item.id]);
  const completedCount = Object.keys(submitted).length;

  function moveTo(index: number) {
    setCurrentIndex(Math.min(Math.max(index, 0), items.length - 1));
    setError("");
  }

  function chooseQuestion(index: number) {
    if (index >= items.length) {
      window.location.href = "/membership";
      return;
    }
    moveTo(index);
  }

  function submitAnswer() {
    if (!answer.trim()) {
      setError("请先写下你的缩写。");
      return;
    }
    setSubmitted((current) => ({ ...current, [item.id]: true }));
    setError("");
    void saveCompletedAttempt({ practiceItemId: item.databaseId, answerText: answer });
  }

  function editAnswer() {
    setSubmitted((current) => ({ ...current, [item.id]: false }));
  }

  return (
    <div className="sentence-workspace">
      <div className="sentence-progress-head">
        <span>练习 {currentIndex + 1} / {totalItems}</span>
        <span>已完成 {completedCount} / {totalItems}</span>
      </div>

      {!isPaidMember && items.length < totalItems && (
        <div className="mock-guest-notice">
          <div>
            <strong>免费版开放 {items.length} / {totalItems} 题</strong>
            <span>升级会员后可以练习全部句子缩写题。</span>
          </div>
          <a href="/membership">查看会员权益</a>
        </div>
      )}
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
        <button type="button" onClick={() => moveTo(currentIndex - 1)} disabled={currentIndex === 0}>
          ← 上一题
        </button>
        <div>
          {Array.from({ length: totalItems }, (_, index) => {
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
          onClick={() => chooseQuestion(currentIndex + 1)}
          disabled={currentIndex === totalItems - 1}
        >
          下一题 →
        </button>
      </nav>
    </div>
  );
}
