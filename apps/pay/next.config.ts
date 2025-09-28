import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.zenobank.io/api/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
