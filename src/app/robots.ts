import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // NOTE: `/data/` was previously disallowed. Do not reinstate that.
        // Those files are not private — they are the content. `/lineage`
        // fetches /data/graph.json, `/practice` fetches /data/temples.json,
        // and site search fetches /data/search-index.json, all client-side.
        // Googlebot renders JavaScript but will not fetch a resource robots
        // forbids, so the disallow left our three most distinctive pages
        // permanently empty to crawlers. It also contradicted /llms.txt,
        // which points agents straight at /data/graph.json.
      },
    ],
    sitemap: "https://zenlineage.org/sitemap.xml",
  };
}
