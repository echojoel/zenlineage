import { db } from "@/db";
import { schools, schoolNames, masters } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";

export default async function SchoolsPage() {
  // Fetch schools with English names
  const schoolsData = await db
    .select({
      id: schools.id,
      slug: schools.slug,
      tradition: schools.tradition,
    })
    .from(schools);

  // Fetch English school names
  const namesData = await db
    .select({
      schoolId: schoolNames.schoolId,
      value: schoolNames.value,
    })
    .from(schoolNames)
    .where(eq(schoolNames.locale, "en"));

  const nameMap = new Map(namesData.map((n) => [n.schoolId, n.value]));

  // Count masters per school
  const masterCounts = await db
    .select({
      schoolId: masters.schoolId,
      count: count(),
    })
    .from(masters)
    .groupBy(masters.schoolId);

  const countMap = new Map(
    masterCounts.filter((r) => r.schoolId != null).map((r) => [r.schoolId!, r.count])
  );

  const schoolList = schoolsData
    .map((s) => ({
      ...s,
      name: nameMap.get(s.id) ?? s.slug,
      masterCount: countMap.get(s.id) ?? 0,
    }))
    .sort((a, b) => b.masterCount - a.masterCount);

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      <header className="page-header">
        <Link href="/" className="nav-link">
          禅
        </Link>
        <h1 className="page-title">Schools</h1>
      </header>

      <main className="schools-content">
        <p className="schools-subtitle">
          {schoolList.length} schools across the Chan &amp; Zen tradition
        </p>
        <div className="schools-grid">
          {schoolList.map((school) => (
            <Link key={school.id} href={`/schools/${school.slug}`} className="school-card">
              <div className="school-card-name">{school.name}</div>
              {school.tradition && <div className="school-card-tradition">{school.tradition}</div>}
              <div className="school-card-count">
                {school.masterCount} {school.masterCount === 1 ? "master" : "masters"}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
