"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import AuthEntry from "./auth-entry";
import LanguageController from "./language-controller";

type Panel = "practice" | "community" | null;

function MenuIcon({ name }: { name: "home" | "practice" | "mock" | "library" | "community" | "membership" }) {
  const paths = {
    home: <><path d="M4 10.5 12 4l8 6.5v8.5H5z" /><path d="M9.5 19v-5h5v5" /></>,
    practice: <><path d="M6 3.5h9l3 3V20H6z" /><path d="M15 3.5v3h3M9 11h6M9 15h5" /></>,
    mock: <><path d="M5 5h14v15H5z" /><path d="M8 3v4M16 3v4M8 11h8M8 15h5" /></>,
    library: <><path d="M4.5 5.5h6c1.2 0 2 .6 2 1.7V20c0-1.1-.8-1.7-2-1.7h-6z" /><path d="M19.5 5.5h-6c-1.2 0-2 .6-2 1.7V20c0-1.1.8-1.7 2-1.7h6z" /></>,
    community: <><path d="M4 5h11v8H9l-4 3v-3H4z" /><path d="M10 9h10v8h-3v3l-4-3h-3" /></>,
    membership: <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

export default function SiteSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [panel, setPanel] = useState<Panel>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const auth = searchParams.get("auth");
  const requestedNext = searchParams.get("next");
  const nextPath = requestedNext?.startsWith("/") ? requestedNext : "/";
  const selectedType = searchParams.get("type");

  useEffect(() => {
    setPanel(null);
    setMobileOpen(false);
  }, [pathname, searchParams]);

  function active(path: string, exact = false) {
    return exact ? pathname === path : pathname === path || pathname.startsWith(`${path}/`);
  }

  function togglePanel(nextPanel: Exclude<Panel, null>) {
    setPanel((current) => current === nextPanel ? null : nextPanel);
  }

  const pageTitle = pathname === "/" || pathname === "/ko" ? "Home"
    : pathname === "/practice" ? "Writing Practice"
    : pathname.startsWith("/practice/sentence") ? "Sentence Summarization"
    : pathname.startsWith("/practice/paragraph") ? "Passage Summarization"
    : pathname.startsWith("/practice/mock") ? "HSK 6 Mock Tests"
    : pathname.startsWith("/my-library") ? "My Practice"
    : pathname.startsWith("/membership") ? "Membership"
    : pathname.startsWith("/community/wall") ? "Motivation Wall"
    : pathname.startsWith("/community/practice") ? "Exercise Discussion"
    : pathname.startsWith("/community/discussions") ? "Discussions"
    : pathname === "/privacy" ? "Privacy Policy"
    : pathname === "/terms" ? "Terms of Service"
    : pathname === "/refunds" ? "Refunds & Cancellation"
    : pathname === "/contact" ? "Contact"
    : "Write HSK";

  const pageIcon = pathname === "/" ? "home"
    : pathname.startsWith("/practice/mock") ? "mock"
    : pathname.startsWith("/practice") ? "practice"
    : pathname.startsWith("/my-library") ? "library"
    : pathname.startsWith("/community") ? "community"
    : pathname.startsWith("/membership") ? "membership"
    : "home";

  return (
    <>
      <button className="site-mobile-menu" type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu">☰</button>
      {(panel || mobileOpen) && <button className="site-flyout-backdrop" type="button" onClick={() => { setPanel(null); setMobileOpen(false); }} aria-label="Close menu" />}

      <aside className={`site-icon-rail${panel ? " panel-open" : ""}${mobileOpen ? " mobile-open" : ""}`}>
        <Link className="site-rail-brand" href="/" aria-label="Cabbage HSK Writing home"><img src="/cabbage-mascot.png" alt="" /><b>Cabbage HSK Writing</b></Link>
        <nav aria-label="Main menu">
          <Link className={active("/", true) || pathname === "/ko" ? "active" : ""} href={pathname === "/ko" ? "/ko" : "/"} title="Home"><MenuIcon name="home" /><span>Home</span></Link>
          <button className={active("/practice") && !active("/practice/mock") ? "active" : ""} type="button" onClick={() => togglePanel("practice")} title="Writing Practice" aria-expanded={panel === "practice"}><MenuIcon name="practice" /><span>Writing Practice</span><i>›</i></button>
          <Link className={active("/practice/mock") ? "active" : ""} href="/practice/mock" title="HSK 6 Mock Tests"><MenuIcon name="mock" /><span>Mock Tests</span></Link>
          <Link className={active("/my-library") ? "active" : ""} href="/my-library" title="My Practice"><MenuIcon name="library" /><span>My Practice</span></Link>
          <button className={active("/community") ? "active" : ""} type="button" onClick={() => togglePanel("community")} title="Community" aria-expanded={panel === "community"}><MenuIcon name="community" /><span>Community</span><i>›</i></button>
          <Link className={active("/membership") ? "active" : ""} href="/membership" title="Membership"><MenuIcon name="membership" /><span>Membership</span></Link>
        </nav>
      </aside>

      {panel && (
        <aside className="site-menu-flyout" aria-label={panel === "practice" ? "Writing practice submenu" : "Community submenu"}>
          {panel === "practice" ? (
            <>
              <header><span>Practice</span><h2>Writing Practice</h2><p>Learn to select key information before taking a complete mock test.</p></header>
              <nav>
                <Link href="/practice"><span>Practice Overview</span><b>→</b></Link>
                <Link className={active("/practice/sentence") ? "active" : ""} href="/practice/sentence"><span><b>Sentence Summarization</b><small>Separate key ideas from minor details</small></span><b>→</b></Link>
                <Link className={active("/practice/paragraph") ? "active" : ""} href="/practice/paragraph"><span><b>Passage Summarization</b><small>Organize people, events, and outcomes</small></span><b>→</b></Link>
              </nav>
            </>
          ) : (
            <>
              <header><span>Community</span><h2>Learning Community</h2><p>Share encouragement and discuss practice exercises.</p></header>
              <nav>
                <Link className={active("/community/wall") ? "active" : ""} href="/community/wall"><span><b>Motivation Wall</b><small>Create an encouraging message together</small></span><b>→</b></Link>
                <div className="flyout-section-label">Exercise Discussions</div>
                <Link className={pathname === "/community/discussions" && !selectedType ? "active" : ""} href="/community/discussions"><span>All Exercises</span><b>→</b></Link>
                <Link className={selectedType === "sentence" ? "active" : ""} href="/community/discussions?type=sentence"><span>Sentences</span><b>→</b></Link>
                <Link className={selectedType === "paragraph" ? "active" : ""} href="/community/discussions?type=paragraph"><span>Passages</span><b>→</b></Link>
                <Link className={selectedType === "mock" ? "active" : ""} href="/community/discussions?type=mock"><span>HSK 6 Mock Tests</span><b>→</b></Link>
              </nav>
            </>
          )}
        </aside>
      )}

      <header className="site-topbar">
        <div className="site-topbar-location">
          <span className="site-topbar-page-icon"><MenuIcon name={pageIcon} /></span>
          <span>{pageTitle}</span>
        </div>
        <div className="site-topbar-actions">
          <LanguageController />
          <AuthEntry autoOpen={auth === "login"} nextPath={nextPath} />
        </div>
      </header>
    </>
  );
}
