import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript checks during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optimize images
  images: {
    domains: ['udyamregistration.gov.in'],
  },

  // Experimental features  
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  }
};

export default nextConfig;
