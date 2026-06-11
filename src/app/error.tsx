"use client";

/**
 * Route-level error boundary. The site is a static export, so errors here
 * are client-side render/runtime failures (bad cached chunk, fetch failure
 * inside an interactive component). Offer retry plus a hard reload, which
 * also recovers from stale deployments.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="error-boundary">
      <p className="error-boundary-glyph" aria-hidden>
        ○
      </p>
      <h1>Something went wrong</h1>
      <p className="error-boundary-detail">
        {error?.message || "An unexpected error occurred while rendering this page."}
      </p>
      <div className="error-boundary-actions">
        <button type="button" onClick={() => reset()}>
          Try again
        </button>
        <button type="button" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </div>
    </main>
  );
}
