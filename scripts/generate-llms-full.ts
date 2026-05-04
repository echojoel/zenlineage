/**
 * Generate llms-full.txt — a single Markdown document concatenating all
 * master biographies, school descriptions, and teachings for AI consumption.
 *
 * Follows the llms.txt specification: https://llmstxt.org/
 * Output: public/llms-full.txt
 *
 * Usage: npx tsx scripts/generate-llms-full.ts
 */

import fs from "fs";
import path from "path";
import { db } from "@/db";
import {
  citations,
  masters,
  masterBiographies,
  masterNames,
  masterTransmissions,
  schools,
  schoolNames,
  teachings,
  teachingContent,
  teachingMasterRoles,
} from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import {
  buildCitationKeySet,
  isPublishedBiography,
  isPublishedTeaching,
} from "@/lib/publishable-content";
import { formatLifeRange } from "@/lib/date-format";
import { getSchoolDefinitions } from "@/lib/school-taxonomy";

const OUT_PATH = path.join(process.cwd(), "public", "llms-full.txt");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** First N characters of bio, trimmed to a sentence boundary. */
function excerptBio(content: string, maxChars = 800): string {
  if (content.length <= maxChars) return content.trim();
  // Try to cut at a sentence ending before the limit
  const cut = content.slice(0, maxChars);
  const lastPeriod = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(".\n"));
  return lastPeriod > 200 ? content.slice(0, lastPeriod + 1).trim() : cut.trimEnd() + "…";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Generating llms-full.txt...");

  // -------------------------------------------------------------------------
  // 1. Fetch all data in parallel
  // -------------------------------------------------------------------------

  const [
    mastersData,
    namesData,
    transmissionsData,
    schoolsData,
    schoolNamesData,
    bioRows,
    teachingsData,
    teachingContentData,
    teachingRolesData,
  ] = await Promise.all([
    db
      .select({
        id: masters.id,
        slug: masters.slug,
        schoolId: masters.schoolId,
        birthYear: masters.birthYear,
        birthPrecision: masters.birthPrecision,
        deathYear: masters.deathYear,
        deathPrecision: masters.deathPrecision,
      })
      .from(masters),
    db
      .select({ masterId: masterNames.masterId, value: masterNames.value, nameType: masterNames.nameType })
      .from(masterNames)
      .where(eq(masterNames.locale, "en")),
    db
      .select({ studentId: masterTransmissions.studentId, teacherId: masterTransmissions.teacherId, isPrimary: masterTransmissions.isPrimary })
      .from(masterTransmissions),
    db.select({ id: schools.id, slug: schools.slug }).from(schools),
    db
      .select({ schoolId: schoolNames.schoolId, value: schoolNames.value })
      .from(schoolNames)
      .where(eq(schoolNames.locale, "en")),
    db
      .select({ id: masterBiographies.id, masterId: masterBiographies.masterId, content: masterBiographies.content })
      .from(masterBiographies)
      .where(eq(masterBiographies.locale, "en")),
    db
      .select({ id: teachings.id, slug: teachings.slug, type: teachings.type, authorId: teachings.authorId })
      .from(teachings),
    db
      .select({ teachingId: teachingContent.teachingId, title: teachingContent.title, content: teachingContent.content })
      .from(teachingContent)
      .where(eq(teachingContent.locale, "en")),
    db
      .select({ teachingId: teachingMasterRoles.teachingId, masterId: teachingMasterRoles.masterId, role: teachingMasterRoles.role })
      .from(teachingMasterRoles),
  ]);

  // Fetch citations for bio publishability checks
  const bioCitationRows =
    bioRows.length > 0
      ? await db
          .select({ entityType: citations.entityType, entityId: citations.entityId })
          .from(citations)
          .where(and(eq(citations.entityType, "master_biography"), inArray(citations.entityId, bioRows.map((r) => r.id))))
      : [];

  // Fetch citations for teaching publishability checks
  const teachingCitationRows =
    teachingsData.length > 0
      ? await db
          .select({ entityType: citations.entityType, entityId: citations.entityId })
          .from(citations)
          .where(and(eq(citations.entityType, "teaching"), inArray(citations.entityId, teachingsData.map((t) => t.id))))
      : [];

  // -------------------------------------------------------------------------
  // 2. Build lookup maps
  // -------------------------------------------------------------------------

  const allCitationKeys = buildCitationKeySet([...bioCitationRows, ...teachingCitationRows]);

  // Master primary name (dharma > any)
  const primaryNameMap = new Map<string, string>();
  const allNamesMap = new Map<string, string[]>();
  for (const n of namesData) {
    const existing = allNamesMap.get(n.masterId) ?? [];
    existing.push(n.value);
    allNamesMap.set(n.masterId, existing);
    if (n.nameType === "dharma" && !primaryNameMap.has(n.masterId)) {
      primaryNameMap.set(n.masterId, n.value);
    }
  }
  for (const n of namesData) {
    if (!primaryNameMap.has(n.masterId)) primaryNameMap.set(n.masterId, n.value);
  }

  // Slug map: masterId -> slug
  const slugMap = new Map(mastersData.map((m) => [m.id, m.slug]));

  // School name map
  const schoolNameMap = new Map(schoolNamesData.map((s) => [s.schoolId, s.value]));
  const schoolSlugMap = new Map(schoolsData.map((s) => [s.id, s.slug]));

  // Published biographies
  const bioMap = new Map(
    bioRows
      .filter((r) => isPublishedBiography(r.id, allCitationKeys))
      .map((r) => [r.masterId, r.content])
  );

  // Teacher map: masterId -> [{slug, name}]
  const teacherMap = new Map<string, Array<{ slug: string; name: string }>>();
  const studentMap = new Map<string, Array<{ slug: string; name: string }>>();
  for (const t of transmissionsData) {
    const teacherSlug = slugMap.get(t.teacherId);
    const studentSlug = slugMap.get(t.studentId);
    if (!teacherSlug || !studentSlug) continue;

    // Add teacher to student's teacher list
    const studentTeachers = teacherMap.get(t.studentId) ?? [];
    if (!studentTeachers.some((x) => x.slug === teacherSlug)) {
      studentTeachers.push({ slug: teacherSlug, name: primaryNameMap.get(t.teacherId) ?? teacherSlug });
      teacherMap.set(t.studentId, studentTeachers);
    }

    // Add student to teacher's student list
    const teacherStudents = studentMap.get(t.teacherId) ?? [];
    if (!teacherStudents.some((x) => x.slug === studentSlug)) {
      teacherStudents.push({ slug: studentSlug, name: primaryNameMap.get(t.studentId) ?? studentSlug });
      studentMap.set(t.teacherId, teacherStudents);
    }
  }

  // Teaching content map
  const teachingContentMap = new Map(teachingContentData.map((tc) => [tc.teachingId, tc]));

  // Teaching roles map: teachingId -> master names (attributed_to / speaker)
  const teachingAuthorMap = new Map<string, string>();
  for (const role of teachingRolesData) {
    if (role.role === "attributed_to" || role.role === "speaker") {
      if (!teachingAuthorMap.has(role.teachingId)) {
        teachingAuthorMap.set(role.teachingId, primaryNameMap.get(role.masterId) ?? role.masterId);
      }
    }
  }

  // School definitions (for summaries)
  const schoolDefinitions = getSchoolDefinitions();
  const schoolDefMap = new Map(schoolDefinitions.map((d) => [d.slug, d]));

  // -------------------------------------------------------------------------
  // 3. Sort masters chronologically (earliest birth year first, nulls last)
  // -------------------------------------------------------------------------

  const sortedMasters = [...mastersData].sort((a, b) => {
    const ay = a.birthYear ?? a.deathYear ?? Infinity;
    const by = b.birthYear ?? b.deathYear ?? Infinity;
    return ay - by;
  });

  // -------------------------------------------------------------------------
  // 4. Build Markdown document
  // -------------------------------------------------------------------------

  const lines: string[] = [];

  // Round-down hundreds for "X+" labels so the count rolls forward as the
  // dataset grows, but the published number stays a stable lower bound.
  const masterFloor = Math.floor(mastersData.length / 5) * 5;
  const transmissionFloor = Math.floor(transmissionsData.length / 10) * 10;
  const teachingFloor = Math.floor(teachingsData.length / 5) * 5;

  lines.push("# Zen Lineage — Complete Reference");
  lines.push("");
  lines.push(`> An open-source interactive encyclopedia of Zen Buddhism covering ${masterFloor}+ masters,`);
  lines.push(
    `> ${schoolsData.length} schools, ${transmissionFloor}+ lineage transmissions, ${teachingFloor}+ teachings, and 1,700+ scholarly`
  );
  lines.push("> citations across 2,500 years of Chan, Zen, Seon, and Thien Buddhist history.");
  lines.push("");
  lines.push("Zen Lineage maps the dharma transmission lineages connecting Buddhist masters");
  lines.push("from Shakyamuni Buddha through Bodhidharma to modern teachers. All content");
  lines.push("requires item-level citations from scholarly sources before publication.");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString().slice(0, 10)}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // -------------------------------------------------------------------------
  // 4a. Masters
  // -------------------------------------------------------------------------

  lines.push("## Masters");
  lines.push("");

  for (const m of sortedMasters) {
    const name = primaryNameMap.get(m.id) ?? m.slug;
    const altNames = (allNamesMap.get(m.id) ?? []).filter((n) => n !== name);
    const lifeRange = formatLifeRange(m, { unknown: null });
    const schoolSlug = m.schoolId ? schoolSlugMap.get(m.schoolId) : null;
    const schoolName = m.schoolId ? schoolNameMap.get(m.schoolId) : null;
    const teachers = teacherMap.get(m.id) ?? [];
    const students = studentMap.get(m.id) ?? [];
    const bio = bioMap.get(m.id);

    lines.push(`### ${name}`);
    lines.push("");

    if (altNames.length > 0) {
      lines.push(`- **Also known as:** ${altNames.join(", ")}`);
    }
    if (lifeRange) {
      lines.push(`- **Dates:** ${lifeRange}`);
    }
    if (schoolName) {
      lines.push(`- **School:** ${schoolName}`);
    }
    if (teachers.length > 0) {
      lines.push(`- **Teachers:** ${teachers.map((t) => t.name).join(", ")}`);
    }
    if (students.length > 0) {
      lines.push(`- **Students:** ${students.map((s) => s.name).join(", ")}`);
    }
    if (bio) {
      lines.push("");
      lines.push(excerptBio(bio));
    }
    lines.push("");
  }

  // -------------------------------------------------------------------------
  // 4b. Schools
  // -------------------------------------------------------------------------

  lines.push("---");
  lines.push("");
  lines.push("## Schools");
  lines.push("");

  // Count masters per school
  const masterCountBySchoolId = new Map<string, number>();
  for (const m of mastersData) {
    if (m.schoolId) {
      masterCountBySchoolId.set(m.schoolId, (masterCountBySchoolId.get(m.schoolId) ?? 0) + 1);
    }
  }

  for (const school of schoolsData) {
    const name = schoolNameMap.get(school.id) ?? school.slug;
    const def = schoolDefMap.get(school.slug);
    const count = masterCountBySchoolId.get(school.id) ?? 0;

    lines.push(`### ${name}`);
    lines.push("");
    if (def?.tradition) {
      lines.push(`- **Tradition:** ${def.tradition}`);
    }
    lines.push(`- **Masters:** ${count}`);
    if (def?.summary) {
      lines.push("");
      lines.push(def.summary);
    }
    lines.push("");
  }

  // -------------------------------------------------------------------------
  // 4c. Teachings & Proverbs
  // -------------------------------------------------------------------------

  const publishedTeachings = teachingsData.filter((t) => isPublishedTeaching(t, allCitationKeys));

  if (publishedTeachings.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## Teachings & Proverbs");
    lines.push("");

    for (const teaching of publishedTeachings) {
      const content = teachingContentMap.get(teaching.id);
      if (!content) continue;

      const title = content.title;
      const authorName =
        teachingAuthorMap.get(teaching.id) ??
        (teaching.authorId ? (primaryNameMap.get(teaching.authorId) ?? null) : null);

      lines.push(`### ${title}`);
      lines.push("");
      if (authorName) {
        lines.push(`- **Attribution:** ${authorName}`);
      }
      if (teaching.type) {
        lines.push(`- **Type:** ${teaching.type}`);
      }
      lines.push("");
      lines.push(excerptBio(content.content, 600));
      lines.push("");
    }
  }

  // -------------------------------------------------------------------------
  // 5. Write file
  // -------------------------------------------------------------------------

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, lines.join("\n"), "utf-8");

  const stats = fs.statSync(OUT_PATH);
  const sizeKB = Math.round(stats.size / 1024);
  console.log(
    `  -> ${sortedMasters.length} masters, ${schoolsData.length} schools, ${publishedTeachings.length} teachings — ${sizeKB} KB`
  );
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("generate-llms-full failed:", err);
  process.exit(1);
});
