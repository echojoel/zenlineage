import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // OpenNext exposes CF bindings on the process env proxy at the edge
  const ae = (
    (process.env as unknown as CloudflareEnv).AE
  ) as AnalyticsEngineDataset | undefined;

  if (ae) {
    const ip = req.headers.get("cf-connecting-ip") ?? "unknown";
    const ua = req.headers.get("user-agent") ?? "";
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD salt

    const raw = `${ip}|${ua}|${date}`;
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(raw)
    );
    const hash = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    ae.writeDataPoint({
      blobs: [req.nextUrl.pathname],
      indexes: [hash],
    });
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next.js internals, static files, and media assets
  matcher: ["/((?!_next/|favicon\\.ico|.*\\.(?:webp|svg|png|jpg|ico|js|css)).*)"],
};
