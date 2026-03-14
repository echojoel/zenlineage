interface RawTeacherRefLike {
  name: string;
}

export interface RawMasterLike {
  name: string;
  names_cjk: string;
  dates: string;
  teachers: RawTeacherRefLike[];
  school: string;
  source_id: string;
  ingestion_run_id: string;
  names_alt?: string[];
}

interface MasterNormalization {
  name?: string;
  aliases?: string[];
}

const DISCARDABLE_EXACT_NAMES = new Set(["Ch", "Ch'", "Hs", "L", "WG = Pinyin"]);

const MASTER_NORMALIZATIONS = new Map<string, MasterNormalization>([
  [
    "Mahasattva Fu (Not shown)",
    {
      name: "Mahasattva Fu",
    },
  ],
  [
    "Pangyun (Layman Pang) P'ang Yün",
    {
      name: "Pang Yun",
      aliases: ["Layman Pang", "P'ang Yün"],
    },
  ],
  [
    "Taigu Puyu",
    {
      aliases: ["Taigo Pou"],
    },
  ],
]);

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function cleanAliasValue(alias: string): string | null {
  let cleaned = normalizeWhitespace(alias);
  if (!cleaned) return null;

  cleaned = cleaned.replace(/^\((?:Korean)\)\s*/i, "");
  cleaned = cleaned.replace(/\b[A-Q]\d+\b(?:\s+\d+)?$/i, "").trim();

  if (!cleaned) return null;
  if (/^WG\s*=\s*Pinyin$/i.test(cleaned)) return null;
  if (!/[A-Za-z\u00C0-\u024F\u4E00-\u9FFF]/.test(cleaned)) return null;
  if (cleaned.length <= 1) return null;

  return cleaned;
}

function shouldDiscardRawMaster(master: RawMasterLike): boolean {
  if (!DISCARDABLE_EXACT_NAMES.has(master.name)) {
    return false;
  }

  return (
    !master.school &&
    !master.dates &&
    !master.names_cjk &&
    (!master.teachers || master.teachers.length === 0)
  );
}

export function sanitizeRawMaster<T extends RawMasterLike>(master: T): T | null {
  if (shouldDiscardRawMaster(master)) {
    return null;
  }

  const normalization = MASTER_NORMALIZATIONS.get(master.name);
  const nextName = normalization?.name ?? master.name;
  const mergedAliases = [...(master.names_alt ?? []), ...(normalization?.aliases ?? [])];

  const seenAliases = new Set<string>();
  const cleanedAliases: string[] = [];
  for (const alias of mergedAliases) {
    const cleaned = cleanAliasValue(alias);
    if (!cleaned) continue;
    if (cleaned === nextName) continue;
    if (seenAliases.has(cleaned)) continue;
    seenAliases.add(cleaned);
    cleanedAliases.push(cleaned);
  }

  return {
    ...master,
    name: nextName,
    names_alt: cleanedAliases.length > 0 ? cleanedAliases : undefined,
  };
}

export function sanitizeRawMasters<T extends RawMasterLike>(masters: T[]): T[] {
  const cleaned: T[] = [];

  for (const master of masters) {
    const sanitized = sanitizeRawMaster(master);
    if (sanitized) {
      cleaned.push(sanitized);
    }
  }

  return cleaned;
}
