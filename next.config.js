/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const withMDX = require("@next/mdx")();

/** @type {import('next').NextConfig} */
const nextConfig = withMDX(
  withBundleAnalyzer({
    reactStrictMode: false,
    pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
    productionBrowserSourceMaps: true,
    images: {
      unoptimized: true,
      remotePatterns: [
        {
          protocol: "https",
          hostname: "via.placeholder.com",
        },
      ],
    },
  })
);

module.exports = nextConfig;
