// ---------------------------------------------------------------------------
// Shared types for all web scrapers.
// Each scraper extracts master/lineage data from HTML and outputs an array of
// RawMaster records in a standard intermediate JSON format.
// ---------------------------------------------------------------------------

export interface RawTeacherRef {
  name: string;
  edge_type?: 'primary' | 'secondary' | 'disputed';
  locator?: string;
  notes?: string;
}

export interface RawMaster {
  name: string;           // Primary name
  names_cjk: string;      // CJK characters if available
  dates: string;          // Raw date string
  teachers: RawTeacherRef[];
  school: string;
  source_id: string;
  ingestion_run_id: string;
  names_alt?: string[];   // Alternative romanizations
}
