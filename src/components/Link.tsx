"use client";

/**
 * Site-wide replacement for `next/link`. Import this everywhere instead of
 * `next/link` (enforced by the no-restricted-imports lint rule).
 *
 * Two jobs:
 *
 * 1. `prefetch={false}` by default. The Cloudflare Pages deploy ships only
 *    route-level RSC payloads (`<route>.txt`) — the per-segment
 *    `__next.*.txt` files that viewport prefetching requests are stripped
 *    to stay under the 20k-file limit (see `npm run deploy`). Prefetching
 *    would therefore only generate 404s; navigation itself still resolves
 *    client-side through the on-demand route payload.
 *
 * 2. Announce navigation start on `window` so <NavProgress> can show a
 *    loading indicator — without prefetched data, a click has to await the
 *    payload fetch, and silent waiting reads as a broken link.
 */

import NextLink from "next/link";
import type { ComponentProps } from "react";

export default function Link({
  onNavigate,
  ...props
}: ComponentProps<typeof NextLink>) {
  return (
    <NextLink
      prefetch={false}
      {...props}
      onNavigate={(e) => {
        window.dispatchEvent(new Event("zen:nav-start"));
        onNavigate?.(e);
      }}
    />
  );
}
