"use client";

/**
 * Hairline indeterminate progress bar across the top of the viewport,
 * shown while a client-side navigation is fetching its route payload.
 * Driven by the `zen:nav-start` event dispatched from <Link>.
 *
 * The bar is active while the app pathname still equals the pathname the
 * navigation started from — i.e. the navigation hasn't committed yet. A
 * timeout covers same-pathname navigations, which never commit a change.
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const MAX_VISIBLE_MS = 5000;

export default function NavProgress() {
  const pathname = usePathname();
  const [navFrom, setNavFrom] = useState<string | null>(null);

  useEffect(() => {
    const onStart = () => setNavFrom(window.location.pathname);
    window.addEventListener("zen:nav-start", onStart);
    return () => window.removeEventListener("zen:nav-start", onStart);
  }, []);

  const active = navFrom !== null && navFrom === pathname;

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setNavFrom(null), MAX_VISIBLE_MS);
    return () => clearTimeout(t);
  }, [active]);

  return <div className="nav-progress" data-active={active || undefined} aria-hidden />;
}
