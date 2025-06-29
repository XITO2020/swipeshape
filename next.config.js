import path from 'path';
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ... (tout le reste que tu avais déjà)

  webpack: (config, { isServer }) => {
    // 👉 Ajout des alias utilisés dans tsconfig.json
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      // ajoute d'autres alias ici si tu en utilises
    };

    // ✅ Ton code déjà présent
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

export default nextConfig;
