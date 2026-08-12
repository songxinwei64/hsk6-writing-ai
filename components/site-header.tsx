import Link from "next/link";
import AuthEntry from "./auth-entry";

export default function SiteHeader() {
  return (
    <header className="header">
      <Link className="brand" href="/" aria-label="Write HSK 首页">
        <span className="brand-mark">W</span>
        <span>Write HSK</span>
      </Link>

      <nav className="nav" aria-label="主菜单">
        <Link href="/practice">缩写练习</Link>
        <Link href="/practice/mock">HSK写作模拟题库</Link>
        <Link href="/my-library">我的题库</Link>
        <Link href="/community">学习社区</Link>
      </nav>

      <div className="header-actions">
        <AuthEntry />
      </div>
    </header>
  );
}
