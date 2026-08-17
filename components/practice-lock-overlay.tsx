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
        <span className="eyebrow">Write HSK · {isLoginPrompt ? "Sign In to Continue" : "Complete Question Bank"}</span>
        <h2 id="practice-lock-title">{title}</h2>
        <p>{description}</p>

        {isLoginPrompt ? (
          <ul>
            <li><span>✓</span>Continue with more free exercises</li>
            <li><span>✓</span>Save your answers and practice history</li>
            <li><span>✓</span>Join community discussions</li>
          </ul>
        ) : (
          <>
            <ul>
              <li><span>✓</span>Unlock all sentence and passage exercises</li>
              <li><span>✓</span>Unlock all HSK 6 writing mock tests</li>
              <li><span>✓</span>Receive more personalized AI feedback</li>
            </ul>
            <div className="practice-lock-price">
              <strong>₩12,900</strong>
              <span>/ month</span>
            </div>
            <p className="practice-lock-renewal">Renews monthly · Cancel anytime</p>
          </>
        )}

        <a
          className="practice-lock-primary"
          href={isLoginPrompt ? `/?auth=login&next=${encodeURIComponent(loginNext)}` : "/membership"}
        >
          {isLoginPrompt ? "Sign In to Continue" : "View Membership"}
        </a>
        <button className="practice-lock-secondary" type="button" onClick={onClose}>
          {isLoginPrompt ? "Go Back" : "Return to Free Practice"}
        </button>
      </section>
    </div>
  );
}
