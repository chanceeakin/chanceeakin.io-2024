import type { MetadataRoute } from "next";

// Open to all crawlers, including AI agents; the site has nothing private.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
  };
}
