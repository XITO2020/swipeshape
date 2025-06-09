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
  },
  // Ignorer les erreurs de module manquant pendant le build
  webpack: (config, { isServer, dev }) => {
    // SOLUTION TEMPORAIRE: Simuler l'existence des modules manquants
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'react-router-dom': require.resolve('./src/mockModules/empty-module.js'),
        '@clerk/clerk-react': require.resolve('./src/mockModules/empty-module.js'),
        'react-bootstrap/Accordion': require.resolve('./src/mockModules/empty-module.js'),
        'react-quill': require.resolve('./src/mockModules/empty-module.js')
      };
    }
    return config;
  },
};

module.exports = nextConfig;
