/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["playwright"],
  images: {
    // No remote image hosts are configured. This keeps the image optimizer closed.
    remotePatterns: [],
  },
};

export default nextConfig;
