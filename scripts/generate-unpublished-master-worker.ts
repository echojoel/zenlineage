import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { masters } from "@/db/schema";

function jsString(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

async function main() {
  const targetDir = process.argv[2] ?? "out-cf";
  fs.mkdirSync(targetDir, { recursive: true });

  const unpublished = await db
    .select({ slug: masters.slug })
    .from(masters)
    .where(eq(masters.published, false))
    .orderBy(masters.slug);

  const paths = unpublished.map((m) => `/masters/${m.slug}`);

  const worker = `const UNPUBLISHED_MASTER_PATHS = new Set(${jsString(paths)});

function canonicalMasterPath(pathname) {
  let normalized = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  if (normalized.endsWith(".html")) normalized = normalized.slice(0, -5);
  return normalized;
}

function unpublishedMasterResponse(method) {
  const body =
    method === "HEAD"
      ? null
      : "<!doctype html><html><head><meta charset=\\"utf-8\\"><meta name=\\"robots\\" content=\\"noindex\\"><title>404: Not Found</title></head><body><h1>404: Not Found</h1></body></html>";

  return new Response(body, {
    status: 404,
    headers: {
      "cache-control": "no-store",
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex",
    },
  });
}

export default {
  async fetch(request, env) {
    const method = request.method.toUpperCase();
    if (method === "GET" || method === "HEAD") {
      const url = new URL(request.url);
      if (UNPUBLISHED_MASTER_PATHS.has(canonicalMasterPath(url.pathname))) {
        return unpublishedMasterResponse(method);
      }
    }

    return env.ASSETS.fetch(request);
  },
};
`;

  const routes = {
    version: 1,
    include: ["/masters/*"],
    exclude: ["/masters/*.webp", "/masters/*.svg", "/masters/thumb/*"],
  };

  fs.writeFileSync(path.join(targetDir, "_worker.js"), worker, "utf8");
  fs.writeFileSync(path.join(targetDir, "_routes.json"), `${JSON.stringify(routes, null, 2)}\n`, "utf8");

  console.log(
    `[generate-unpublished-master-worker] ${paths.length} unpublished master path(s) guarded in ${targetDir}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
