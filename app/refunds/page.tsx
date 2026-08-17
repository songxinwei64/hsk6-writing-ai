import type { Metadata } from "next";
import LegalPage from "../../components/legal-page";

export const metadata: Metadata = {
  title: "Refunds & Cancellation | Write HSK",
  description: "Renewal, cancellation, and refund rules for Write HSK memberships.",
};

export default function RefundsPage() {
  return (
    <LegalPage
      eyebrow="Write HSK · Membership"
      title="Refunds & Cancellation Policy"
      summary="Memberships renew automatically each month. You may cancel anytime, and access generally continues until the end of the current paid period."
    >
      <section>
          <h2>1. Automatic Renewal</h2>
          <p>Write HSK membership is a monthly subscription. Unless canceled before the next renewal, the payment method on file is charged automatically at the price shown at checkout. Lemon Squeezy displays applicable taxes and the final amount.</p>
      </section>

      <section>
          <h2>2. How to Cancel</h2>
          <p>Cancel through the subscription management link on the Membership page or the Lemon Squeezy customer portal. We recommend canceling at least 48 hours before renewal to avoid processing delays. Cancellation stops future renewals, while access generally remains active through the current paid period.</p>
      </section>

      <section>
          <h2>3. Refund Requests</h2>
          <p>Refund requests are reviewed individually. Contact us promptly about duplicate charges, unauthorized transactions, prolonged inability to access a purchased service, or circumstances requiring a refund by law. Include the order number and purchase email. Digital services already accessed, normal renewals, and unused time in the current period are generally not eligible for prorated refunds unless required by law.</p>
      </section>

      <section>
          <h2>4. Processing and Timing</h2>
          <p>Lemon Squeezy is the Merchant of Record and processes payments and refunds. Approved refunds return to the original payment method. Banks and payment providers may take up to approximately ten days to post the funds. Lemon Squeezy may also make final decisions under its buyer terms, fraud controls, and applicable law.</p>
      </section>

      <section>
          <h2>5. Information to Include</h2>
        <ul>
            <li>The email used to purchase the membership.</li>
            <li>The order number from the Lemon Squeezy receipt.</li>
            <li>The reason for the request and any relevant error screenshot.</li>
            <li>For duplicate or unexpected charges, include the date and amount, but never send a full card number or password.</li>
        </ul>
      </section>
    </LegalPage>
  );
}
