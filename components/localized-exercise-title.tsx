"use client";

import { useSiteLocale } from "../lib/use-site-locale";
import { getKoreanParagraphGuidance, getKoreanSentenceGuidance } from "../lib/practice-korean";

type PracticeType = "sentence" | "paragraph" | "mock";

const fallbackLabels = {
  en: {
    sentence: "Sentence Summarization",
    paragraph: "Passage Summarization",
    mock: "HSK 6 Mock Test",
  },
  zh: {
    sentence: "句子缩写",
    paragraph: "短文缩写",
    mock: "HSK 6 写作模拟",
  },
  ko: {
    sentence: "문장 요약",
    paragraph: "단락 요약",
    mock: "HSK 6 쓰기 모의고사",
  },
} as const;

export default function LocalizedExerciseTitle({
  practiceType,
  orderNo,
  title,
  skill,
}: {
  practiceType: PracticeType;
  orderNo: number;
  title?: string | null;
  skill?: string | null;
}) {
  const locale = useSiteLocale();

  const genericTitle = title?.match(/^(Sentence Summarization|Passage Summarization|HSK 6 Mock Test)\s+(\d+)$/);

  // Real Chinese question titles are learning material and stay Chinese. Old
  // generated English fallback titles are interface text, so localize them.
  if (title && !genericTitle) return <>{title}</>;

  const displayedOrderNo = genericTitle ? Number(genericTitle[2]) : orderNo;

  if (locale === "ko") {
    const guidance = practiceType === "sentence"
      ? getKoreanSentenceGuidance(displayedOrderNo)
      : practiceType === "paragraph"
        ? getKoreanParagraphGuidance(displayedOrderNo)
        : undefined;
    return <>{guidance?.skill ?? `${fallbackLabels.ko[practiceType]} ${displayedOrderNo}`}</>;
  }

  if (skill) return <>{skill}</>;
  return <>{fallbackLabels[locale][practiceType]} {displayedOrderNo}</>;
}
