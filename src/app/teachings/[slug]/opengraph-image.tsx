import { ImageResponse } from "next/og";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { teachingContent, teachings } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const alt = "Teaching — Zen Lineage";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const all = await db.select({ slug: teachings.slug }).from(teachings);
  return all.map((t) => ({ slug: t.slug }));
}

export default async function TeachingOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const row = (
    await db
      .select({
        type: teachings.type,
        collection: teachings.collection,
        caseNumber: teachings.caseNumber,
        title: teachingContent.title,
        content: teachingContent.content,
      })
      .from(teachings)
      .leftJoin(
        teachingContent,
        and(eq(teachingContent.teachingId, teachings.id), eq(teachingContent.locale, "en"))
      )
      .where(eq(teachings.slug, slug))
      .limit(1)
  )[0];

  const title = row?.title ?? slug;
  const subline =
    row?.collection && row?.caseNumber
      ? `${row.collection} · Case ${row.caseNumber}`
      : (row?.collection ?? row?.type ?? "Teaching");
  const excerpt = (row?.content ?? "").slice(0, 220);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 96px",
          background: "#f3f0eb",
          color: "#3d3530",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#7a6a55",
          }}
        >
          {`Zen Lineage · ${row?.type ?? "Teaching"}`}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 72, lineHeight: 1.1, fontWeight: 400 }}>
            {title}
          </div>
          <div style={{ fontSize: 28, color: "#7a6a55", fontStyle: "italic" }}>
            {subline}
          </div>
          {excerpt && (
            <div
              style={{
                fontSize: 30,
                color: "#3d3530",
                lineHeight: 1.4,
                opacity: 0.85,
                maxWidth: "1000px",
              }}
            >
              {excerpt + (row?.content && row.content.length > 220 ? "…" : "")}
            </div>
          )}
        </div>
        <div style={{ fontSize: 24, color: "#7a6a55" }}>zenlineage.org</div>
      </div>
    ),
    { ...size }
  );
}
