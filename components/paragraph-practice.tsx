"use client";

import { useEffect, useState } from "react";
import type { ParagraphPracticeItem } from "../lib/practice-items";

type PracticeStatus = "idle" | "reading" | "writing" | "submitted" | "expired";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export default function ParagraphPractice({ items }: { items: ParagraphPracticeItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [statuses, setStatuses] = useState<Record<number, PracticeStatus>>({});
  const [remainingTimes, setRemainingTimes] = useState<Record<number, number>>({});
  const [error, setError] = useState("");

  const item = items[currentIndex];
  const answer = answers[item.id] || "";
  const status = statuses[item.id] || "idle";
  const remaining = remainingTimes[item.id] ?? item.readingSeconds;
  const hasFinished = status === "submitted" || status === "expired";
  const isActive = status === "reading" || status === "writing";
  const completedCount = Object.values(statuses).filter(
    (value) => value === "submitted" || value === "expired",
  ).length;

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
    setCurrentIndex(Math.min(Math.max(index, 0), items.length - 1));
    setError("");
  }

  function startPractice() {
    setRemainingTimes((current) => ({ ...current, [item.id]: item.readingSeconds }));
    setStatuses((current) => ({ ...current, [item.id]: "reading" }));
  }

  function submitAnswer() {
    if (!answer.trim()) {
      setError("请先写下你的缩写。");
      return;
    }
    setStatuses((current) => ({ ...current, [item.id]: "submitted" }));
    setError("");
  }

  return (
    <div className="paragraph-workspace">
      <div className="sentence-progress-head">
        <span>练习 {currentIndex + 1} / {items.length}</span>
        <span>已完成 {completedCount} / {items.length}</span>
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
              </div>
            )}
          </section>
          )}
        </>
      )}

      <nav className="sentence-navigation" aria-label="短文练习题目导航">
        <button type="button" onClick={() => moveTo(currentIndex - 1)} disabled={currentIndex === 0 || isActive}>← 上一题</button>
        <div>
          {items.map((question, index) => (
            <button
              className={`${index === currentIndex ? "current" : ""}${statuses[question.id] === "submitted" || statuses[question.id] === "expired" ? " completed" : ""}`}
              type="button"
              onClick={() => moveTo(index)}
              disabled={isActive && index !== currentIndex}
              aria-label={`第 ${index + 1} 篇短文`}
              key={question.id}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => moveTo(currentIndex + 1)} disabled={currentIndex === items.length - 1 || isActive}>下一题 →</button>
      </nav>
    </div>
  );
}
