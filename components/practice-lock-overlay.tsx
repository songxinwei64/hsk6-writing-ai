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

  return (
    <div className="practice-lock-overlay" role="dialog" aria-modal="true" aria-labelledby="practice-lock-title">
      <section className="practice-lock-card">
        <span className="practice-lock-icon" aria-hidden="true">◇</span>
        <span className="eyebrow">Write HSK · {isLoginPrompt ? "登录继续" : "完整题库"}</span>
        <h2 id="practice-lock-title">{title}</h2>
        <p>{description}</p>

        {isLoginPrompt ? (
          <ul>
            <li><span>✓</span>继续更多免费练习</li>
            <li><span>✓</span>保存练习次数与答案</li>
            <li><span>✓</span>参与学习社区讨论</li>
          </ul>
        ) : (
          <>
            <ul>
              <li><span>✓</span>解锁全部句子与短文缩写练习</li>
              <li><span>✓</span>解锁全部 HSK 6 写作模拟题</li>
              <li><span>✓</span>获得更多 AI 个性化反馈</li>
            </ul>
            <div className="practice-lock-price">
              <strong>₩12,900</strong>
              <span>/ 月</span>
            </div>
            <p className="practice-lock-renewal">每月自动续费，可随时取消</p>
          </>
        )}

        <a
          className="practice-lock-primary"
          href={isLoginPrompt ? `/?auth=login&next=${encodeURIComponent(loginNext)}` : "/membership"}
        >
          {isLoginPrompt ? "登录后继续" : "查看月度会员"}
        </a>
        <button className="practice-lock-secondary" type="button" onClick={onClose}>
          {isLoginPrompt ? "暂时返回" : "返回免费练习"}
        </button>
      </section>
    </div>
  );
}
