/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["geist"],
  serverRuntimeConfig: {
    functionMaxDuration: 60 // in seconds
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ["error"]
    } : false
  }
};

export default nextConfig;