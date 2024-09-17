/** @type {import('next').NextConfig} */
const nextConfig = {transpilePackages: ["geist"],serverRuntimeConfig: {
    // This will be available on both server and client sides
    functionMaxDuration: 60 // in seconds
  },};
  if (process.env.VERCEL) {
    nextConfig.functions = {
      'api/content/getTag': {
        maxDuration: 60
      }
    };
  }
export default nextConfig;
