type PracticeLockOverlayProps = {
  title: string;
  description: string;
  onClose: () => void;
};

export default function PracticeLockOverlay({
  title,
  description,
  onClose,
}: PracticeLockOverlayProps) {
  return (
    <div className="practice-lock-overlay" role="dialog" aria-modal="true" aria-labelledby="practice-lock-title">
      <section className="practice-lock-card">
        <span className="practice-lock-icon" aria-hidden="true">◇</span>
        <span className="eyebrow">Write HSK · 完整题库</span>
        <h2 id="practice-lock-title">{title}</h2>
        <p>{description}</p>

        <ul>
          <li><span>✓</span>解锁全部句子与短文缩写练习</li>
          <li><span>✓</span>解锁全部 HSK 6 写作模拟题</li>
          <li><span>✓</span>获得更多 AI 个性化反馈</li>
        </ul>

        <div className="practice-lock-price">
          <strong>₩12,900</strong>
          <span>/ 月 · 随时取消</span>
        </div>

        <a className="practice-lock-primary" href="/membership">解锁完整题库</a>
        <button className="practice-lock-secondary" type="button" onClick={onClose}>返回免费练习</button>
      </section>
    </div>
  );
}
