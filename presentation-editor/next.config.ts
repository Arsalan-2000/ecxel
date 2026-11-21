import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel will pick this up automatically. For Docker/standalone deployment
  // you can uncomment the line below.
  // output: "standalone",
  reactStrictMode: false,
};

export default nextConfig;
