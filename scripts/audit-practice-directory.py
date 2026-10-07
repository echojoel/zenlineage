#!/usr/bin/env python3
"""Export a read-only, deterministic queue for practice-directory review.

Usage: python3 scripts/audit-practice-directory.py > /tmp/practice-review.csv
The queue identifies missing evidence; it makes no judgment about a group.
"""

import csv
import sqlite3
import sys
from pathlib import Path


DATABASE = Path(__file__).resolve().parents[1] / "zen.db"


def main() -> None:
    if not DATABASE.exists():
        raise SystemExit(f"Missing {DATABASE}; run the seed pipeline first")

    connection = sqlite3.connect(f"file:{DATABASE}?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    rows = connection.execute(
        """
        SELECT t.slug,
               COALESCE(n.value, t.slug) AS name,
               t.country, t.region, t.status, t.url, t.geo_precision,
               COUNT(c.id) AS citation_count,
               GROUP_CONCAT(DISTINCT c.field_name) AS cited_fields,
               GROUP_CONCAT(DISTINCT s.reliability) AS source_classes,
               GROUP_CONCAT(DISTINCT s.url) AS source_urls
        FROM temples t
        LEFT JOIN temple_names n ON n.temple_id = t.id AND n.locale = 'en'
        LEFT JOIN citations c ON c.entity_type = 'temple' AND c.entity_id = t.id
        LEFT JOIN sources s ON s.id = c.source_id
        GROUP BY t.id
        """
    ).fetchall()
    connection.close()

    queue = []
    counts = {"check_first": 0, "routine": 0}
    for row in rows:
        reasons = []
        if not row["url"]:
            reasons.append("no_place_website")
        if row["citation_count"] == 0:
            reasons.append("no_citation")
        elif row["source_classes"] == "popular":
            reasons.append("popular_source_only")
        priority = (
            "check_first"
            if any(reason in reasons for reason in (
                "no_place_website", "no_citation", "popular_source_only"
            ))
            else "routine"
        )
        counts[priority] += 1
        queue.append({
            "priority": priority,
            "slug": row["slug"],
            "name": row["name"],
            "country": row["country"],
            "region": row["region"],
            "status": row["status"],
            "place_url": row["url"],
            "source_urls": row["source_urls"],
            "source_classes": row["source_classes"],
            "cited_fields": row["cited_fields"],
            "review_reasons": ";".join(reasons),
        })

    queue.sort(key=lambda item: (item["priority"] != "check_first", item["country"] or "", item["name"]))
    writer = csv.DictWriter(sys.stdout, fieldnames=list(queue[0]) if queue else ["priority", "slug"])
    writer.writeheader()
    writer.writerows(queue)
    print(f"{len(queue)} listings: {counts['check_first']} to check first, {counts['routine']} routine", file=sys.stderr)
    print("Priority signals are evidence gaps, not adverse findings about organizations.", file=sys.stderr)


if __name__ == "__main__":
    main()
