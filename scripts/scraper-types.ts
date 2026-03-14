// ---------------------------------------------------------------------------
// Shared types for all web scrapers.
// Each scraper extracts master/lineage data from HTML and outputs an array of
// RawMaster records in a standard intermediate JSON format.
// ---------------------------------------------------------------------------

export interface RawTeacherRef {
  name: string;
  edge_type?: "primary" | "secondary" | "disputed";
  locator?: string;
  notes?: string;
}

export interface RawMaster {
  name: string; // Primary name
  names_cjk: string; // CJK characters if available
  dates: string; // Raw date string
  teachers: RawTeacherRef[];
  school: string;
  source_id: string;
  ingestion_run_id: string;
  names_alt?: string[]; // Alternative romanizations
  grid_code?: string;
  nicknames?: string[];
  koan_refs?: string;
}

export interface RawMasterRole {
  slug: string;
  role: "speaker" | "questioner" | "respondent" | "compiler" | "commentator" | "attributed_to";
}

export interface RawTeaching {
  slug: string;
  type: string; // "koan" | "saying" | "verse" | "sermon" | "dialogue" | "proverb"
  author_slug: string; // primary display attribution — maps to authorId on teachings table
  collection: string; // e.g. "Mumonkan", "Blue Cliff Record"
  case_number?: string; // e.g. "1", "48"
  compiler?: string; // e.g. "Wumen Huikai"
  era?: string; // e.g. "Tang", "Song"
  attribution_status: "verified" | "traditional" | "unresolved";
  locale: string; // "en"
  title: string;
  content: string;
  source_id: string; // edition-level source id
  ingestion_run_id: string;
  locator: string; // case number, chapter, or page for re-findability
  master_roles?: RawMasterRole[]; // supplemental participants beyond author
}
