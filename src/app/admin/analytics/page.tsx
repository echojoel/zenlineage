import { headers } from "next/headers";
import { notFound } from "next/navigation";

interface AERow {
  page?: string;
  unique_visitors: number;
}

async function queryAE(sql: string): Promise<AERow[]> {
  const accountId = process.env.CF_ACCOUNT_ID;
  const token = process.env.CF_AE_TOKEN;
  const dataset = "page_views";

  if (!accountId || !token) return [];

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: sql,
      next: { revalidate: 300 }, // cache 5 min
    }
  );

  if (!res.ok) return [];
  const json = await res.json();
  return (json.data ?? []) as AERow[];
}

export default async function AnalyticsPage() {
  // Require a secret header so this page isn't publicly browsable
  const headersList = await headers();
  const secret = headersList.get("x-analytics-secret");
  if (secret !== process.env.ANALYTICS_SECRET) notFound();

  const [totalRows, pageRows] = await Promise.all([
    queryAE(`
      SELECT COUNT(DISTINCT index1) AS unique_visitors
      FROM page_views
      WHERE timestamp >= NOW() - INTERVAL '30' DAY
    `),
    queryAE(`
      SELECT blob1 AS page, COUNT(DISTINCT index1) AS unique_visitors
      FROM page_views
      WHERE timestamp >= NOW() - INTERVAL '30' DAY
      GROUP BY page
      ORDER BY unique_visitors DESC
      LIMIT 20
    `),
  ]);

  const total = totalRows[0]?.unique_visitors ?? 0;

  return (
    <main style={{ fontFamily: "monospace", padding: "2rem", maxWidth: 700 }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Analytics — last 30 days</h1>

      <section style={{ marginBottom: "2rem" }}>
        <strong>Unique visitors:</strong> {total.toLocaleString()}
      </section>

      <section>
        <h2 style={{ marginBottom: "1rem" }}>Top pages</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", paddingBottom: "0.5rem" }}>Page</th>
              <th style={{ textAlign: "right", paddingBottom: "0.5rem" }}>Uniques</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr key={i} style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: "0.4rem 0" }}>{row.page}</td>
                <td style={{ textAlign: "right" }}>
                  {Number(row.unique_visitors).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
