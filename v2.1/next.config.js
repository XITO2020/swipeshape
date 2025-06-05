/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow importing from libs outside of src directory
  transpilePackages: [],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Similar to above, this allows production builds with type errors
    ignoreBuildErrors: true,
  }
};

module.exports = nextConfig;
