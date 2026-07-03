import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: "/release-notes",
        destination: "/whats-new",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
