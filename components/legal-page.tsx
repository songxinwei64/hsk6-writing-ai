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
          <small>Effective date: August 14, 2026</small>
      </header>
      <article className="legal-content">{children}</article>
      <div className="legal-help">
          Questions about this page? <Link href="/contact">Contact us</Link>
      </div>
    </main>
  );
}
