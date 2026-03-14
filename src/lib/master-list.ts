export interface MasterListItem {
  id: string;
  slug: string;
  primaryName: string;
  schoolId: string | null;
  birthYear: number | null;
  birthPrecision: string | null;
  deathYear: number | null;
  deathPrecision: string | null;
  searchText: string;
  imagePath: string | null;
}
