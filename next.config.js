/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  images: {
    remotePatterns: [
      // For local development
      { protocol: 'http', hostname: 'localhost', port: '1337', pathname: '/uploads/**' },
      // For your live production backend
      { protocol: 'https', hostname: 'lockey-news-backend.onrender.com', pathname: '/uploads/**' }
    ],
  },
};

module.exports = nextConfig;