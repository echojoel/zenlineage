import { ImageResponse } from "next/og";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { schoolNames, schools } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const alt = "Zen school — Zen Lineage";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Per-school palette mirrors the visible site (globals.css). Falls
// back to moss for unmapped schools.
const SCHOOL_ACCENT: Record<string, string> = {
  rinzai: "#5a7a5a",
  linji: "#5a7a5a",
  caodong: "#8b6b4a",
  soto: "#8b6b4a",
  obaku: "#7a8b6a",
  yunmen: "#a07040",
  fayan: "#6a7a8b",
  huayan: "#7a6a8b",
  guiyang: "#8b7a5a",
};

export async function generateStaticParams() {
  const all = await db.select({ slug: schools.slug }).from(schools);
  return all.map((s) => ({ slug: s.slug }));
}

export default async function SchoolOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const schoolRows = await db
    .select({ id: schools.id, tradition: schools.tradition })
    .from(schools)
    .where(eq(schools.slug, slug))
    .limit(1);
  const school = schoolRows[0];

  let primaryName = slug;
  let nativeName: string | null = null;

  if (school) {
    const nameRows = await db
      .select({ value: schoolNames.value, locale: schoolNames.locale })
      .from(schoolNames)
      .where(eq(schoolNames.schoolId, school.id));
    primaryName = nameRows.find((n) => n.locale === "en")?.value ?? slug;
    nativeName = nameRows.find((n) => n.locale !== "en")?.value ?? null;
  }

  const accent = SCHOOL_ACCENT[slug] ?? "#5a7a5a";

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
          background: "#faf9f7",
          color: "#3d3530",
          fontFamily: "Georgia, serif",
          borderLeft: `24px solid ${accent}`,
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
          Zen Lineage · School
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 110, lineHeight: 1.05, color: accent }}>
            {primaryName}
          </div>
          {nativeName && (
            <div style={{ fontSize: 56, color: "#3d3530", opacity: 0.7 }}>
              {nativeName}
            </div>
          )}
          {school?.tradition && (
            <div style={{ fontSize: 30, color: "#7a6a55", fontStyle: "italic" }}>
              {school.tradition}
            </div>
          )}
        </div>
        <div style={{ fontSize: 24, color: "#7a6a55" }}>zenlineage.org</div>
      </div>
    ),
    { ...size }
  );
}
