import LegalPage from "../../components/legal-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Contact Cabbage HSK Writing",
  description: "Contact Cabbage HSK Writing for account, membership, refund, and privacy support.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <LegalPage
      eyebrow="Write HSK · Support"
      title="Contact Us"
      summary="Email us if you need help with your account, practice history, AI feedback, membership, or privacy."
    >
      <section className="contact-card">
          <h2>Support Email</h2>
        <a href="mailto:sxw77435@gmail.com">sxw77435@gmail.com</a>
          <p>Service operator location: Republic of Korea</p>
          <p>We generally respond within three business days. Mention refunds, unexpected charges, or account security in the subject line so we can prioritize the request.</p>
      </section>

      <section>
          <h2>Help Us Resolve Your Request Faster</h2>
        <ul>
            <li>Account issues: include your registered email and when the issue occurred.</li>
            <li>Payment issues: include the order number and purchase email. Never send a full card number or password.</li>
            <li>Practice issues: include the exercise type, number, and a relevant screenshot.</li>
            <li>Privacy requests: tell us which data you want to access, correct, export, or delete.</li>
        </ul>
      </section>
    </LegalPage>
  );
}
