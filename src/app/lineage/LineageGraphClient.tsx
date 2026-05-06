"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const LineageGraph = dynamic(() => import("@/components/LineageGraph"), { ssr: false });

export default function LineageGraphClient() {
  return (
    <Suspense>
      <LineageGraph />
    </Suspense>
  );
}
