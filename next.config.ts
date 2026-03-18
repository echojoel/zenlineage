import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  transpilePackages: ["d3-dag"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
