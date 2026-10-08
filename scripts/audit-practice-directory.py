#!/usr/bin/env python3
"""Export a read-only, deterministic queue for practice-directory review.

Usage: python3 scripts/audit-practice-directory.py > /tmp/practice-review.csv
The queue identifies missing evidence; it makes no judgment about a group.
"""

import argparse
import csv
import sqlite3
import sys
from pathlib import Path


DATABASE = Path(__file__).resolve().parents[1] / "zen.db"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--links", type=Path, help="CSV from check-practice-links.py")
    args = parser.parse_args()
    if not DATABASE.exists():
        raise SystemExit(f"Missing {DATABASE}; run the seed pipeline first")

    link_results = {}
    if args.links:
        with args.links.open(newline="") as stream:
            link_results = {row["url"]: row for row in csv.DictReader(stream)}

    connection = sqlite3.connect(f"file:{DATABASE}?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    rows = connection.execute(
        """
        SELECT t.slug,
               COALESCE((
                   SELECT n.value
                   FROM temple_names n
                   WHERE n.temple_id = t.id AND n.locale = 'en'
                   ORDER BY n.value, n.id
                   LIMIT 1
               ), t.slug) AS name,
               t.country, t.region, t.status, t.url, t.geo_precision,
               COUNT(c.id) AS citation_count,
               GROUP_CONCAT(DISTINCT c.field_name) AS cited_fields,
               GROUP_CONCAT(DISTINCT s.reliability) AS source_classes,
               GROUP_CONCAT(DISTINCT c.source_id) AS source_ids,
               GROUP_CONCAT(DISTINCT s.url) AS source_urls
        FROM temples t
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
            reasons.append("no_preferred_url")
        if row["citation_count"] == 0:
            reasons.append("no_citation")
        elif row["source_classes"] == "popular":
            reasons.append("popular_source_only")
        # These shared pages cover only a subset of the groups assigned to
        # them. Queue an item-level source check; do not judge the group.
        if row["source_ids"] in ("src_plumvillage_monastic", "src_whiteplum"):
            reasons.append("broad_source_requires_item_check")
        link = link_results.get(row["url"]) if row["url"] else None
        if link and link["category"] == "missing":
            reasons.append("listed_url_returns_404_or_410")
        priority = (
            "check_first"
            if any(reason in reasons for reason in (
                "no_preferred_url", "no_citation", "popular_source_only", "listed_url_returns_404_or_410",
                "broad_source_requires_item_check",
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
            "link_result": link["category"] if link else "not_checked",
            "source_urls": row["source_urls"],
            "source_classes": row["source_classes"],
            "source_ids": row["source_ids"],
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
