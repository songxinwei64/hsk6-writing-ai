import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Write HSK",
  description: "HSK 6 写作学习网站",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
