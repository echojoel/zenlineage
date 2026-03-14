export interface DateFormatOptions {
  unknown?: string | null;
}

export interface LifeRangeInput {
  birthYear: number | null;
  birthPrecision: string | null;
  deathYear: number | null;
  deathPrecision: string | null;
}

export function formatDateWithPrecision(
  year: number | null,
  precision: string | null,
  options: DateFormatOptions = {},
): string | null {
  const unknown = options.unknown === undefined ? "Unknown" : options.unknown;
  if (!year) return unknown;
  if (precision === "circa") return `c. ${year}`;
  if (precision === "century") return `${Math.ceil(year / 100)}th c.`;
  return String(year);
}

export function formatLifeRange(
  input: LifeRangeInput,
  options: DateFormatOptions = {},
): string {
  const unknown = options.unknown === undefined ? "Unknown" : options.unknown;
  const birth = formatDateWithPrecision(input.birthYear, input.birthPrecision, {
    unknown,
  });
  const death = formatDateWithPrecision(input.deathYear, input.deathPrecision, {
    unknown,
  });

  if (birth === unknown && death === unknown) {
    return "Dates uncertain";
  }

  return `${birth} – ${death}`;
}
