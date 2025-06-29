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
    // ✅ Ajout des alias pour tous les chemins @/xx
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@styles': path.resolve(__dirname, 'src/styles'),
    };

    // ❌ Désactivation du ignore-loader non garanti
    // ✅ Ignorer les fichiers de backup en les excluant du bundle
    config.module.rules.push({
      test: /[\\/]src[\\/]pages[\\/]api_backup[\\/].*$/,
      use: 'null-loader',
    });

    // ✅ Plus sûr : ignorer certains modules côté client avec `false`
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
