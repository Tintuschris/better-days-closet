/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hlygryxopxrkvfvsppvm.supabase.co',
      },
    ],
  },
}

export default nextConfig;