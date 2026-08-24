"use client";

import { useState } from "react";
import type { SentencePracticeItem } from "../lib/practice-items";
import type { PracticeAttemptSummary } from "../lib/practice-attempt-summary";
import { saveCompletedAttempt } from "../lib/save-practice-attempt";
import AttemptBadge from "./attempt-badge";
import PracticeLockOverlay from "./practice-lock-overlay";
import QuestionLockIcon from "./question-lock-icon";
import { useSiteLocale } from "../lib/use-site-locale";

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
  const locale = useSiteLocale();
  const t = locale === "zh" ? {
    exercise: "练习", completed: "已完成", skill: "本题技巧", original: "原句", summary: "我的缩写",
    summaryTitle: "用更少的字保留主要意思", placeholder: "在这里写下你的中文缩写……", submit: "提交并查看参考答案",
    reference: "参考答案", keyPoint: "简要解析", edit: "修改我的答案", discuss: "讨论这道题 →",
    previous: "← 上一题", next: "下一题 →", page: "页", error: "请先写下你的缩写。",
  } : locale === "ko" ? {
    exercise: "연습", completed: "완료", skill: "핵심 기술", original: "원문", summary: "나의 요약",
    summaryTitle: "더 적은 글자로 핵심을 남기세요", placeholder: "중국어 요약문을 입력하세요……", submit: "제출하고 예시 답안 보기",
    reference: "예시 답안", keyPoint: "핵심 해설", edit: "답안 수정", discuss: "이 문제 토론하기 →",
    previous: "← 이전", next: "다음 →", page: "페이지", error: "먼저 요약문을 작성하세요.",
  } : {
    exercise: "Exercise", completed: "Completed", skill: "Key Skill", original: "Original Sentence", summary: "Your Summary",
    summaryTitle: "Keep the Main Idea in Fewer Words", placeholder: "Write your Chinese summary here…", submit: "Submit and View Suggested Answer",
    reference: "Suggested Answer", keyPoint: "Key Point", edit: "Edit My Answer", discuss: "Discuss This Exercise →",
    previous: "← Previous", next: "Next →", page: "Page", error: "Please write your summary first.",
  };

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
      setError(t.error);
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
          <span>{t.exercise} {currentIndex + 1} / {totalItems}</span>
        <span className="sentence-progress-meta">
          {attemptSummary && <AttemptBadge summary={attemptSummary} />}
          <span>{t.completed} {completedCount} / {totalItems}</span>
        </span>
      </div>

      <div className="sentence-progress-track">
        <span style={{ width: `${((currentIndex + 1) / totalItems) * 100}%` }} />
      </div>

      <section className="sentence-tip" aria-labelledby={`sentence-skill-${item.id}`}>
            <span>{t.skill}</span>
        <div>
          <h2 id={`sentence-skill-${item.id}`}>{locale === "en" ? (item.skillEn ?? item.skill) : item.skill}</h2>
          <p>{locale === "en" ? (item.tipEn ?? item.tip) : item.tip}</p>
        </div>
      </section>

      <section className="sentence-original">
          <span className="sentence-kicker">{t.original}</span>
        <p>{item.original}</p>
      </section>

      <section className="sentence-writing">
        <div className="sentence-writing-head">
          <div>
            <span className="sentence-kicker">{t.summary}</span>
            <h2>{t.summaryTitle}</h2>
          </div>
        </div>

        <textarea
          value={answer}
          onChange={(event) => {
            setAnswers((current) => ({ ...current, [item.id]: event.target.value }));
            setError("");
          }}
            placeholder={t.placeholder}
          aria-label={locale === "zh" ? `第 ${currentIndex + 1} 题的缩写答案` : locale === "ko" ? `${currentIndex + 1}번 문제 요약 답안` : `Summary for exercise ${currentIndex + 1}`}
          disabled={isSubmitted}
        />

        {error && <p className="sentence-practice-error" role="alert">{error}</p>}

        {!isSubmitted ? (
          <button className="sentence-practice-submit" type="button" onClick={submitAnswer}>
              {t.submit}
          </button>
        ) : (
          <div className="sentence-reference">
            <div>
                <strong>{t.reference}</strong>
            </div>
            <p>{item.reference}</p>
            <aside>
                <small>{t.keyPoint} · {locale === "en" ? (item.skillEn ?? item.skill) : item.skill}</small>
              <span>{locale === "en" ? (item.explanationEn ?? item.explanation) : item.explanation}</span>
            </aside>
            <div className="practice-result-actions">
                <button type="button" onClick={editAnswer}>{t.edit}</button>
                <a href={`/community/practice/${item.databaseId}`}>{t.discuss}</a>
            </div>
          </div>
        )}
      </section>

      <nav className="sentence-navigation" aria-label={locale === "zh" ? "句子缩写题目导航" : locale === "ko" ? "문장 요약 문제 탐색" : "Sentence exercise navigation"}>
        <button type="button" onClick={() => chooseQuestion(currentIndex - 1)} disabled={currentIndex === 0}>
          {t.previous}
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
              aria-label={locked ? (locale === "zh" ? `第 ${index + 1} 题，${isAuthenticated ? "会员专享" : "登录后解锁"}` : locale === "ko" ? `${index + 1}번, ${isAuthenticated ? "회원 전용" : "로그인 후 이용"}` : `Exercise ${index + 1}, ${isAuthenticated ? "members only" : "sign in to unlock"}`) : (locale === "zh" ? `第 ${index + 1} 题` : locale === "ko" ? `${index + 1}번 문제` : `Exercise ${index + 1}`)}
              key={question?.id ?? `locked-${index}`}
            >
              {index + 1}{locked && <QuestionLockIcon />}
            </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => chooseQuestion(currentIndex + 1)}
          disabled={currentIndex === totalItems - 1}
        >
          {t.next}
        </button>
      </nav>
      <p className="practice-pagination-status">{locale === "zh" ? `第 ${questionPage + 1} / ${totalPages} 页` : locale === "ko" ? `${questionPage + 1} / ${totalPages} 페이지` : `Page ${questionPage + 1} of ${totalPages}`}</p>
      {!isPaidMember && lockedTarget !== null && (
        <PracticeLockOverlay
          variant={isAuthenticated ? "membership" : "login"}
          title={locale === "zh" ? (isAuthenticated ? "解锁更多句子缩写练习" : "登录后练习更多句子") : locale === "ko" ? (isAuthenticated ? "더 많은 문장 요약 잠금 해제" : "로그인 후 더 많은 문장 연습") : (isAuthenticated ? "Unlock More Sentence Exercises" : "Sign In for More Sentence Exercises")}
          description={locale === "zh"
            ? (isAuthenticated ? `免费账号可练习前 ${items.length} 道句子题，第 ${lockedTarget} 题及之后的题目需开通会员。` : `游客可体验 ${items.length} 道句子题。登录后可练习前 ${loggedInFreeItems} 道题，并保存练习记录。`)
            : locale === "ko"
              ? (isAuthenticated ? `무료 계정은 처음 ${items.length}문제를 연습할 수 있으며 ${lockedTarget}번부터는 멤버십이 필요합니다.` : `게스트는 ${items.length}문제를 체험할 수 있습니다. 로그인하면 ${loggedInFreeItems}문제와 기록 저장을 이용할 수 있습니다.`)
              : (isAuthenticated ? `Your free account includes the first ${items.length} exercises. Exercise ${lockedTarget} and later are available with membership.` : `Guests can try ${items.length} exercises. Sign in to access the first ${loggedInFreeItems} exercises and save your practice history.`)}
          loginNext="/practice/sentence"
          onClose={closePaywall}
        />
      )}
    </div>
  );
}
