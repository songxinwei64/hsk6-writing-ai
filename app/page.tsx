import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "HSK 6 Writing Practice",
    description: "Practice HSK 6 Chinese sentence and passage summarization, complete mock writing tests, and receive personalized AI feedback.",
    path: "/",
    keywords: [
      "HSK 6 writing practice",
      "HSK 6 writing",
      "Chinese summarization practice",
      "HSK writing mock test",
      "HSK 6 AI writing feedback",
      "汉语水平考试六级写作",
      "HSK六级写作练习",
      "HSK六级缩写练习",
      "HSK六级写作模拟题",
      "HSK 6 쓰기 연습",
      "HSK 6 작문 연습",
      "HSK 6 요약 연습",
      "HSK 6 쓰기 모의고사",
      "중국어 요약 연습",
    ],
  }),
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      "ko-KR": "/ko",
      "x-default": "/",
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Write HSK",
      alternateName: ["Write HSK 6", "HSK六级写作练习", "HSK 6 쓰기 연습"],
      inLanguage: ["en", "zh-CN", "ko-KR"],
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#application`,
      name: "Write HSK",
      url: SITE_URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires a modern web browser",
      description: "HSK 6 Chinese summarization practice, mock writing tests, and personalized AI feedback.",
      inLanguage: ["en", "zh-CN", "ko-KR"],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "KRW",
        description: "Free HSK 6 writing exercises with an optional paid membership.",
      },
      featureList: [
        "Sentence summarization practice",
        "Passage summarization practice",
        "HSK 6 mock writing tests",
        "Personalized AI feedback",
      ],
    },
  ],
};

const mainEntries = [
  {
    number: "01",
    icon: "practice",
    title: "Writing Practice",
    description: "Start with sentences and short passages. Learn to identify key information and write accurate, concise summaries.",
    links: ["Sentence Summaries", "Passage Summaries"],
    tone: "sage",
    href: "/practice",
  },
  {
    number: "02",
    icon: "library",
    title: "HSK 6 Mock Tests",
    description: "Follow the HSK 6 exam format: read the passage, continue after it is hidden, and write a summary of about 400 Chinese characters.",
    links: ["10-Minute Reading", "35-Minute Writing", "AI Feedback"],
    tone: "sand",
    href: "/practice/mock",
  },
  {
    number: "03",
    icon: "mine",
    title: "My Practice",
    description: "Review completed exercises, saved answers, and revision history in one place.",
    links: ["Saved Exercises", "Practice History"],
    tone: "blue",
    href: "/my-library",
  },
  {
    number: "04",
    icon: "community",
    title: "Community",
    description: "Compare approaches to the same prompt and exchange writing and exam-preparation ideas.",
    links: ["Writing Discussions", "Study Discussions"],
    tone: "rose",
    href: "/community",
  },
];

const sectionIds = ["practice", "library", "mine", "community"];

function EntryIcon({ name }: { name: string }) {
  if (name === "practice") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3.5h9l3 3V20.5H6z" />
        <path d="M15 3.5v3h3M9 11h6M9 15h4" />
      </svg>
    );
  }

  if (name === "library") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4.5 5.5h6.2c1.1 0 1.8.5 1.8 1.5v12c0-1-.7-1.5-1.8-1.5H4.5z" />
        <path d="M19.5 5.5h-6.2c-1.1 0-1.8.5-1.8 1.5v12c0-1 .7-1.5 1.8-1.5h6.2z" />
      </svg>
    );
  }

  if (name === "mine") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7.5h6l1.7 2H20v10H4z" />
        <path d="M9.5 13h5M12 10.5V16" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h11v8H9l-4 3v-3H4z" />
      <path d="M10 9h10v8h-3v3l-4-3h-3" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <section className="hero-wrap">
        <div className="hero">
          <span className="eyebrow">HSK 6 · AI Writing Practice</span>
          <h1>HSK 6 Writing Practice</h1>
          <p>Build summarization skills step by step, then practice with the complete HSK 6 writing format.</p>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="paper">
            <div className="paper-top">
              <span>Full Writing · AI Feedback</span>
              <small>About 1,000 Chinese characters</small>
            </div>
            <p className="paper-text">
              大雪封路后，老周仍步行四小时，把急需的药送到山村。
              <mark>这件事也让邮局重新认识了山区邮路的价值。</mark>
            </p>
            <div className="summary-box">
              <small>My Summary · About 400 characters</small>
              <p>老周冒雪为老人送药，邮局因此决定保留这条邮路。</p>
            </div>
            <div className="ai-feedback-card">
              <div className="ai-feedback-head">
                <span className="ai-avatar">W</span>
                <span className="ai-identity">
                  <b>Write HSK AI Tutor</b>
                  <small>Content Accuracy</small>
                </span>
                <span className="ai-spark" aria-hidden="true">✦</span>
              </div>
              <p>
                你保留了送药和邮路被保留的结果，但遗漏了村民清雪开路，以及邮路长期承担便民服务的原因。
              </p>
              <div className="ai-suggestion">
                <small>Suggested Revision</small>
                <span>补充村民的行动和邮路的实际作用，让事件发展与最终结果衔接完整。</span>
              </div>
            </div>
          </div>
          <span className="visual-note note-one">Identify Missing Ideas</span>
          <span className="visual-note note-two">Get Revision Guidance</span>
        </div>
      </section>

      <section className="entry-grid" id="entries" aria-label="Main features">
        {mainEntries.map((entry, index) => (
          <Link
            className={`entry-card ${entry.tone}`}
            id={sectionIds[index]}
            key={entry.number}
            href={entry.href}
            aria-label={`Open ${entry.title}`}
          >
            <div className="entry-top">
              <span className="entry-icon">
                <EntryIcon name={entry.icon} />
              </span>
              <span className="entry-number">{entry.number}</span>
            </div>
            <h3>{entry.title}</h3>
            <p>{entry.description}</p>
            <div className="entry-links">
              {entry.links.map((link) => (
                <span key={link}>{link}</span>
              ))}
            </div>
            <span className="entry-action">
              Open <span>→</span>
            </span>
          </Link>
        ))}
      </section>

    </main>
  );
}
