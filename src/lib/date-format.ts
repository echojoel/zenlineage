export interface DateFormatOptions {
  unknown?: string | null;
}

export interface LifeRangeInput {
  birthYear: number | null;
  birthPrecision: string | null;
  deathYear: number | null;
  deathPrecision: string | null;
}

function centuryOrdinal(n: number): string {
  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  const suffix = lastTwo >= 11 && lastTwo <= 13 ? "th" : (suffixes[lastDigit] ?? "th");
  return `${n}${suffix}`;
}

export function formatDateWithPrecision(
  year: number | null,
  precision: string | null,
  options: DateFormatOptions = {}
): string | null {
  const unknown = options.unknown === undefined ? "Unknown" : options.unknown;
  if (year == null) return unknown;

  const isBCE = year < 0;
  const absYear = Math.abs(year);
  const suffix = isBCE ? " BCE" : "";

  if (precision === "circa") return `c. ${absYear}${suffix}`;
  if (precision === "century") {
    const centuryNum = Math.ceil(absYear / 100);
    return `${centuryOrdinal(centuryNum)} c.${suffix}`;
  }
  return `${absYear}${suffix}`;
}

export function formatLifeRange(input: LifeRangeInput, options: DateFormatOptions = {}): string {
  const unknown = options.unknown === undefined ? "Unknown" : options.unknown;
  const birth = formatDateWithPrecision(input.birthYear, input.birthPrecision, { unknown });
  const death = formatDateWithPrecision(input.deathYear, input.deathPrecision, { unknown });
  if (birth === unknown && death === unknown) {
    return "Dates uncertain";
  }
  return `${birth} – ${death}`;
}
