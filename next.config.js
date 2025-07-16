import { resolve } from 'path';

export const reactStrictMode = true;
export const transpilePackages = [];
export const assetPrefix = process.env.NODE_ENV === 'production' ? '' : '';
export const poweredByHeader = false;
export const compress = true;
export const output = 'standalone';
export const trailingSlash = true;
export const images = {
  unoptimized: true,
};
export async function headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'Strict-Transport-Security', value: 'max-age=0' },
      ],
    },
  ];
}
export const eslint = {
  ignoreDuringBuilds: true,
};
export const typescript = {
  ignoreBuildErrors: true,
};
export function webpack(config, { isServer }) {
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    '@': resolve(__dirname, 'src'),
    '@components': resolve(__dirname, 'src/components'),
    '@lib': resolve(__dirname, 'src/lib'),
    '@hooks': resolve(__dirname, 'src/hooks'),
    '@pages': resolve(__dirname, 'src/pages'),
    '@styles': resolve(__dirname, 'src/styles'),
  };

  config.module.rules.push({
    test: /[\\/]src[\\/]pages[\\/]api_backup[\\/].*$/,
    use: 'null-loader',
  });

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
}
