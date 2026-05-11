import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
    ],
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        // Proxy any requests starting with /api/ (that do not match local Next.js api routes) 
        // to the backend FastAPI server
        source: "/api/v1/:path*",
        destination: process.env.BACKEND_API_URL 
          ? `${process.env.BACKEND_API_URL}/:path*` 
          : "http://localhost:8000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
