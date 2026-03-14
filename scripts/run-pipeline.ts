import { spawnSync } from "child_process";

interface PipelineStep {
  label: string;
  command: string;
  args: string[];
}

const STEPS: PipelineStep[] = [
  {
    label: "Backfill raw provenance",
    command: "npx",
    args: ["tsx", "scripts/backfill-ingestion-metadata.ts"],
  },
  {
    label: "Reconcile canonical data",
    command: "npx",
    args: ["tsx", "scripts/reconcile.ts"],
  },
  {
    label: "Seed database",
    command: "npx",
    args: ["tsx", "scripts/seed-db.ts"],
  },
  {
    label: "Seed biographies",
    command: "npx",
    args: ["tsx", "scripts/seed-biographies.ts"],
  },
  {
    label: "Run coverage audit",
    command: "npx",
    args: ["tsx", "scripts/check-exit-criteria.ts"],
  },
  {
    label: "Validate lineage graph",
    command: "npx",
    args: ["tsx", "scripts/validate-graph.ts"],
  },
  {
    label: "Build application",
    command: "npx",
    args: ["next", "build"],
  },
  {
    label: "Run tests",
    command: "npm",
    args: ["test"],
  },
];

async function main(): Promise<void> {
  for (const step of STEPS) {
    console.log(`\n=== ${step.label} ===`);
    const result = spawnSync(step.command, step.args, {
      cwd: process.cwd(),
      stdio: "inherit",
    });

    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
  }
}

if (process.argv[1] && process.argv[1].endsWith("run-pipeline.ts")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
