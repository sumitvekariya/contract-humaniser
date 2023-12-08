/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding", "classnames");
    return config;
  },
}

module.exports = nextConfig
