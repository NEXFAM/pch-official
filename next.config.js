/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sql.js'],
    outputFileTracingIncludes: {
      '/**': ['./node_modules/sql.js/dist/**'],
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'sql.js']
    }
    return config
  },
}

module.exports = nextConfig
