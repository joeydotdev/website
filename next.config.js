/** @type {import('next').NextConfig} */
module.exports = {
  eslint: {
    dirs: ['src'],
  },

  reactStrictMode: true,

  // Uncoment to add domain whitelist
  // images: {
  //   domains: [
  //     'res.cloudinary.com',
  //   ],
  // },

  // SVGR
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            typescript: true,
            icon: true,
          },
        },
      ],
    });

    return config;
  },
  async redirects() {
    return [
      {
        source: '/feral-rat',
        destination: 'https://open.spotify.com/playlist/5LwKX6PWJ2JshJGJ2IeBZR?si=8fb911782be241d4',
        permanent: true,
        basePath: false,
      },
    ];
  },
};
