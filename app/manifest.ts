import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Write HSK — HSK 6 Writing Practice",
    short_name: "Write HSK",
    description: "HSK 6 Chinese summarization practice, mock writing tests, and personalized AI feedback.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffdf8",
    theme_color: "#176447",
    lang: "en",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
