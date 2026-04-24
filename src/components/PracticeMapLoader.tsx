"use client";

/**
 * Client boundary for the practice map. We load PracticeMap via next/dynamic
 * with `ssr: false` so MapLibre GL's window-touching module code never
 * executes on the server. Next.js 16 disallows `ssr: false` in Server
 * Components, so this thin wrapper marks itself `"use client"` and the
 * server page imports it normally.
 */

import { Suspense } from "react";
import dynamic from "next/dynamic";

const PracticeMap = dynamic(() => import("@/components/PracticeMap"), {
  ssr: false,
  loading: () => <p className="detail-muted">Loading map…</p>,
});

export default function PracticeMapLoader() {
  return (
    <Suspense fallback={<p className="detail-muted">Loading map…</p>}>
      <PracticeMap />
    </Suspense>
  );
}
