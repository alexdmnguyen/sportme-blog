import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // For local development
      { protocol: 'http', hostname: 'localhost', port: '1337', pathname: '/uploads/**' },
      // For production on Render
      { protocol: 'https', hostname: 'lockey-news-backend.onrender.com', pathname: '/uploads/**' }
    ],
  },
};

export default nextConfig;
