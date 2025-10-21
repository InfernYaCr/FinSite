import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['ru'],
    defaultLocale: 'ru',
  },
}

export default nextConfig
