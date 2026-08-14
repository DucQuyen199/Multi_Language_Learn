import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
      { source: "/healthz", destination: `${backendUrl}/healthz` },
      { source: "/readyz", destination: `${backendUrl}/readyz` },
    ];
  },
};

export default nextConfig;
