/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow importing from libs outside of src directory
  transpilePackages: [],
  // Désactiver le forçage HTTPS pour permettre les connexions HTTP
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Optimisations pour la production et désactivation du forçage HTTPS
  poweredByHeader: false,
  compress: true,
  output: 'standalone',
  trailingSlash: true, // Ajoute un slash en fin d'URL pour éviter les redirections
  images: {
    unoptimized: true,
  },
  // Désactiver explicitement la sécurité HTTPS stricte
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
    // Exclure le dossier api_backup de la compilation
    config.module.rules.push({
      test: /[\\/]src[\\/]pages[\\/]api_backup[\\/].*$/,
      loader: 'ignore-loader',
    });

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

    // Aucune configuration spécifique pour les imports non-relatifs n'est nécessaire
    // puisque nous utilisons nodemailer qui a un système d'imports standard
    return config;
  },
};

module.exports = nextConfig;
