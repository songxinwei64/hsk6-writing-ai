"use client";

import { useEffect, useState } from "react";
import type { Hsk6MockPracticeItem } from "../lib/practice-items";
import type { PracticeAttemptSummary } from "../lib/practice-attempt-summary";
import { saveCompletedAttempt } from "../lib/save-practice-attempt";
import AiFeedbackPanel from "./ai-feedback-panel";
import { useSiteLocale } from "../lib/use-site-locale";
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
  const locale = useSiteLocale();
  const zh = locale === "zh";
  const ko = locale === "ko";
  const text = (z: string, e: string, k: string) => zh ? z : ko ? k : e;
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
    const confirmed = window.confirm(text("进入写作后不能再次查看原文。现在开始写作吗？", "Once writing begins, you cannot view the original passage again. Start writing now?", "쓰기 시작 후에는 원문을 다시 볼 수 없습니다. 지금 시작할까요?"));
    if (!confirmed) return;
    setRemainingTimes((current) => ({ ...current, [item.id]: item.writingSeconds }));
    setStatuses((current) => ({ ...current, [item.id]: "writing" }));
  }

  async function submitMock() {
    if (!title.trim()) {
      setError(text("请先填写标题。", "Please add a title first.", "먼저 제목을 작성하세요."));
      return;
    }
    if (!answer.trim()) {
      setError(text("请先完成缩写。", "Please complete your summary first.", "먼저 요약문을 완성하세요."));
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
          <span>{text("模拟题", "Mock Test", "모의고사")} {currentIndex + 1} / {totalItems}</span>
        <span className="sentence-progress-meta">
          {attemptSummary && <AttemptBadge summary={attemptSummary} />}
          <span>{text(`要求：自拟标题 · 约 ${item.targetCharCount} 个汉字`, `Requirements: Add a title · About ${item.targetCharCount} Chinese characters`, `조건: 제목 작성 · 중국어 약 ${item.targetCharCount}자`)}</span>
        </span>
      </div>

      {status === "idle" ? (
        <section className="mock-start-panel">
            <span>{text("HSK 6 写作模拟", "HSK 6 Writing Mock Test", "HSK 6 쓰기 모의고사")}</span>
          <h2>{item.title}</h2>
            <p>{text("阅读原文10分钟。原文隐藏后，自拟标题，并在35分钟内完成约400字的缩写。不能记笔记，也不能再次查看原文。", "Read for 10 minutes. After the passage is hidden, add your own title and write a summary of about 400 Chinese characters within 35 minutes. Do not take notes or reopen the passage.", "원문을 10분 동안 읽습니다. 원문이 가려진 뒤 제목을 정하고 35분 안에 약 400자의 요약문을 작성하세요. 메모하거나 원문을 다시 볼 수 없습니다.")}</p>
            <button type="button" onClick={startMock}>{text("开始模拟", "Start Mock Test", "모의고사 시작")}</button>
        </section>
      ) : (
        <>
          <div className={`mock-stage-bar ${remaining <= 60 && isActive ? "urgent" : ""}`} aria-live="polite">
            <div>
              <small>{status === "reading" ? text("第一阶段", "Phase One", "1단계") : status === "writing" ? text("第二阶段", "Phase Two", "2단계") : text("模拟结束", "Test Finished", "모의고사 종료")}</small>
              <strong>{status === "reading" ? text("阅读原文", "Read the Passage", "원문 읽기") : status === "writing" ? text("完成缩写", "Write Your Summary", "요약문 작성") : status === "expired" ? text("写作时间结束", "Writing Time Ended", "쓰기 시간 종료") : text("已提交", "Submitted", "제출 완료")}</strong>
            </div>
            <time>{formatTime(remaining)}</time>
          </div>

          {(status === "reading" || hasFinished) && (
            <section className="mock-original">
              <span>{status === "reading" ? text("阅读原文", "Reading Passage", "원문 읽기") : text("原文回顾", "Original Passage Review", "원문 다시 보기")}</span>
              <p>{item.original}</p>
            </section>
          )}

          {status === "reading" && (
            <div className="mock-reading-rule">
                <span>{text("不能抄写或记笔记。请记住人物、事件顺序和结果。", "Do not copy or take notes. Remember the people, sequence of events, and outcome.", "베껴 쓰거나 메모하지 마세요. 인물, 사건의 순서와 결과를 기억하세요.")}</span>
              <button className="finish-reading-button" type="button" onClick={finishReadingEarly}>
                  {text("结束阅读，开始写作", "Finish Reading and Start Writing", "읽기를 마치고 쓰기 시작")}
              </button>
            </div>
          )}

          {(status === "writing" || hasFinished) && (
            <section className="mock-writing">
              <label>
                <span>{text("标题", "Title", "제목")}</span>
                <input
                  value={title}
                  onChange={(event) => {
                    setTitles((current) => ({ ...current, [item.id]: event.target.value }));
                    setError("");
                  }}
                placeholder={text("填写中文标题", "Add a Chinese title", "중국어 제목을 입력하세요")}
                  disabled={hasFinished}
                />
              </label>
              <label>
                <div className="mock-writing-label">
                <span>{text("我的缩写", "Your Summary", "나의 요약")}</span>
                <small className={answer.length >= 360 && answer.length <= 440 ? "near-target" : ""}>{answer.length} {text("字", "characters", "자")}</small>
                </div>
                <textarea
                  value={answer}
                  onChange={(event) => {
                    setAnswers((current) => ({ ...current, [item.id]: event.target.value }));
                    setError("");
                  }}
                placeholder={text("根据记忆完成中文缩写，不要加入个人观点……", "Write your Chinese summary from memory without adding personal opinions…", "개인 의견을 추가하지 말고 기억에 따라 중국어 요약문을 작성하세요……")}
                  disabled={hasFinished}
                />
              </label>
              {error && <p className="sentence-practice-error" role="alert">{error}</p>}
              {status === "writing" && <button type="button" onClick={submitMock}>{text("提交缩写", "Submit Mock Response", "요약문 제출")}</button>}

              {hasFinished && (
                <div className="mock-reference">
            {status === "expired" && <p className="mock-expired">{text("写作时间已结束，答案不能再修改。", "Writing time has ended. Your response can no longer be edited.", "쓰기 시간이 끝나 답안을 더 이상 수정할 수 없습니다.")}</p>}
            <span>{text("参考标题", "Suggested Title", "예시 제목")}</span>
                  <h3>{item.referenceTitle}</h3>
            <span>{text("参考缩写", "Suggested Summary", "예시 요약문")}</span>
                  <p>{item.reference}</p>
                  <aside>
              <strong>{text("缩写思路", "Summary Approach", "요약 방법")}</strong>
                    <p>{locale === "en" ? (item.analysisEn ?? item.analysis) : ko ? (item.analysisKo ?? "원문과 예시 답안을 비교하여 인물, 사건의 전개와 결과가 빠짐없이 담겼는지 확인하세요.") : item.analysis}</p>
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
            <a className="practice-discussion-link" href={`/community/practice/${item.databaseId}`}>{text("讨论这道题 →", "Discuss This Exercise →", "이 문제 토론하기 →")}</a>
                </div>
              )}
            </section>
          )}
        </>
      )}

      <nav className="sentence-navigation mock-navigation" aria-label={text("HSK 6 写作模拟题导航", "HSK 6 mock test navigation", "HSK 6 쓰기 모의고사 탐색")}>
        <button type="button" onClick={() => chooseQuestion(currentIndex - 1)} disabled={currentIndex === 0 || isActive}>{text("← 上一题", "← Previous", "← 이전")}</button>
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
              aria-label={locked ? text(`第 ${index + 1} 套模拟题，会员专享`, `Mock test ${index + 1}, members only`, `${index + 1}번 모의고사, 회원 전용`) : text(`第 ${index + 1} 套模拟题`, `Mock test ${index + 1}`, `${index + 1}번 모의고사`)}
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
          title={text(isAuthenticated ? "解锁更多 HSK 6 写作模拟题" : "登录后练习 HSK 6 写作模拟题", "Unlock More HSK 6 Mock Tests", isAuthenticated ? "더 많은 HSK 6 쓰기 모의고사 잠금 해제" : "로그인 후 HSK 6 쓰기 모의고사 연습")}
          description={text(
            isAuthenticated ? `免费账号可练习前 ${items.length} 套模拟题，第 ${lockedTarget} 套及之后的题目需开通会员。` : "游客需要先登录，才能开始 HSK 6 写作模拟练习。",
            `Your free account includes the first ${items.length} mock tests. Mock test ${lockedTarget} and later are available with membership.`,
            isAuthenticated ? `무료 계정은 처음 ${items.length}회 모의고사를 연습할 수 있으며 ${lockedTarget}번부터는 멤버십이 필요합니다.` : "게스트는 로그인 후 HSK 6 쓰기 모의고사를 시작할 수 있습니다."
          )}
          loginNext="/practice/mock"
          onClose={closePaywall}
        />
      )}
    </div>
  );
}
