/** Optional visitor information, transcribed from a named page rather than inferred. */
export interface SourcedPracticeDetail {
  value: string;
  sourceUrl: string;
  /** Date the source was checked, in YYYY-MM-DD format. */
  checkedOn: string;
}

export const PRACTICE_DETAIL_LABELS = {
  meetingFormat: "Meeting format / online",
  language: "Language",
  schedule: "Schedule",
  cost: "Cost",
  accessibility: "Accessibility",
} as const;

export type PracticeDetails = Partial<
  Record<keyof typeof PRACTICE_DETAIL_LABELS, SourcedPracticeDetail>
>;

/** Keep only populated details with a usable source and a real check date. */
export function sourcedPracticeDetails(value: unknown): PracticeDetails | undefined {
  if (!value || typeof value !== "object") return undefined;
  const details: PracticeDetails = {};
  for (const key of Object.keys(PRACTICE_DETAIL_LABELS) as (keyof PracticeDetails)[]) {
    const detail = (value as Record<string, unknown>)[key];
    if (!detail || typeof detail !== "object") continue;
    const { value: text, sourceUrl, checkedOn } = detail as Record<string, unknown>;
    if (typeof text !== "string" || !text.trim()) continue;
    if (typeof sourceUrl !== "string" || typeof checkedOn !== "string") continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(checkedOn)) continue;
    const date = new Date(checkedOn);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== checkedOn) continue;
    try {
      const url = new URL(sourceUrl);
      if (url.protocol !== "https:" && url.protocol !== "http:") continue;
      details[key] = { value: text.trim(), sourceUrl: url.toString(), checkedOn };
    } catch {
      // Invalid source links are never surfaced as evidence.
    }
  }
  return Object.keys(details).length ? details : undefined;
}
