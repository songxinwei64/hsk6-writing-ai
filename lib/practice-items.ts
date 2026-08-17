import { createClient } from "../utils/supabase/server";

export type SentencePracticeItem = {
  id: number;
  databaseId: string;
  skill: string;
  skillEn: string | null;
  tip: string;
  tipEn: string | null;
  original: string;
  reference: string;
  explanation: string;
  explanationEn: string | null;
};

export type ParagraphPracticeItem = SentencePracticeItem & {
  readingSeconds: number;
  writingSeconds: number;
};

export type Hsk6MockPracticeItem = {
  id: number;
  databaseId: string;
  title: string;
  original: string;
  referenceTitle: string;
  reference: string;
  analysis: string;
  analysisEn: string | null;
  readingSeconds: number;
  writingSeconds: number;
  targetCharCount: number;
};

export const PRACTICE_ACCESS = {
  sentence: { guest: 5, free: 20, total: 100 },
  paragraph: { guest: 3, free: 10, total: 80 },
  mock: { guest: 0, free: 3, total: 50 },
} as const;

async function getPublishedItems(
  practiceType: "sentence" | "paragraph" | "mock",
  limit?: number,
) {
  const supabase = await createClient();
  let query = supabase
    .from("practice_items")
    .select("id,order_no,title,skill,skill_en,tip,tip_en,original_text,reference_title,reference_text,explanation,explanation_en,reading_seconds,writing_seconds,target_char_count")
    .eq("practice_type", practiceType)
    .eq("is_published", true)
    .order("order_no", { ascending: true });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Unable to load ${practiceType} practice items: ${error.message}`);
  }

  return data;
}

export async function getSentencePracticeItems(limit?: number): Promise<SentencePracticeItem[]> {
  const data = await getPublishedItems("sentence", limit);
  return data.map((row) => ({
    id: row.order_no,
    databaseId: row.id,
    skill: row.skill ?? "缩写练习",
    skillEn: row.skill_en,
    tip: row.tip ?? "保留主要意思，删除次要细节。",
    tipEn: row.tip_en,
    original: row.original_text,
    reference: row.reference_text,
    explanation: row.explanation ?? "请对照原句和参考答案，判断信息的主次。",
    explanationEn: row.explanation_en,
  }));
}

export async function getParagraphPracticeItems(limit?: number): Promise<ParagraphPracticeItem[]> {
  const data = await getPublishedItems("paragraph", limit);
  return data.map((row) => ({
    id: row.order_no,
    databaseId: row.id,
    skill: row.skill ?? "短文缩写",
    skillEn: row.skill_en,
    tip: row.tip ?? "梳理人物、事件和结果后再进行缩写。",
    tipEn: row.tip_en,
    original: row.original_text,
    reference: row.reference_text,
    explanation: row.explanation ?? "请对照原文检查是否保留了完整主线。",
    explanationEn: row.explanation_en,
    readingSeconds: row.reading_seconds,
    writingSeconds: row.writing_seconds,
  }));
}

export async function getHsk6MockPracticeItems(limit?: number): Promise<Hsk6MockPracticeItem[]> {
  const data = await getPublishedItems("mock", limit);
  return data.map((row) => ({
    id: row.order_no,
    databaseId: row.id,
    title: row.title ?? `模拟题 ${row.order_no}`,
    original: row.original_text,
    referenceTitle: row.reference_title ?? "参考标题",
    reference: row.reference_text,
    analysis: row.explanation ?? "请对照原文检查人物、事件发展和结果是否完整。",
    analysisEn: row.explanation_en,
    readingSeconds: row.reading_seconds,
    writingSeconds: row.writing_seconds,
    targetCharCount: row.target_char_count ?? 400,
  }));
}
