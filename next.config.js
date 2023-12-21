/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
});

const nextConfig = withMDX(
  withBundleAnalyzer({
    reactStrictMode: false,
    pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  })
);

module.exports = nextConfig;
