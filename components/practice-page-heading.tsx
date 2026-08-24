"use client";

import Link from "next/link";
import { useSiteLocale } from "../lib/use-site-locale";

type Kind = "sentence" | "paragraph" | "mock";

const copy = {
  zh: {
    back: "← 返回缩写练习",
    sentence: ["句子缩写", "保留主要意思，删除次要细节", "写下你的缩写，再与参考答案和简要解析进行比较。"],
    paragraph: ["短文缩写", "抓住文章主线", "阅读原文3分钟，然后用7分钟完成缩写。进入写作后不能再次查看原文。"],
    mock: ["HSK 6 · 写作模拟", "按照正式考试流程练习", "阅读原文10分钟，原文隐藏后在35分钟内完成缩写，不能再次查看原文。"],
    unit: "道练习",
  },
  ko: {
    back: "← 요약 쓰기 연습으로",
    sentence: ["문장 요약", "핵심은 남기고 세부 내용은 덜어 내세요", "직접 요약한 뒤 예시 답안과 핵심 해설을 비교해 보세요."],
    paragraph: ["단락 요약", "글의 중심 흐름을 따라가세요", "3분 동안 원문을 읽고 7분 동안 요약문을 작성합니다. 쓰기 단계에서는 원문을 다시 볼 수 없습니다."],
    mock: ["HSK 6 · 쓰기 모의고사", "실제 시험 순서대로 연습하세요", "10분 동안 원문을 읽고 35분 동안 요약문을 작성합니다. 원문이 가려진 뒤에는 다시 볼 수 없습니다."],
    unit: "문제",
  },
  en: {
    back: "← Back to Writing Practice",
    sentence: ["Sentence Summarization", "Keep the Main Idea, Remove the Details", "Write your summary, then compare it with the suggested answer and key point."],
    paragraph: ["Passage Summarization", "Follow the Main Thread", "Read for 3 minutes, then write for 7 minutes. The original passage cannot be reopened during writing."],
    mock: ["HSK 6 · Writing Mock Test", "Practice with the Official Exam Flow", "Read for 10 minutes and write for 35 minutes. Once hidden, the original passage cannot be viewed again."],
    unit: "Exercises",
  },
} as const;

export default function PracticePageHeading({ kind, totalItems }: { kind: Kind; totalItems: number }) {
  const locale = useSiteLocale();
  const text = copy[locale];
  const [label, title, description] = text[kind];
  return (
    <>
      <Link className="back-link" href="/practice">{text.back}</Link>
      <div className={kind === "mock" ? "mock-page-heading" : "sentence-page-heading"}>
        <span className="eyebrow">{kind === "mock" ? label : `${label} · ${totalItems} ${text.unit}`}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </>
  );
}
