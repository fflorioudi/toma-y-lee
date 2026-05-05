import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "toma-y-lee.vercel.app",
          },
        ],
        destination: "https://tomaylee.com.ar/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;