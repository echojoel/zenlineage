"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const LineageGraph = dynamic(() => import("@/components/LineageGraph"), { ssr: false });

export default function LineagePage() {
  return (
    <main className="lineage-page">
      <nav className="lineage-nav">
        <Link href="/" className="nav-link">
          禅
        </Link>
        <span className="lineage-nav-title">Lineage</span>
      </nav>
      <Suspense>
        <LineageGraph />
      </Suspense>
    </main>
  );
}
