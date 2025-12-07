import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure Turbopack to handle native modules
  turbopack: {
    resolveAlias: {
      'faiss-node': 'faiss-node',
    },
  },
  // Use --webpack flag if you want webpack instead of turbopack
  experimental: {
    // This allows native modules to work
  },
};

export default nextConfig;
