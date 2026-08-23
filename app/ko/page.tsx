import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "HSK 6 쓰기 연습과 AI 피드백",
    description: "문장·단락 요약부터 실제 HSK 6 방식의 쓰기 모의고사까지 연습하고, 작성한 중국어 요약문에 맞춤형 AI 피드백을 받아 보세요.",
    path: "/ko",
    keywords: [
      "HSK",
      "HSK 6 쓰기",
      "HSK 6 쓰기 연습",
      "HSK 6 작문 연습",
      "HSK 6 요약 연습",
      "HSK 6 쓰기 모의고사",
      "중국어 요약 연습",
      "HSK 6 AI 피드백",
    ],
  }),
  alternates: {
    canonical: "/ko",
    languages: {
      en: "/",
      "zh-CN": "/",
      "ko-KR": "/ko",
      "x-default": "/",
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "HSK 6 쓰기 연습과 AI 피드백",
  url: `${SITE_URL}/ko`,
  description: "한국어 안내와 해설로 이용하는 HSK 6 중국어 요약 쓰기 연습 플랫폼",
  inLanguage: "ko-KR",
  isPartOf: { "@id": `${SITE_URL}/#website` },
};

const entries = [
  {
    number: "01",
    icon: "practice",
    title: "요약 쓰기 연습",
    description: "문장과 짧은 글에서 핵심 정보를 찾고, 불필요한 내용을 덜어 내 정확하고 간결한 중국어 요약문을 작성합니다.",
    details: ["문장 요약", "단락 요약"],
    tone: "sage",
    href: "/practice",
  },
  {
    number: "02",
    icon: "library",
    title: "HSK 6 쓰기 모의고사",
    description: "실제 HSK 6 방식처럼 원문을 읽은 뒤 글이 가려지면 약 400자의 중국어 요약문을 작성합니다.",
    details: ["10분 읽기", "35분 쓰기", "AI 피드백"],
    tone: "sand",
    href: "/practice/mock",
  },
  {
    number: "03",
    icon: "mine",
    title: "나의 연습",
    description: "완료한 문제, 저장한 답안, 수정 기록을 한곳에서 확인하며 학습 진도를 이어 갈 수 있습니다.",
    details: ["저장한 문제", "연습 기록"],
    tone: "blue",
    href: "/my-library",
  },
  {
    number: "04",
    icon: "community",
    title: "학습 커뮤니티",
    description: "같은 문제에 대한 다양한 요약 방식을 비교하고 HSK 쓰기와 시험 준비 방법을 함께 나눕니다.",
    details: ["문제별 토론", "응원 메시지"],
    tone: "rose",
    href: "/community",
  },
];

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

export default function KoreanHomePage() {
  return (
    <main className="page" lang="ko">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <section className="hero-wrap">
        <div className="hero">
          <span className="eyebrow">HSK 6 · AI 쓰기 연습</span>
          <h1>HSK 6 쓰기 연습</h1>
          <p>문장과 단락으로 요약 능력을 익힌 뒤 실제 HSK 6 쓰기 방식으로 연습하세요.</p>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="paper">
            <div className="paper-top">
              <span>전체 쓰기 · AI 피드백</span>
              <small>원문 약 1,000자</small>
            </div>
            <p className="paper-text">
              大雪封路后，老周仍步行四小时，把急需的药送到山村。
              <mark>这件事也让邮局重新认识了山区邮路的价值。</mark>
            </p>
            <div className="summary-box">
              <small>나의 요약 · 약 400자</small>
              <p>老周冒雪为老人送药，邮局因此决定保留这条邮路。</p>
            </div>
            <div className="ai-feedback-card">
              <div className="ai-feedback-head">
                <span className="ai-avatar">W</span>
                <span className="ai-identity">
                  <b>Write HSK AI 튜터</b>
                  <small>내용 정확성</small>
                </span>
                <span className="ai-spark" aria-hidden="true">✦</span>
              </div>
              <p>약을 전달한 사건과 우편 노선이 유지된 결과는 잘 담았지만, 주민들이 눈을 치우며 도운 과정과 노선의 장기적인 역할이 빠졌습니다.</p>
              <div className="ai-suggestion">
                <small>수정 제안</small>
                <span>주민들의 행동과 우편 노선의 실제 역할을 보충해 사건의 전개와 결과를 자연스럽게 연결하세요.</span>
              </div>
            </div>
          </div>
          <span className="visual-note note-one">빠진 핵심 찾기</span>
          <span className="visual-note note-two">수정 방향 확인</span>
        </div>
      </section>

      <section className="entry-grid" aria-label="주요 기능">
        {entries.map((entry) => (
          <Link className={`entry-card ${entry.tone}`} key={entry.number} href={entry.href}>
            <div className="entry-top">
              <span className="entry-icon"><EntryIcon name={entry.icon} /></span>
              <span className="entry-number">{entry.number}</span>
            </div>
            <h3>{entry.title}</h3>
            <p>{entry.description}</p>
            <div className="entry-links">
              {entry.details.map((detail) => <span key={detail}>{detail}</span>)}
            </div>
            <span className="entry-action">열기 <span>→</span></span>
          </Link>
        ))}
      </section>
    </main>
  );
}
