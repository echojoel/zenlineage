#!/usr/bin/env tsx
// ---------------------------------------------------------------------------
// CLI runner — validates the Zen lineage DAG stored in the database.
// Exit 0 if valid (warnings allowed), exit 1 if any errors.
// ---------------------------------------------------------------------------

import { db } from "@/db";
import { masters, masterTransmissions } from "@/db/schema";
import { validateDAG, type TransmissionEdge, type MasterDates } from "@/lib/dag-validation";

async function main() {
  console.log("Loading masters and transmissions from database...\n");

  const allMasters = await db.select().from(masters);
  const allTransmissions = await db.select().from(masterTransmissions);
  const masterSlugById = new Map(allMasters.map((master) => [master.id, master.slug]));

  const masterIds = allMasters.map((m) => m.id);

  const edges: TransmissionEdge[] = allTransmissions.map((t) => ({
    id: t.id,
    studentId: t.studentId,
    teacherId: t.teacherId,
    type: t.type as TransmissionEdge["type"],
    isPrimary: t.isPrimary ?? false,
  }));

  const masterDates: MasterDates[] = allMasters.map((m) => ({
    id: m.id,
    birthYear: m.birthYear,
    birthPrecision: m.birthPrecision,
    birthConfidence: m.birthConfidence,
    deathYear: m.deathYear,
    deathPrecision: m.deathPrecision,
    deathConfidence: m.deathConfidence,
  }));

  console.log(`  Masters:       ${masterIds.length}`);
  console.log(`  Transmissions: ${edges.length}\n`);

  const result = validateDAG(edges, masterDates, masterIds);
  const formatEntityIds = (entityIds: string[]) =>
    entityIds.map((entityId) => masterSlugById.get(entityId) ?? entityId).join(", ");
  const formatMessage = (message: string, entityIds: string[]) => {
    if (entityIds.length !== 1) {
      return message;
    }

    const entityId = entityIds[0];
    const slug = masterSlugById.get(entityId);
    if (!slug) {
      return message;
    }

    return message.replace(entityId, slug);
  };

  if (result.errors.length > 0) {
    console.log(`ERRORS (${result.errors.length}):`);
    for (const err of result.errors) {
      console.log(`  [${err.type}] ${formatMessage(err.message, err.entityIds)}`);
      console.log(`    Entities: ${formatEntityIds(err.entityIds)}`);
    }
    console.log();
  }

  if (result.warnings.length > 0) {
    console.log(`WARNINGS (${result.warnings.length}):`);
    for (const warn of result.warnings) {
      console.log(`  [${warn.type}] ${formatMessage(warn.message, warn.entityIds)}`);
      console.log(`    Entities: ${formatEntityIds(warn.entityIds)}`);
    }
    console.log();
  }

  if (result.valid) {
    console.log("Validation PASSED (no errors).");
    process.exit(0);
  } else {
    console.log("Validation FAILED.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unexpected error during validation:", err);
  process.exit(1);
});
