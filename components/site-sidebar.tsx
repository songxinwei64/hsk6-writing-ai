"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import AuthEntry from "./auth-entry";

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

  const pageTitle = pathname === "/" ? "首页"
    : pathname === "/practice" ? "缩写练习"
    : pathname.startsWith("/practice/sentence") ? "句子缩写"
    : pathname.startsWith("/practice/paragraph") ? "短文缩写"
    : pathname.startsWith("/practice/mock") ? "HSK写作模拟题库"
    : pathname.startsWith("/my-library") ? "我的题库"
    : pathname.startsWith("/membership") ? "会员权益"
    : pathname.startsWith("/community/wall") ? "激励文字墙"
    : pathname.startsWith("/community/practice") ? "题目讨论"
    : pathname.startsWith("/community/discussions") ? "题目讨论区"
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
      <button className="site-mobile-menu" type="button" onClick={() => setMobileOpen(true)} aria-label="打开菜单">☰</button>
      {(panel || mobileOpen) && <button className="site-flyout-backdrop" type="button" onClick={() => { setPanel(null); setMobileOpen(false); }} aria-label="关闭菜单" />}

      <aside className={`site-icon-rail${panel ? " panel-open" : ""}${mobileOpen ? " mobile-open" : ""}`}>
        <Link className="site-rail-brand" href="/" aria-label="Write HSK 首页"><span>W</span><b>Write HSK</b></Link>
        <nav aria-label="网站主菜单">
          <Link className={active("/", true) ? "active" : ""} href="/" title="首页"><MenuIcon name="home" /><span>首页</span></Link>
          <button className={active("/practice") && !active("/practice/mock") ? "active" : ""} type="button" onClick={() => togglePanel("practice")} title="缩写练习" aria-expanded={panel === "practice"}><MenuIcon name="practice" /><span>缩写练习</span><i>›</i></button>
          <Link className={active("/practice/mock") ? "active" : ""} href="/practice/mock" title="HSK写作模拟题库"><MenuIcon name="mock" /><span>模拟题库</span></Link>
          <Link className={active("/my-library") ? "active" : ""} href="/my-library" title="我的题库"><MenuIcon name="library" /><span>我的题库</span></Link>
          <button className={active("/community") ? "active" : ""} type="button" onClick={() => togglePanel("community")} title="学习社区" aria-expanded={panel === "community"}><MenuIcon name="community" /><span>学习社区</span><i>›</i></button>
          <Link className={active("/membership") ? "active" : ""} href="/membership" title="会员权益"><MenuIcon name="membership" /><span>会员权益</span></Link>
        </nav>
      </aside>

      {panel && (
        <aside className="site-menu-flyout" aria-label={panel === "practice" ? "缩写练习子菜单" : "学习社区子菜单"}>
          {panel === "practice" ? (
            <>
              <header><span>练习</span><h2>缩写练习</h2><p>先练习信息取舍，再进入完整模拟。</p></header>
              <nav>
                <Link href="/practice"><span>练习首页</span><b>→</b></Link>
                <Link className={active("/practice/sentence") ? "active" : ""} href="/practice/sentence"><span><b>句子缩写</b><small>识别重点与次要细节</small></span><b>→</b></Link>
                <Link className={active("/practice/paragraph") ? "active" : ""} href="/practice/paragraph"><span><b>短文缩写</b><small>梳理人物、事件与结果</small></span><b>→</b></Link>
              </nav>
            </>
          ) : (
            <>
              <header><span>社区</span><h2>学习社区</h2><p>鼓励与学习讨论分开放置。</p></header>
              <nav>
                <Link className={active("/community/wall") ? "active" : ""} href="/community/wall"><span><b>激励文字墙</b><small>共同写成“加油”</small></span><b>→</b></Link>
                <div className="flyout-section-label">题目讨论</div>
                <Link className={pathname === "/community/discussions" && !selectedType ? "active" : ""} href="/community/discussions"><span>全部题目</span><b>→</b></Link>
                <Link className={selectedType === "sentence" ? "active" : ""} href="/community/discussions?type=sentence"><span>句子缩写</span><b>→</b></Link>
                <Link className={selectedType === "paragraph" ? "active" : ""} href="/community/discussions?type=paragraph"><span>短文缩写</span><b>→</b></Link>
                <Link className={selectedType === "mock" ? "active" : ""} href="/community/discussions?type=mock"><span>HSK写作模拟</span><b>→</b></Link>
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
        <AuthEntry autoOpen={auth === "login"} nextPath={nextPath} />
      </header>
    </>
  );
}
