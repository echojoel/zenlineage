import crypto from "crypto";
import path from "path";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { ingestionRuns, sourceSnapshots } from "@/db/schema";

export interface IngestionRunContext {
  id: string;
  sourceId: string;
  scriptName: string;
  runDate: string;
}

export interface FinishIngestionRunOptions {
  status?: "success" | "partial";
  recordCount?: number;
  notes?: string | null;
  snapshotHash?: string | null;
  snapshotArchiveRef?: string | null;
  snapshotDate?: string;
}

function toBuffer(content: string | Buffer | Uint8Array): Buffer {
  if (typeof content === "string") {
    return Buffer.from(content, "utf-8");
  }
  return Buffer.from(content);
}

export function fingerprintContent(content: string | Buffer | Uint8Array): string {
  return crypto.createHash("sha256").update(toBuffer(content)).digest("hex");
}

export function snapshotIdForRun(runId: string): string {
  return `snapshot_${runId}`;
}

export function toArchiveRef(filepath: string): string {
  return path.relative(process.cwd(), path.resolve(filepath));
}

export async function startIngestionRun(input: {
  sourceId: string;
  scriptName: string;
  runId?: string;
  runDate?: string;
}): Promise<IngestionRunContext> {
  const context: IngestionRunContext = {
    id: input.runId ?? `run_${nanoid()}`,
    sourceId: input.sourceId,
    scriptName: input.scriptName,
    runDate: input.runDate ?? new Date().toISOString(),
  };

  await db
    .insert(ingestionRuns)
    .values({
      id: context.id,
      sourceId: context.sourceId,
      runDate: context.runDate,
      scriptName: context.scriptName,
      status: "running",
      recordCount: 0,
      notes: null,
    })
    .onConflictDoUpdate({
      target: ingestionRuns.id,
      set: {
        sourceId: context.sourceId,
        runDate: context.runDate,
        scriptName: context.scriptName,
        status: "running",
        recordCount: 0,
        notes: null,
      },
    });

  return context;
}

export async function finishIngestionRun(
  context: IngestionRunContext,
  options: FinishIngestionRunOptions = {}
): Promise<void> {
  const status = options.status ?? "success";
  const recordCount = options.recordCount ?? 0;
  const snapshotDate = options.snapshotDate ?? new Date().toISOString();

  await db
    .insert(ingestionRuns)
    .values({
      id: context.id,
      sourceId: context.sourceId,
      runDate: context.runDate,
      scriptName: context.scriptName,
      status,
      recordCount,
      notes: options.notes ?? null,
    })
    .onConflictDoUpdate({
      target: ingestionRuns.id,
      set: {
        sourceId: context.sourceId,
        runDate: context.runDate,
        scriptName: context.scriptName,
        status,
        recordCount,
        notes: options.notes ?? null,
      },
    });

  if (!options.snapshotHash && !options.snapshotArchiveRef) {
    return;
  }

  await db
    .insert(sourceSnapshots)
    .values({
      id: snapshotIdForRun(context.id),
      sourceId: context.sourceId,
      ingestionRunId: context.id,
      snapshotDate,
      contentHash: options.snapshotHash ?? null,
      archiveUrl: options.snapshotArchiveRef ?? null,
    })
    .onConflictDoUpdate({
      target: sourceSnapshots.id,
      set: {
        sourceId: context.sourceId,
        ingestionRunId: context.id,
        snapshotDate,
        contentHash: options.snapshotHash ?? null,
        archiveUrl: options.snapshotArchiveRef ?? null,
      },
    });
}

export async function failIngestionRun(
  context: IngestionRunContext,
  error: unknown
): Promise<void> {
  const message =
    error instanceof Error
      ? (error.stack ?? error.message)
      : typeof error === "string"
        ? error
        : JSON.stringify(error);

  await db
    .insert(ingestionRuns)
    .values({
      id: context.id,
      sourceId: context.sourceId,
      runDate: context.runDate,
      scriptName: context.scriptName,
      status: "failed",
      recordCount: 0,
      notes: message.slice(0, 2000),
    })
    .onConflictDoUpdate({
      target: ingestionRuns.id,
      set: {
        sourceId: context.sourceId,
        runDate: context.runDate,
        scriptName: context.scriptName,
        status: "failed",
        recordCount: 0,
        notes: message.slice(0, 2000),
      },
    });
}
