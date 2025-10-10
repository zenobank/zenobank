import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: `${process.env.API_BASE_URL}/:path*`,
  //     },
  //   ];
  // },
  // transpilePackages: ['wagmi', 'viem', '@rainbow-me/rainbowkit'],
  // experimental: {
  //   esmExternals: 'loose',
  // },
};
export default nextConfig;
