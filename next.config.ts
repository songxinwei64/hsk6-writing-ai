import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use a project-specific cache directory to avoid Windows file-lock
  // conflicts left behind in the default `.next/trace` file.
  distDir: ".next-hsk",
};

export default nextConfig;
