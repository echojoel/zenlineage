export function looksWadeGiles(value: string): boolean {
  return /[''\u2019]/.test(value) || /\w-\w/.test(value);
}
