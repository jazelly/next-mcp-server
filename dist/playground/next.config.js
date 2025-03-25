"use strict";
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Experimental features
    experimental: {
        // This helps with monorepo setups
        externalDir: true,
    }
};
module.exports = nextConfig;
