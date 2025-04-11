/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'xfsdkwxzfaxcaxmtttcr.supabase.co',
        pathname: '/storage/v1/object/public/**'
      }
    ]
  },
};

module.exports = nextConfig;
