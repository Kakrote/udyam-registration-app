import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Configure rewrites for API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? `${process.env.BACKEND_URL}/api/:path*`
          : '/api/:path*',
      },
    ];
  },

  // Configure environment variables
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',
  },

  // Optimize images
  images: {
    domains: ['udyamregistration.gov.in'],
  },

  // Experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:5000']
    }
  }
};

export default nextConfig;
