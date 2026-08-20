import type { Metadata } from "next";
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
    default: "Write HSK | HSK 6 Writing Practice",
    template: "%s｜Write HSK",
  },
  description: "Practice HSK 6 summarization and writing with personalized AI feedback.",
  applicationName: "Write HSK",
  category: "education",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Write HSK | HSK 6 Writing Practice",
    description: "Summarization training, HSK 6 writing practice, and personalized AI feedback.",
    url: "/",
    siteName: "Write HSK",
    locale: "en_US",
    alternateLocale: ["zh_CN"],
    type: "website",
    images: [
      {
        url: "/write-hsk-product-preview.png",
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
    images: ["/write-hsk-product-preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
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
