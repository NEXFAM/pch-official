/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Force Vercel to include the sql.js WASM file in every serverless function
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
