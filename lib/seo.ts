import type { Metadata } from "next";

export const SITE_URL = "https://hsk6-writing-ai.vercel.app";
export const SITE_NAME = "Cabbage HSK Writing";
export const SOCIAL_IMAGE = "/write-hsk-product-preview.png";

const DEFAULT_KEYWORDS = [
  "Cabbage HSK Writing",
  "Cabbage HSK",
  "白菜 HSK 写作",
  "배추 HSK 쓰기",
  "HSK",
  "HSK 6",
  "HSK 6 writing practice",
  "HSK 6 writing test",
  "HSK 6 summarization practice",
  "HSK六级写作",
  "HSK六级写作练习",
  "HSK六级缩写练习",
  "汉语水平考试六级写作",
  "HSK 6 쓰기",
  "HSK 6 쓰기 연습",
  "HSK 6 작문 연습",
  "HSK 6 요약 연습",
  "중국어 요약 연습",
];

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  index?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  index = true,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    keywords: [...new Set([...DEFAULT_KEYWORDS, ...keywords])],
    alternates: {
      canonical: path,
    },
    robots: {
      index,
      follow: index,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_US",
      alternateLocale: ["zh_CN", "ko_KR"],
      type: "website",
      images: [
        {
          url: SOCIAL_IMAGE,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — HSK 6 Chinese writing and summarization practice`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [SOCIAL_IMAGE],
    },
  };
}
