import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Open to all crawlers, including AI agents; the site has nothing private.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
