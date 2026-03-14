/**
 * Check Phase 1 exit criteria against the populated database.
 */

import { db } from '@/db';
import { masters, citations, searchTokens } from '@/db/schema';

async function main() {
  const allMasters = await db.select({ id: masters.id }).from(masters);
  const allCitations = await db.select({ entityId: citations.entityId, sourceId: citations.sourceId }).from(citations);
  const allTokens = await db.select({ entityId: searchTokens.entityId }).from(searchTokens);

  const citedIds = new Set(allCitations.map(c => c.entityId));
  const uncited = allMasters.filter(m => !citedIds.has(m.id));
  const tokenIds = new Set(allTokens.map(t => t.entityId));
  const noTokens = allMasters.filter(m => !tokenIds.has(m.id));
  const sourceIds = new Set(allCitations.map(c => c.sourceId));

  console.log('=== Phase 1 Exit Criteria ===\n');
  console.log(`Total masters:                   ${allMasters.length}`);
  console.log(`Masters with ≥1 citation:        ${allMasters.length - uncited.length} / ${allMasters.length}  ${uncited.length === 0 ? '✅' : '⚠️  ' + uncited.length + ' uncited'}`);
  console.log(`Sources with data:               ${sourceIds.size} / 6  ${sourceIds.size >= 4 ? '✅' : '❌'}`);
  console.log(`Source IDs:                      ${[...sourceIds].join(', ')}`);
  console.log(`Masters with search tokens:      ${allMasters.length - noTokens.length} / ${allMasters.length}  ${noTokens.length === 0 ? '✅' : '⚠️  ' + noTokens.length + ' without tokens'}`);
  console.log(`Total citations:                 ${allCitations.length}`);
  console.log(`Total search tokens:             ${allTokens.length}`);
}

main().catch(err => { console.error(err); process.exit(1); });
