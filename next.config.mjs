/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // The $35 donation offer was retired; old links land on the Compare page.
  redirects: async () => [{ source: '/offer', destination: '/compare', permanent: true }],
}

export default nextConfig
