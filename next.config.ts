import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use a project-specific cache directory to avoid Windows file-lock
  // conflicts left behind in the default `.next/trace` file. Vercel expects
  // the standard `.next` directory unless its dashboard is reconfigured.
  distDir: process.env.VERCEL ? ".next" : ".next-hsk",
};

export default nextConfig;
