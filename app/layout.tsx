import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import SiteSidebar from "../components/site-sidebar";

export const metadata: Metadata = {
  title: "Write HSK",
  description: "HSK 6 写作学习网站",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <Suspense fallback={<div className="site-sidebar-loading" aria-hidden="true"><span>W</span></div>}>
          <SiteSidebar />
        </Suspense>
        <div className="site-shell-main">{children}</div>
      </body>
    </html>
  );
}
