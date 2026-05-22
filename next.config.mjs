/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow any HTTPS host — admins paste image URLs from various sources.
    // If you later restrict uploads to Cloudinary only, narrow this back down.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    // Cache optimized images for 7 days so dev rebuilds don't re-fetch
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  experimental: {
    serverActions: { bodySizeLimit: '5mb' },
  },
};

export default nextConfig;
