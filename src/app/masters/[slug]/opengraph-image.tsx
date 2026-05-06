import { ImageResponse } from "next/og";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { masterNames, masters, schoolNames, schools } from "@/db/schema";

export const runtime = "nodejs";
export const alt = "Master profile — Zen Lineage";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const all = await db.select({ slug: masters.slug }).from(masters);
  return all.map((m) => ({ slug: m.slug }));
}

export default async function MasterOpenGraphImage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const masterRows = await db
    .select({
      id: masters.id,
      schoolId: masters.schoolId,
      birthYear: masters.birthYear,
      deathYear: masters.deathYear,
    })
    .from(masters)
    .where(eq(masters.slug, slug))
    .limit(1);

  const master = masterRows[0];

  let primaryName = slug;
  let schoolName: string | null = null;

  if (master) {
    const nameRows = await db
      .select({ value: masterNames.value, nameType: masterNames.nameType })
      .from(masterNames)
      .where(and(eq(masterNames.masterId, master.id), eq(masterNames.locale, "en")));
    primaryName = nameRows.find((n) => n.nameType === "dharma")?.value ?? slug;

    if (master.schoolId) {
      const schoolRow = (
        await db
          .select({ value: schoolNames.value })
          .from(schools)
          .leftJoin(
            schoolNames,
            and(eq(schoolNames.schoolId, schools.id), eq(schoolNames.locale, "en"))
          )
          .where(eq(schools.id, master.schoolId))
          .limit(1)
      )[0];
      schoolName = schoolRow?.value ?? null;
    }
  }

  const datesLine =
    master?.birthYear && master?.deathYear
      ? `${master.birthYear} – ${master.deathYear}`
      : master?.deathYear
        ? `d. ${master.deathYear}`
        : "";

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
          Zen Lineage · Master
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 96, lineHeight: 1.05, fontWeight: 400 }}>
            {primaryName}
          </div>
          {datesLine && (
            <div style={{ fontSize: 36, color: "#7a6a55" }}>{datesLine}</div>
          )}
          {schoolName && (
            <div style={{ fontSize: 32, color: "#5a7a5a", fontStyle: "italic" }}>
              {schoolName}
            </div>
          )}
        </div>
        <div style={{ fontSize: 24, color: "#7a6a55" }}>zenlineage.org</div>
      </div>
    ),
    { ...size }
  );
}
