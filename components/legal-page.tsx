import Link from "next/link";

type LegalPageProps = {
  eyebrow: string;
  title: string;
  summary: string;
  children: React.ReactNode;
};

export default function LegalPage({ eyebrow, title, summary, children }: LegalPageProps) {
  return (
    <main className="legal-page">
      <header className="legal-hero">
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{summary}</p>
        <small>生效日期：2026年8月14日</small>
      </header>
      <article className="legal-content">{children}</article>
      <div className="legal-help">
        对本页面有疑问？<Link href="/contact">联系我们</Link>
      </div>
    </main>
  );
}
