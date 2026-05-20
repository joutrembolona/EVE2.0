import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/EVE2.0",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
