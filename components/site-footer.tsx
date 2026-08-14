import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <Link className="site-footer-brand" href="/">
          <span>W</span>
          <b>Write HSK</b>
        </Link>
        <nav aria-label="法律与支持">
          <Link href="/privacy">隐私政策</Link>
          <Link href="/terms">服务条款</Link>
          <Link href="/refunds">退款与取消</Link>
          <Link href="/contact">联系我们</Link>
        </nav>
        <p>© 2026 Write HSK</p>
      </div>
    </footer>
  );
}
