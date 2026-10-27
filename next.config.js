/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const withMDX = require("@next/mdx")();
const withNextIntl = require("next-intl/plugin")("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = withNextIntl(
  withMDX(
  withBundleAnalyzer({
    reactStrictMode: false,
    // Keep the dev-only indicator clear of the settings button.
    devIndicators: { position: "bottom-right" },
    pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "via.placeholder.com",
        },
      ],
    },
  })
  )
);

module.exports = nextConfig;
