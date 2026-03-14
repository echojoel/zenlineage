import path from "path";
import { describe, expect, it } from "vitest";
import {
  fingerprintContent,
  snapshotIdForRun,
  toArchiveRef,
} from "../scripts/ingestion-provenance";

describe("ingestion provenance helpers", () => {
  it("produces a stable fingerprint for equivalent content", () => {
    const textHash = fingerprintContent("zen");
    const bufferHash = fingerprintContent(Buffer.from("zen", "utf-8"));

    expect(textHash).toBe(bufferHash);
    expect(textHash).toHaveLength(64);
  });

  it("derives a deterministic snapshot id from the run id", () => {
    expect(snapshotIdForRun("run_123")).toBe("snapshot_run_123");
  });

  it("converts an absolute path to a cwd-relative archive ref", () => {
    const filepath = path.join(process.cwd(), "scripts/data/raw/wikipedia.json");

    expect(toArchiveRef(filepath)).toBe("scripts/data/raw/wikipedia.json");
  });
});
