import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
     // Allow data URIs for image previews
     dangerouslyAllowSVG: true,
     contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
     // Allow data URIs for image previews (alternative)
     // domains: ['data:'], // This might be less secure, remotePatterns is preferred if possible
     // Update: Next.js 13+ recommends remotePatterns or loader config for external images.
     // For data URIs (Base64), they are handled differently and usually allowed by default
     // for `next/image` `src` prop. No explicit config might be needed, but
     // if issues arise, double-check Next.js version docs.
     // Keeping picsum for potential placeholder use.
  },
};

export default nextConfig;
