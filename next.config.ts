import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Required for the Docker multi-stage build (runner stage uses server.js)
    output: "standalone",
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
    },
};

export default nextConfig;
