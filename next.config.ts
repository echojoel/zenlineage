import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["d3-dag"],
  images: {
    unoptimized: true, // Images are pre-optimized WebP; no runtime sharp needed
  },
};

export default nextConfig;
