import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cabbage HSK Writing — HSK 6 Writing Practice",
    short_name: "Cabbage HSK",
    description: "HSK 6 Chinese summarization practice, mock writing tests, and personalized AI feedback.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffdf8",
    theme_color: "#176447",
    lang: "en",
    icons: [
      {
        src: "/cabbage-mascot.png",
        sizes: "1254x1254",
        type: "image/png",
      },
    ],
  };
}
