/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações de headers para CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },

  // Configurações de turbopack
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Configurações de imagens
  images: {
    unoptimized: true,
  },

  // Configurações de webpack
  webpack: (config, { isServer }) => {
    // Configurações adicionais se necessário
    return config;
  },
};

module.exports = nextConfig;
