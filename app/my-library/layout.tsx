import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "My Practice",
  description: "Review your saved Cabbage HSK Writing answers and practice history.",
  path: "/my-library",
  index: false,
});

export default function MyLibraryLayout({ children }: { children: ReactNode }) {
  return children;
}
