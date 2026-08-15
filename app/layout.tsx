import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import SiteSidebar from "../components/site-sidebar";
import SiteFooter from "../components/site-footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://hsk6-writing-ai.vercel.app"),
  title: {
    default: "Write HSK | HSK 6 Writing Practice",
    template: "%s｜Write HSK",
  },
  description: "Practice HSK 6 summarization and writing with personalized AI feedback.",
  openGraph: {
    title: "Write HSK | HSK 6 Writing Practice",
    description: "Summarization training, HSK 6 writing practice, and personalized AI feedback.",
    url: "/",
    siteName: "Write HSK",
    locale: "zh_CN",
    type: "website",
    images: [
      {
        url: "/write-hsk-social-preview-bilingual.jpg",
        width: 1200,
        height: 630,
        alt: "Write HSK: HSK 6 writing practice with summarization training and personalized AI feedback",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Write HSK | HSK 6 Writing Practice",
    description: "Summarization training, HSK 6 writing practice, and personalized AI feedback.",
    images: ["/write-hsk-social-preview-bilingual.jpg"],
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
