#!/usr/bin/env python3
"""Check directory link health without treating HTTP failures as safety findings.

Usage: python3 scripts/check-practice-links.py --output /tmp/practice-links.csv
One worker checks each host at a time to avoid bursts against small sites.
"""

import argparse
import csv
import datetime as dt
import http.client
import sqlite3
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path


DATABASE = Path(__file__).resolve().parents[1] / "zen.db"
USER_AGENT = "ZenLineageLinkCheck/1.0 (+https://zenlineage.org)"


def check_once(url: str, method: str, timeout: float) -> tuple[int | None, str, str]:
    request = urllib.request.Request(url, method=method, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return response.status, response.url, ""
    except urllib.error.HTTPError as error:
        return error.code, error.url, ""
    except (urllib.error.URLError, TimeoutError, ValueError, OSError, http.client.HTTPException) as error:
        return None, "", type(error).__name__


def check(url: str, timeout: float) -> dict[str, str]:
    started = time.monotonic()
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        status, final_url, error = None, "", "invalid_url"
    else:
        status, final_url, error = check_once(url, "HEAD", timeout)
        if status in (403, 404, 405, 501):
            status, final_url, error = check_once(url, "GET", timeout)
    if status is not None and 200 <= status < 400:
        category = "reachable"
    elif status in (404, 410):
        category = "missing"
    elif status in (401, 403, 429):
        category = "blocked_or_limited"
    else:
        category = "inconclusive"
    return {
        "url": url,
        "category": category,
        "http_status": "" if status is None else str(status),
        "final_url": final_url,
        "error_type": error,
        "checked_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "seconds": f"{time.monotonic() - started:.1f}",
    }


def check_host(urls: list[str], timeout: float) -> list[dict[str, str]]:
    return [check(url, timeout) for url in urls]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--limit", type=int, default=0, help="Check only the first N URLs")
    parser.add_argument("--workers", type=int, default=16)
    parser.add_argument("--timeout", type=float, default=6.0)
    args = parser.parse_args()

    with sqlite3.connect(f"file:{DATABASE}?mode=ro", uri=True) as connection:
        urls = sorted({row[0] for row in connection.execute("SELECT url FROM temples WHERE url IS NOT NULL") if row[0]})
    if args.limit:
        urls = urls[:args.limit]
    fields = ["url", "category", "http_status", "final_url", "error_type", "checked_at_utc", "seconds"]
    completed: set[str] = set()
    if args.output.exists():
        with args.output.open(newline="") as stream:
            completed = {row["url"] for row in csv.DictReader(stream)}
    by_host: dict[str, list[str]] = defaultdict(list)
    for url in urls:
        if url in completed:
            continue
        by_host[urllib.parse.urlparse(url).hostname or "invalid"].append(url)

    with args.output.open("a", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=fields)
        if not completed:
            writer.writeheader()
        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            futures = [pool.submit(check_host, host_urls, args.timeout) for host_urls in by_host.values()]
            for index, future in enumerate(as_completed(futures), 1):
                results = future.result()
                writer.writerows(results)
                stream.flush()
                completed.update(row["url"] for row in results)
                if index % 100 == 0:
                    print(f"Checked {len(completed)} of {len(urls)} URLs", file=sys.stderr, flush=True)

    with args.output.open(newline="") as stream:
        results = list(csv.DictReader(stream))
    counts = {category: sum(row["category"] == category for row in results)
              for category in ("reachable", "missing", "blocked_or_limited", "inconclusive")}
    print(f"{len(results)} unique URLs checked: {counts}", file=sys.stderr)


if __name__ == "__main__":
    main()
