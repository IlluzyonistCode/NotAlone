/** @type {import('next').NextConfig} **/
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  generateEtags: false,
  devIndicators: {
    buildActivity: false
  }
}

module.exports = nextConfig;
