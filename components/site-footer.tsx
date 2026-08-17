import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <Link className="site-footer-brand" href="/">
          <span>W</span>
          <b>Write HSK</b>
        </Link>
        <nav aria-label="Legal and support">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/refunds">Refunds & Cancellation</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <p>© 2026 Write HSK</p>
      </div>
    </footer>
  );
}
