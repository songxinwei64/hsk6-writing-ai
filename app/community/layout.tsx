import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "HSK Writing Community",
  description: "Share encouragement, compare Chinese summary-writing approaches, and discuss HSK 6 writing practice with other learners.",
  path: "/community",
  keywords: ["HSK writing community", "Chinese writing discussion", "HSK 6 learners"],
});

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return children;
}
