import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/media/:path*",
        destination: `${process.env.BACKEND_URL || "http://127.0.0.1:8000"}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
