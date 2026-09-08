import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["mfnguard-contract"],
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "mfnguard-contract": path.resolve(__dirname, "../contract/src/managed/mfnguard/contract/index.js")
    };
    
    // Fix isomorphic-ws in browser
    if (!isServer) {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            ws: false,
        };
        config.resolve.alias = {
            ...config.resolve.alias,
            'isomorphic-ws': path.resolve(__dirname, 'src/lib/ws-browser.js'),
        };
    }
    
    // Enable WebAssembly
    config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
        layers: true,
    };
    
    return config;
  }
};

export default nextConfig;
