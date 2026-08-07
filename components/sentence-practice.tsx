"use client";

import { useState } from "react";
import { sentencePracticeItems } from "../data/sentence-practice";

export default function SentencePractice() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [error, setError] = useState("");

  const item = sentencePracticeItems[currentIndex];
  const answer = answers[item.id] || "";
  const isSubmitted = Boolean(submitted[item.id]);
  const completedCount = Object.keys(submitted).length;

  function moveTo(index: number) {
    setCurrentIndex(Math.min(Math.max(index, 0), sentencePracticeItems.length - 1));
    setError("");
  }

  function submitAnswer() {
    if (!answer.trim()) {
      setError("请先写下你的缩写。");
      return;
    }
    setSubmitted((current) => ({ ...current, [item.id]: true }));
    setError("");
  }

  function editAnswer() {
    setSubmitted((current) => ({ ...current, [item.id]: false }));
  }

  return (
    <div className="sentence-workspace">
      <div className="sentence-progress-head">
        <span>练习 {currentIndex + 1} / {sentencePracticeItems.length}</span>
        <span>已完成 {completedCount} / {sentencePracticeItems.length}</span>
      </div>
      <div className="sentence-progress-track">
        <span style={{ width: `${((currentIndex + 1) / sentencePracticeItems.length) * 100}%` }} />
      </div>

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
              <small>简要解析</small>
              <span>{item.explanation}</span>
            </aside>
            <button type="button" onClick={editAnswer}>修改我的答案</button>
          </div>
        )}
      </section>

      <nav className="sentence-navigation" aria-label="句子练习题目导航">
        <button type="button" onClick={() => moveTo(currentIndex - 1)} disabled={currentIndex === 0}>
          ← 上一题
        </button>
        <div>
          {sentencePracticeItems.map((question, index) => (
            <button
              className={`${index === currentIndex ? "current" : ""}${submitted[question.id] ? " completed" : ""}`}
              type="button"
              onClick={() => moveTo(index)}
              aria-label={`第 ${index + 1} 题`}
              key={question.id}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => moveTo(currentIndex + 1)}
          disabled={currentIndex === sentencePracticeItems.length - 1}
        >
          下一题 →
        </button>
      </nav>
    </div>
  );
}
