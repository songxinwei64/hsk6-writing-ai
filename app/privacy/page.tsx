import LegalPage from "../../components/legal-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description: "How Cabbage HSK Writing collects, uses, and protects user information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Write HSK · Legal & Privacy"
      title="Privacy Policy"
      summary="This policy explains what information we process when you use Write HSK, why we process it, and how you can manage your data."
    >
      <section>
          <h2>1. Information We Collect</h2>
        <ul>
            <li><b>Account information:</b> email address, display name, profile image, and sign-in method. Google sign-in provides the basic account information authorized by Google.</li>
            <li><b>Learning information:</b> your summaries, titles, practice attempts, completion history, saved exercises, and AI feedback.</li>
            <li><b>Community information:</b> posts, comments, votes, and exercise discussions you choose to publish.</li>
            <li><b>Membership information:</b> membership status, subscription and renewal dates, orders, and customer identifiers. Lemon Squeezy processes full payment details; we do not store full card numbers or PayPal passwords.</li>
            <li><b>Technical information:</b> cookies, session data, IP addresses, browser information, and access logs needed for sign-in, security, and troubleshooting.</li>
        </ul>
      </section>

      <section>
          <h2>2. How We Use Information</h2>
          <p>We use this information to create and protect accounts, save learning progress, provide exercises and community features, generate personalized AI feedback, manage membership access, respond to support requests, prevent abuse, and improve service reliability.</p>
      </section>

      <section>
          <h2>3. AI Feedback and Content Processing</h2>
          <p>When you request AI feedback, the relevant prompt, your title, and your summary are sent to the OpenAI API. Write HSK does not create reusable API response storage for these requests, although the provider may process necessary logs under its safety and abuse-monitoring rules. Do not include identification numbers, addresses, health information, or other unnecessary sensitive data in practice answers.</p>
      </section>

      <section>
          <h2>4. Service Providers and International Processing</h2>
          <p>We use Supabase for accounts, databases, and realtime features; Google for optional sign-in; OpenAI for AI feedback; Lemon Squeezy for checkout, subscriptions, and tax handling; and Vercel for hosting. These providers may process data outside your country or region under their respective privacy and security terms.</p>
      </section>

      <section>
          <h2>5. Retention and Security</h2>
          <p>Account, learning, and community data are generally retained until the account is deleted or the data is no longer needed to provide the service. Payment and transaction records may be retained longer for tax, accounting, fraud prevention, or legal obligations. We use access controls, server-side secret management, and database row-level security, but no internet service can guarantee absolute security.</p>
      </section>

      <section>
          <h2>6. Your Rights</h2>
          <p>You may request access to, correction, export, or deletion of personal information and may withdraw consent for optional processing. Account deletion may also remove learning records that cannot be separated from the account, except transaction records that must be retained by law. Submit requests through the contact page; we may first verify account ownership.</p>
      </section>

      <section>
          <h2>7. Cookies and Sign-In Sessions</h2>
          <p>We use necessary cookies to maintain sign-in sessions, protect accounts, and preserve basic interface state. Disabling necessary cookies may prevent sign-in, practice history, or membership features from working correctly.</p>
      </section>

      <section>
          <h2>8. Minors</h2>
          <p>If you are below the age at which you may independently consent to online services in your region, use Write HSK only with a parent or guardian's consent and guidance. Guardians may contact us if they believe a minor has improperly submitted personal information.</p>
      </section>

      <section>
          <h2>9. Policy Updates</h2>
          <p>We may update this policy when the service or legal requirements change. Material changes will be announced on the website or through another appropriate method, and the effective date will be updated.</p>
      </section>
    </LegalPage>
  );
}
