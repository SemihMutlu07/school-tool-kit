import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return process.env.CHAT_FIRST === "true"
      ? [{ source: "/", destination: "/chat", permanent: false }]
      : [];
  },
};

export default nextConfig;
