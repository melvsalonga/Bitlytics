import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build
      config.resolve.fallback = {
        fs: false,
        net: false,
        dns: false,
        tls: false,
        crypto: false,
      }
    }
    return config
  },
};

export default nextConfig;
