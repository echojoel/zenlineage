"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

// Mirrors the shell LineageGraph renders, so the placeholder occupies the
// same flex slot while the (large, lazy) graph chunk downloads.
const fallback = (
  <div className="lineage-wrapper">
    <div className="lineage-loading">Loading lineage…</div>
  </div>
);

const LineageGraph = dynamic(() => import("@/components/LineageGraph"), {
  ssr: false,
  loading: () => fallback,
});

export default function LineageGraphClient() {
  return (
    <Suspense fallback={fallback}>
      <LineageGraph />
    </Suspense>
  );
}
