const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  poweredByHeader: false,
  compress: true,
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=0',
          },
        ],
      },
    ];
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  webpack: (config, { isServer }) => {
    // ✅ Ajout des alias pour résoudre les chemins
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@styles': path.resolve(__dirname, 'src/styles'),
    };

    // ✅ Ignorer certains modules côté client
    config.module.rules.push({
      test: /[\\/]src[\\/]pages[\\/]api_backup[\\/].*$/,
      loader: 'ignore-loader',
    });

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'react-router-dom': require.resolve('./src/mockModules/empty-module.js'),
        '@clerk/clerk-react': require.resolve('./src/mockModules/empty-module.js'),
        'react-bootstrap/Accordion': require.resolve('./src/mockModules/empty-module.js'),
        'react-quill': require.resolve('./src/mockModules/empty-module.js'),
      };
    }

    return config;
  },
};

module.exports = nextConfig;
