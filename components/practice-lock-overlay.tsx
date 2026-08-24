"use client";

import { useSiteLocale } from "../lib/use-site-locale";

type PracticeLockOverlayProps = {
  variant?: "login" | "membership";
  title: string;
  description: string;
  loginNext?: string;
  onClose: () => void;
};

export default function PracticeLockOverlay({
  variant = "membership",
  title,
  description,
  loginNext = "/practice",
  onClose,
}: PracticeLockOverlayProps) {
  const isLoginPrompt = variant === "login";
  const locale = useSiteLocale();
  const text = (zh: string, en: string, ko: string) => locale === "zh" ? zh : locale === "ko" ? ko : en;

  return (
    <div className="practice-lock-overlay" role="dialog" aria-modal="true" aria-labelledby="practice-lock-title">
      <section className="practice-lock-card">
        <span className="practice-lock-icon" aria-hidden="true">◇</span>
        <span className="eyebrow">Write HSK · {isLoginPrompt ? text("登录后继续", "Sign In to Continue", "로그인 후 계속") : text("完整题库", "Complete Question Bank", "전체 문제")}</span>
        <h2 id="practice-lock-title">{title}</h2>
        <p>{description}</p>

        {isLoginPrompt ? (
          <ul>
            <li><span>✓</span>{text("继续练习更多免费题目", "Continue with more free exercises", "더 많은 무료 문제 계속 연습")}</li>
            <li><span>✓</span>{text("保存答案和练习记录", "Save your answers and practice history", "답안과 연습 기록 저장")}</li>
            <li><span>✓</span>{text("参与学习社区讨论", "Join community discussions", "학습 커뮤니티 토론 참여")}</li>
          </ul>
        ) : (
          <>
            <ul>
              <li><span>✓</span>{text("解锁全部句子和短文缩写练习", "Unlock all sentence and passage exercises", "모든 문장·단락 요약 잠금 해제")}</li>
              <li><span>✓</span>{text("解锁全部 HSK 6 写作模拟题", "Unlock all HSK 6 writing mock tests", "모든 HSK 6 쓰기 모의고사 잠금 해제")}</li>
              <li><span>✓</span>{text("获得更多个性化 AI 反馈", "Receive more personalized AI feedback", "더 많은 맞춤형 AI 피드백")}</li>
            </ul>
            <div className="practice-lock-price">
              <strong>₩12,900</strong>
              <span>{text("/ 月", "/ month", "/ 월")}</span>
            </div>
            <p className="practice-lock-renewal">{text("每月自动续订 · 可随时取消", "Renews monthly · Cancel anytime", "매월 자동 갱신 · 언제든지 해지")}</p>
          </>
        )}

        <a
          className="practice-lock-primary"
          href={isLoginPrompt ? `/?auth=login&next=${encodeURIComponent(loginNext)}` : "/membership"}
        >
          {isLoginPrompt ? text("登录后继续", "Sign In to Continue", "로그인 후 계속") : text("查看会员权益", "View Membership", "멤버십 보기")}
        </a>
        <button className="practice-lock-secondary" type="button" onClick={onClose}>
          {isLoginPrompt ? text("返回", "Go Back", "돌아가기") : text("返回免费练习", "Return to Free Practice", "무료 연습으로 돌아가기")}
        </button>
      </section>
    </div>
  );
}
