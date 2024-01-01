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
  })
);

module.exports = nextConfig;
