/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  sassOptions: {
    includePaths: ['./styles/utils'],
    prependData: `@use "variables" as v; @use "mixins" as m;`,
  },
}

module.exports = nextConfig
