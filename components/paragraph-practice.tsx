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
  const zh = locale === "zh";
  const ko = locale === "ko";
  const text = (z: string, e: string, k: string) => zh ? z : ko ? k : e;

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
    const confirmed = window.confirm(text("进入写作后不能再次查看原文。现在开始写作吗？", "Once writing begins, you cannot view the original passage again. Start writing now?", "쓰기 시작 후에는 원문을 다시 볼 수 없습니다. 지금 시작할까요?"));
    if (!confirmed) return;
    setRemainingTimes((current) => ({ ...current, [item.id]: item.writingSeconds }));
    setStatuses((current) => ({ ...current, [item.id]: "writing" }));
  }

  async function submitAnswer() {
    if (!answer.trim()) {
      setError(text("请先写下你的缩写。", "Please write your summary first.", "먼저 요약문을 작성하세요."));
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
          <span>{text("练习", "Exercise", "연습")} {currentIndex + 1} / {totalItems}</span>
        <span className="sentence-progress-meta">
          {attemptSummary && <AttemptBadge summary={attemptSummary} />}
          <span>{text("已完成", "Completed", "완료")} {completedCount} / {totalItems}</span>
        </span>
      </div>

      <div className="sentence-progress-track">
        <span style={{ width: `${((currentIndex + 1) / totalItems) * 100}%` }} />
      </div>

      <section className="sentence-tip">
            <span>{text("本题技巧", "Key Skill", "핵심 기술")}</span>
        <div>
          <h2>{locale === "en" ? (item.skillEn ?? item.skill) : item.skill}</h2>
          <p>{locale === "en" ? (item.tipEn ?? item.tip) : item.tip}</p>
        </div>
      </section>

      {status === "idle" ? (
        <section className="paragraph-start-panel">
            <span>{text("本题流程", "Exercise Flow", "연습 순서")}</span>
          <p>
              {text("阅读原文3分钟，然后用7分钟完成缩写。", "Read the original passage for 3 minutes, then write your summary in 7 minutes.", "원문을 3분 동안 읽고 7분 동안 요약문을 작성합니다.")}
            <br />
              {text("进入写作后原文将被隐藏，不能再次查看。", "The passage will be hidden during writing and cannot be reopened.", "쓰기 단계에서는 원문이 가려지며 다시 볼 수 없습니다.")}
          </p>
            <button type="button" onClick={startPractice}>{text("开始阅读", "Start Reading", "읽기 시작")}</button>
        </section>
      ) : (
        <>
          <div className={`paragraph-timer ${remaining <= 60 ? "urgent" : ""}`} aria-live="polite">
            <span>
              {status === "reading" && text("剩余阅读时间", "Reading Time Remaining", "남은 읽기 시간")}
              {status === "writing" && text("剩余写作时间", "Writing Time Remaining", "남은 쓰기 시간")}
              {hasFinished && (status === "expired" ? text("写作时间已结束", "Writing Time Ended", "쓰기 시간이 끝났습니다") : text("已提交", "Submitted", "제출 완료"))}
            </span>
            <strong>{formatTime(remaining)}</strong>
          </div>

          {(status === "reading" || hasFinished) && (
            <section className="paragraph-original">
              <span className="sentence-kicker">{status === "reading" ? text("阅读原文", "Reading Passage", "읽기 자료") : text("原文回顾", "Original Passage Review", "원문 다시 보기")}</span>
              <p>{item.original}</p>
            </section>
          )}

          {status === "reading" ? (
            <section className="paragraph-reading-note">
                <strong>{text("阅读阶段", "Reading Phase", "읽기 단계")}</strong>
                <p>{text("请勿做笔记。请记住主要人物、事件、原因和结果。阅读时间结束后，原文将被隐藏。", "Do not take notes. Remember the main people, events, reasons, and outcome. The passage will be hidden when time ends.", "메모하지 말고 주요 인물, 사건, 이유와 결과를 기억하세요. 읽기 시간이 끝나면 원문이 가려집니다.")}</p>
              <button className="finish-reading-button" type="button" onClick={finishReadingEarly}>
                  {text("提前结束阅读，开始写作", "Finish Reading and Start Writing", "읽기를 마치고 쓰기 시작")}
              </button>
            </section>
          ) : (
          <section className="sentence-writing paragraph-writing">
            <div className="sentence-writing-head">
              <div>
              <span className="sentence-kicker">{text("我的缩写", "Your Summary", "나의 요약")}</span>
              <h2>{text("连贯地概括主要内容", "Retell the Main Content Coherently", "주요 내용을 자연스럽게 요약하세요")}</h2>
              </div>
            </div>
            <textarea
              value={answer}
              onChange={(event) => {
                setAnswers((current) => ({ ...current, [item.id]: event.target.value }));
                setError("");
              }}
              placeholder={text("在这里写下你的中文缩写……", "Write your Chinese passage summary here…", "중국어 요약문을 입력하세요……")}
              aria-label={text(`第 ${currentIndex + 1} 题短文缩写`, `Summary for passage ${currentIndex + 1}`, `${currentIndex + 1}번 단락 요약`)}
              disabled={hasFinished}
            />
            {error && <p className="sentence-practice-error" role="alert">{error}</p>}
            {!hasFinished ? (
              <button className="sentence-practice-submit" type="button" onClick={submitAnswer}>
                {text("提交并查看参考答案", "Submit and View Suggested Answer", "제출하고 예시 답안 보기")}
              </button>
            ) : (
              <div className="sentence-reference">
            {status === "expired" && !answer.trim() && <p className="paragraph-expired-note">{text("时间已到，尚未提交答案。", "Time is up and no answer was submitted.", "시간이 끝났으며 제출된 답안이 없습니다.")}</p>}
            <div><strong>{text("参考答案", "Suggested Answer", "예시 답안")}</strong></div>
                <p>{item.reference}</p>
                <aside>
              <small>{text("简要解析", "Key Point", "핵심 해설")} · {locale === "en" ? (item.skillEn ?? item.skill) : item.skill}</small>
                  <span>{locale === "en" ? (item.explanationEn ?? item.explanation) : item.explanation}</span>
                </aside>
            <a className="practice-discussion-link" href={`/community/practice/${item.databaseId}`}>{text("讨论这道题 →", "Discuss This Exercise →", "이 문제 토론하기 →")}</a>
              </div>
            )}
          </section>
          )}
        </>
      )}

      <nav className="sentence-navigation" aria-label={text("短文缩写题目导航", "Passage exercise navigation", "단락 요약 문제 탐색")}>
        <button type="button" onClick={() => chooseQuestion(currentIndex - 1)} disabled={currentIndex === 0 || isActive}>{text("← 上一题", "← Previous", "← 이전")}</button>
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
              aria-label={locked ? text(`第 ${index + 1} 题，${isAuthenticated ? "会员专享" : "登录后解锁"}`, `Passage ${index + 1}, ${isAuthenticated ? "members only" : "sign in to unlock"}`, `${index + 1}번, ${isAuthenticated ? "회원 전용" : "로그인 후 이용"}`) : text(`第 ${index + 1} 题`, `Passage ${index + 1}`, `${index + 1}번 문제`)}
              key={question?.id ?? `locked-${index}`}
            >
              {index + 1}{locked && <QuestionLockIcon />}
            </button>
            );
          })}
        </div>
        <button type="button" onClick={() => chooseQuestion(currentIndex + 1)} disabled={currentIndex === totalItems - 1 || isActive}>{text("下一题 →", "Next →", "다음 →")}</button>
      </nav>
      <p className="practice-pagination-status">{text(`第 ${questionPage + 1} / ${totalPages} 页`, `Page ${questionPage + 1} of ${totalPages}`, `${questionPage + 1} / ${totalPages} 페이지`)}</p>
      {!isPaidMember && lockedTarget !== null && (
        <PracticeLockOverlay
          variant={isAuthenticated ? "membership" : "login"}
          title={text(isAuthenticated ? "解锁更多短文缩写练习" : "登录后练习更多短文", isAuthenticated ? "Unlock More Passage Exercises" : "Sign In for More Passage Exercises", isAuthenticated ? "더 많은 단락 요약 잠금 해제" : "로그인 후 더 많은 단락 연습")}
          description={text(
            isAuthenticated ? `免费账号可练习前 ${items.length} 道短文题，第 ${lockedTarget} 题及之后的题目需开通会员。` : `游客可体验 ${items.length} 道短文题。登录后可练习前 ${loggedInFreeItems} 道题，并保存练习记录。`,
            isAuthenticated ? `Your free account includes the first ${items.length} passages. Passage ${lockedTarget} and later are available with membership.` : `Guests can try ${items.length} passages. Sign in to access the first ${loggedInFreeItems} passages and save your practice history.`,
            isAuthenticated ? `무료 계정은 처음 ${items.length}문제를 연습할 수 있으며 ${lockedTarget}번부터는 멤버십이 필요합니다.` : `게스트는 ${items.length}문제를 체험할 수 있습니다. 로그인하면 ${loggedInFreeItems}문제와 기록 저장을 이용할 수 있습니다.`
          )}
          loginNext="/practice/paragraph"
          onClose={closePaywall}
        />
      )}
    </div>
  );
}
