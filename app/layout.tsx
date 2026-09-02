import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import "./globals.css";
import SiteSidebar from "../components/site-sidebar";
import SiteFooter from "../components/site-footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://hsk6-writing-ai.vercel.app"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  title: {
    default: "Cabbage HSK Writing | HSK 6 Writing Practice",
    template: "%s｜Cabbage HSK Writing",
  },
  description: "Practice HSK 6 summarization and writing with personalized AI feedback.",
  keywords: [
    "Cabbage HSK Writing",
    "Cabbage HSK",
    "白菜 HSK 写作",
    "배추 HSK 쓰기",
    "HSK",
    "HSK 6 writing practice",
    "HSK 6 summarization practice",
    "HSK六级写作练习",
    "HSK六级缩写练习",
    "HSK 6 쓰기 연습",
    "HSK 6 작문 연습",
    "HSK 6 요약 연습",
  ],
  applicationName: "Cabbage HSK Writing",
  icons: {
    icon: "/cabbage-mascot.png",
    apple: "/cabbage-mascot.png",
  },
  category: "education",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Cabbage HSK Writing | HSK 6 Writing Practice",
    description: "Summarization training, HSK 6 writing practice, and personalized AI feedback.",
    url: "/",
    siteName: "Cabbage HSK Writing",
    locale: "en_US",
    alternateLocale: ["zh_CN", "ko_KR"],
    type: "website",
    images: [
      {
        url: "/write-hsk-product-preview.png",
        width: 1200,
        height: 630,
        alt: "Cabbage HSK Writing: HSK 6 writing practice with summarization training and personalized AI feedback",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cabbage HSK Writing | HSK 6 Writing Practice",
    description: "Summarization training, HSK 6 writing practice, and personalized AI feedback.",
    images: ["/write-hsk-product-preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<div className="site-sidebar-loading" aria-hidden="true"><img src="/cabbage-mascot.png" alt="" /></div>}>
          <SiteSidebar />
        </Suspense>
        <div className="site-shell-main">
          {children}
          <SiteFooter />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
