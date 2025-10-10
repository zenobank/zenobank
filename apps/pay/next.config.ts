import type { NextConfig } from 'next';
import 'dotenv/config';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NODE_ENV}/:path*`,
      },
    ];
  },
};
export default nextConfig;
