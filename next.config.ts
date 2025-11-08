import type { NextConfig } from "next";

const nextConfig = {
    reactCompiler: true,
    experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};



export default nextConfig;
