import LegalPage from "../../components/legal-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Terms of Service",
  description: "Terms that apply when using the Write HSK website and membership service.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Write HSK · Service Rules"
      title="Terms of Service"
      summary="By using this website, you agree to the following rules. Please read them before registering, publishing community content, or purchasing a membership."
    >
      <section>
          <h2>1. Service</h2>
          <p>Write HSK provides HSK 6 writing and summarization exercises, mock tests, practice history, community features, and personalized AI feedback. Features, exercise quantities, and membership benefits may change as the product improves.</p>
      </section>

      <section>
          <h2>2. Independent Platform</h2>
          <p>Write HSK is an independent learning platform. It is not an official website of HSK, Chinese Testing International, or any related exam organizer and is not endorsed by them. Exercises, suggested answers, and AI feedback are for learning only and do not constitute official scoring, score predictions, or exam guarantees.</p>
      </section>

      <section>
          <h2>3. Account Responsibilities</h2>
          <p>You must provide valid sign-in information and protect your account. You may not share paid accounts, bypass exercise or membership restrictions, scrape content automatically, attack the website, or use another person's identity or payment method. Contact us promptly if you discover unauthorized use.</p>
      </section>

      <section>
          <h2>4. Membership and Payment</h2>
          <p>Paid memberships renew automatically at the price and interval shown at checkout until canceled. Lemon Squeezy acts as Merchant of Record and processes payments, applicable taxes, receipts, and subscription transactions. Price changes will be handled through checkout disclosures, notices, and applicable law.</p>
      </section>

      <section>
          <h2>5. AI Feedback</h2>
          <p>AI feedback may contain omissions, inaccuracies, or inconsistencies. Use it together with the original passage, suggested answers, and teacher guidance. AI feedback does not replace official exam scoring or professional instruction, and we do not guarantee any particular exam result.</p>
      </section>

      <section>
          <h2>6. User Content and Community Rules</h2>
          <p>You retain rights to your original content and grant Write HSK the limited permission needed to store, display, moderate, and provide the service. You may not publish illegal, infringing, harassing, hateful, sexual, spam, cheating-related, or third-party personal information. We may hide or remove violating content and restrict accounts for serious or repeated violations.</p>
      </section>

      <section>
          <h2>7. Website Content and Intellectual Property</h2>
          <p>Except for user-created content, the website design, exercise organization, explanatory text, software code, and brand elements are protected by applicable law. They may not be copied in bulk, sold, publicly republished, or used to create a competing question bank or service without permission.</p>
      </section>

      <section>
          <h2>8. Service Availability</h2>
          <p>We take reasonable steps to maintain the service but do not guarantee permanent, uninterrupted, or error-free availability. Maintenance, third-party failures, network issues, or events beyond our control may cause temporary interruptions.</p>
      </section>

      <section>
          <h2>9. Suspension and Termination</h2>
          <p>We may restrict or terminate accounts for serious violations of these terms or threats to other users or service security. You may stop using the service and request account deletion through the contact page. Paid subscription cancellation and refunds follow the Refunds & Cancellation Policy.</p>
      </section>

      <section>
          <h2>10. Governing Rules</h2>
          <p>The service is operated from the Republic of Korea. These terms are interpreted under Korean law without excluding mandatory consumer rights in your location. The parties should first attempt to resolve disputes through good-faith communication.</p>
      </section>
    </LegalPage>
  );
}
