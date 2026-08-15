import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import SiteSidebar from "../components/site-sidebar";
import SiteFooter from "../components/site-footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://hsk6-writing-ai.vercel.app"),
  title: {
    default: "Write HSK｜HSK 6 写作练习",
    template: "%s｜Write HSK",
  },
  description: "从句子缩写、短文缩写到 HSK 6 写作模拟，并获得 AI 个性化反馈。",
  openGraph: {
    title: "Write HSK｜HSK 6 写作练习",
    description: "缩写训练、HSK 6 写作模拟与 AI 个性化反馈。",
    url: "/",
    siteName: "Write HSK",
    locale: "zh_CN",
    type: "website",
    images: [
      {
        url: "/write-hsk-social-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Write HSK：HSK 6 写作练习、缩写训练与 AI 个性化反馈",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Write HSK｜HSK 6 写作练习",
    description: "缩写训练、HSK 6 写作模拟与 AI 个性化反馈。",
    images: ["/write-hsk-social-preview.jpg"],
  },
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
        <div className="site-shell-main">
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
