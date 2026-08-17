import Link from "next/link";
import AuthEntry from "./auth-entry";

export default function SiteHeader() {
  return (
    <header className="header">
      <Link className="brand" href="/" aria-label="Write HSK home">
        <span className="brand-mark">W</span>
        <span>Write HSK</span>
      </Link>

      <nav className="nav" aria-label="Main menu">
        <Link href="/practice">Writing Practice</Link>
        <Link href="/practice/mock">HSK 6 Mock Tests</Link>
        <Link href="/my-library">My Practice</Link>
        <Link href="/community">Community</Link>
      </nav>

      <div className="header-actions">
        <AuthEntry />
      </div>
    </header>
  );
}
