/// <reference types="@cloudflare/workers-types" />

// Cloudflare Workers environment bindings
interface CloudflareEnv {
  DB: D1Database;
}
