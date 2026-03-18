#!/bin/bash
# Export zen.db to a SQL file compatible with Cloudflare D1.
# Usage: ./scripts/export-d1.sh
#
# Then import with: wrangler d1 execute zenlineage-db --remote --file=d1-export.sql

set -e

DB_FILE="zen.db"
OUTPUT="d1-export.sql"

if [ ! -f "$DB_FILE" ]; then
  echo "Error: $DB_FILE not found. Run 'npm run seed' first."
  exit 1
fi

echo "Exporting $DB_FILE to $OUTPUT..."
sqlite3 "$DB_FILE" .dump > "$OUTPUT"

# D1 doesn't support some SQLite pragmas — strip them
sed -i '' '/^PRAGMA/d' "$OUTPUT" 2>/dev/null || sed -i '/^PRAGMA/d' "$OUTPUT"

echo "Done. $(wc -l < "$OUTPUT" | tr -d ' ') lines exported."
echo ""
echo "To import into D1:"
echo "  wrangler d1 execute zenlineage-db --remote --file=$OUTPUT"
