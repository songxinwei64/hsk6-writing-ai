import Link from "next/link";
import { getMembershipAccess } from "../../lib/membership";
import { PRACTICE_ACCESS } from "../../lib/practice-items";
import CheckoutButton from "../../components/checkout-button";

export const dynamic = "force-dynamic";

function formatMembershipDate(value: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

const benefits = [
  {
    label: "Sentence Summarization",
    free: PRACTICE_ACCESS.sentence.free,
    total: PRACTICE_ACCESS.sentence.total,
    unit: "exercises",
  },
  {
    label: "Passage Summarization",
    free: PRACTICE_ACCESS.paragraph.free,
    total: PRACTICE_ACCESS.paragraph.total,
    unit: "exercises",
  },
  {
    label: "HSK 6 Mock Tests",
    free: PRACTICE_ACCESS.mock.free,
    total: PRACTICE_ACCESS.mock.total,
    unit: "tests",
  },
] as const;

export default async function MembershipPage() {
  const access = await getMembershipAccess();

  return (
    <main className="page">
      <section className="membership-shell">
        <div className="membership-heading">
          <span className="eyebrow">Write HSK · Membership</span>
          <h1>Start Free, Then Unlock the Complete Question Bank</h1>
          <p>Sign in to save progress, join the community, and try AI feedback. Members receive all writing exercises, every HSK 6 mock test, and more AI feedback.</p>
        </div>

        <div className="membership-plans">
          <article className="membership-plan">
            <div className="membership-plan-title">
              <span>Free</span>
              <strong>¥0</strong>
            </div>
            <p>Try part of each exercise set. Sign in to save your history and join the community.</p>
            <ul>
              {benefits.map((benefit) => (
                <li key={benefit.label}>
                  <span>{benefit.label}</span>
                  <b>{benefit.free} / {benefit.total} {benefit.unit}</b>
                </li>
              ))}
              <li><span>Save practice progress</span><b>{access.isAuthenticated ? "Available" : "Sign in"}</b></li>
              <li><span>Join the community</span><b>{access.isAuthenticated ? "Available" : "Sign in"}</b></li>
              <li><span>Personalized AI feedback</span><b>3 free sessions after sign-in</b></li>
            </ul>
            {!access.isAuthenticated ? (
              <Link className="membership-secondary-action" href="/?auth=login&next=/membership">Sign In and Save Progress</Link>
            ) : (
              <span className="membership-current">Current Plan: Free</span>
            )}
          </article>

          <article className="membership-plan membership-plan-paid">
            <div className="membership-plan-badge">Complete Question Bank</div>
            <div className="membership-plan-title">
              <span>Membership</span>
              <strong>Full Access</strong>
            </div>
            <p>For learners who want every summarization exercise, all HSK 6 mock tests, and continued AI feedback.</p>
            <ul>
              {benefits.map((benefit) => (
                <li key={benefit.label}>
                  <span>{benefit.label}</span>
                  <b>{benefit.total} / {benefit.total} {benefit.unit}</b>
                </li>
              ))}
              <li><span>Save practice progress</span><b>Available</b></li>
              <li><span>Join the community</span><b>Available</b></li>
              <li><span>Personalized AI feedback</span><b>5 sessions per 24 hours</b></li>
            </ul>
            {access.isPaidMember ? (
              <>
                <div className="membership-status-card">
                  <div className="membership-status-heading">
                    <span>Membership Status</span>
                    <strong>Active</strong>
                    {access.isTestMode && <small>Test Membership</small>}
                  </div>
                  <dl>
                    <div><dt>Started</dt><dd>{formatMembershipDate(access.startedAt)}</dd></div>
                    {access.expiresAt ? (
                      <div><dt>Access Until</dt><dd>{formatMembershipDate(access.expiresAt)}</dd></div>
                    ) : (
                      <div><dt>Next Renewal</dt><dd>{formatMembershipDate(access.renewsAt)}</dd></div>
                    )}
                  </dl>
                  {access.customerPortalUrl && (
                    <a href={access.customerPortalUrl} target="_blank" rel="noreferrer">Manage or Cancel Subscription →</a>
                  )}
                </div>
                <Link className="membership-primary-action" href="/practice">Membership Active — Start Practicing</Link>
              </>
            ) : (
              <>
                <div className="membership-billing-summary">
                  <strong>₩12,900 / month</strong>
                  <span>Monthly subscription · Renews automatically</span>
                  <small>Cancel anytime. Access remains active until the end of the current billing period.</small>
                </div>
                {access.isAuthenticated ? (
                  <CheckoutButton />
                ) : (
                  <Link className="membership-primary-action" href="/?auth=login&next=/membership">Sign In to Subscribe</Link>
                )}
              </>
            )}
          </article>
        </div>

        <p className="membership-note">This is a recurring monthly subscription, not a one-time purchase. Payment authorizes automatic monthly billing until cancellation.</p>
      </section>
    </main>
  );
}
