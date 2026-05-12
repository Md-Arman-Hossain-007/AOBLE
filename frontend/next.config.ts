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
    // For local development outside of Docker, use localhost:8000
    // For Docker environment, the environment variable BACKEND_API_URL should be set to http://backend:8000/api/v1
    const backendUrl = process.env.BACKEND_API_URL || "http://backend:8000/api/v1";
    
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
