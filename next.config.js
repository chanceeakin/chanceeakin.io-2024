/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const withMDX = require("@next/mdx")();
const withNextIntl = require("next-intl/plugin")("./src/i18n/request.ts");

// Unique per build so the service worker file changes on every deploy.
const buildId =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  String(Date.now());

/** @type {import('next').NextConfig} */
const nextConfig = withNextIntl(
  withMDX(
  withBundleAnalyzer({
    reactStrictMode: false,
    env: { NEXT_PUBLIC_BUILD_ID: buildId },
    generateBuildId: async () => buildId,
    async headers() {
      return [
        {
          source: "/sw.js",
          headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
        },
      ];
    },
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
