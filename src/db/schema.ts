import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";

// ---------------------------------------------------------------------------
// Precision / confidence enums (stored as TEXT)
// ---------------------------------------------------------------------------
// precision: "exact" | "circa" | "century" | "unknown"
// confidence: "high" | "medium" | "low"

// ============================= SCHOOLS =====================================

export const schools = sqliteTable("schools", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  tradition: text("tradition"),
  parentId: text("parent_id").references((): AnySQLiteColumn => schools.id),
  founderId: text("founder_id"), // FK added after masters is defined
  foundedYear: integer("founded_year"),
  foundedPrecision: text("founded_precision"),
  foundedConfidence: text("founded_confidence"),
  practices: text("practices"),
  active: integer("active", { mode: "boolean" }),
});

export const schoolNames = sqliteTable("school_names", {
  id: text("id").primaryKey(),
  schoolId: text("school_id")
    .notNull()
    .references(() => schools.id),
  locale: text("locale").notNull(),
  value: text("value").notNull(),
});

// ============================= MASTERS =====================================

export const masters = sqliteTable("masters", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  birthYear: integer("birth_year"),
  birthPrecision: text("birth_precision"),
  birthConfidence: text("birth_confidence"),
  deathYear: integer("death_year"),
  deathPrecision: text("death_precision"),
  deathConfidence: text("death_confidence"),
  ordinationYear: integer("ordination_year"),
  ordinationPrecision: text("ordination_precision"),
  schoolId: text("school_id").references(() => schools.id),
  generation: integer("generation"),
});

export const masterTransmissions = sqliteTable("master_transmissions", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => masters.id),
  teacherId: text("teacher_id")
    .notNull()
    .references(() => masters.id),
  type: text("type").notNull(), // "primary" | "secondary" | "disputed" | "dharma"
  isPrimary: integer("is_primary", { mode: "boolean" }),
  notes: text("notes"),
});

export const masterNames = sqliteTable("master_names", {
  id: text("id").primaryKey(),
  masterId: text("master_id")
    .notNull()
    .references(() => masters.id),
  locale: text("locale").notNull(),
  nameType: text("name_type").notNull(), // "dharma" | "birth" | "honorific" | "alias"
  value: text("value").notNull(),
});

// ============================= BIOGRAPHIES =================================

export const masterBiographies = sqliteTable("master_biographies", {
  id: text("id").primaryKey(),
  masterId: text("master_id")
    .notNull()
    .references(() => masters.id, { onDelete: "cascade" }),
  locale: text("locale").notNull(),
  content: text("content").notNull(),
});

// ============================= TEMPLES =====================================

export const temples = sqliteTable("temples", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  lat: real("lat"),
  lng: real("lng"),
  region: text("region"),
  country: text("country"),
  foundedYear: integer("founded_year"),
  foundedPrecision: text("founded_precision"),
  foundedConfidence: text("founded_confidence"),
  founderId: text("founder_id").references(() => masters.id),
  schoolId: text("school_id").references(() => schools.id),
  status: text("status"),
  url: text("url"),
});

export const templeNames = sqliteTable("temple_names", {
  id: text("id").primaryKey(),
  templeId: text("temple_id")
    .notNull()
    .references(() => temples.id),
  locale: text("locale").notNull(),
  value: text("value").notNull(),
});

export const masterTemples = sqliteTable(
  "master_temples",
  {
    masterId: text("master_id")
      .notNull()
      .references(() => masters.id),
    templeId: text("temple_id")
      .notNull()
      .references(() => temples.id),
    role: text("role").notNull(), // "founded" | "resided" | "abbot"
  },
  (table) => [primaryKey({ columns: [table.masterId, table.templeId] })]
);

// ============================= TEACHINGS ===================================

export const teachings = sqliteTable("teachings", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  type: text("type"),
  authorId: text("author_id").references(() => masters.id),
  collection: text("collection"),
  era: text("era"),
  caseNumber: text("case_number"),
  compiler: text("compiler"),
  attributionStatus: text("attribution_status"), // "verified" | "traditional" | "unresolved"
});

export const teachingContent = sqliteTable("teaching_content", {
  id: text("id").primaryKey(),
  teachingId: text("teaching_id")
    .notNull()
    .references(() => teachings.id),
  locale: text("locale").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  translator: text("translator"),
  edition: text("edition"),
  licenseStatus: text("license_status"), // "public_domain" | "cc_by" | "cc_by_sa" | "fair_use" | "unknown"
});

export const teachingMasterRoles = sqliteTable(
  "teaching_master_roles",
  {
    teachingId: text("teaching_id")
      .notNull()
      .references(() => teachings.id),
    masterId: text("master_id")
      .notNull()
      .references(() => masters.id),
    role: text("role").notNull(), // "speaker" | "questioner" | "respondent" | "compiler" | "commentator" | "attributed_to"
  },
  (table) => [primaryKey({ columns: [table.teachingId, table.masterId, table.role] })]
);

export const teachingRelations = sqliteTable(
  "teaching_relations",
  {
    teachingId: text("teaching_id")
      .notNull()
      .references(() => teachings.id),
    relatedId: text("related_id")
      .notNull()
      .references(() => teachings.id),
    relationType: text("relation_type").notNull(),
  },
  (table) => [primaryKey({ columns: [table.teachingId, table.relatedId] })]
);

// ============================= THEMES ======================================

export const themes = sqliteTable("themes", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order"),
});

export const themeNames = sqliteTable("theme_names", {
  id: text("id").primaryKey(),
  themeId: text("theme_id")
    .notNull()
    .references(() => themes.id),
  locale: text("locale").notNull(),
  value: text("value").notNull(),
});

export const teachingThemes = sqliteTable(
  "teaching_themes",
  {
    teachingId: text("teaching_id")
      .notNull()
      .references(() => teachings.id),
    themeId: text("theme_id")
      .notNull()
      .references(() => themes.id),
  },
  (table) => [primaryKey({ columns: [table.teachingId, table.themeId] })]
);

// ============================= EVENTS ======================================

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  type: text("type"),
  dateStart: integer("date_start"),
  dateStartPrecision: text("date_start_precision"),
  dateEnd: integer("date_end"),
  dateEndPrecision: text("date_end_precision"),
  lat: real("lat"),
  lng: real("lng"),
  region: text("region"),
});

export const eventNames = sqliteTable("event_names", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id),
  locale: text("locale").notNull(),
  value: text("value").notNull(),
});

export const eventDescriptions = sqliteTable("event_descriptions", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id),
  locale: text("locale").notNull(),
  content: text("content").notNull(),
});

export const eventMasters = sqliteTable(
  "event_masters",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    masterId: text("master_id")
      .notNull()
      .references(() => masters.id),
    role: text("role"),
  },
  (table) => [primaryKey({ columns: [table.eventId, table.masterId] })]
);

export const eventTemples = sqliteTable(
  "event_temples",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    templeId: text("temple_id")
      .notNull()
      .references(() => temples.id),
    role: text("role"),
  },
  (table) => [primaryKey({ columns: [table.eventId, table.templeId] })]
);

export const eventSchools = sqliteTable(
  "event_schools",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id),
    role: text("role"),
  },
  (table) => [primaryKey({ columns: [table.eventId, table.schoolId] })]
);

// ============================= PROVENANCE ==================================

export const sources = sqliteTable("sources", {
  id: text("id").primaryKey(),
  type: text("type"),
  title: text("title"),
  author: text("author"),
  url: text("url"),
  publicationDate: text("publication_date"),
  reliability: text("reliability"),
});

export const ingestionRuns = sqliteTable("ingestion_runs", {
  id: text("id").primaryKey(),
  sourceId: text("source_id")
    .notNull()
    .references(() => sources.id),
  runDate: text("run_date").notNull(),
  scriptName: text("script_name"),
  status: text("status").notNull(), // "success" | "partial" | "failed"
  recordCount: integer("record_count"),
  notes: text("notes"),
});

export const sourceSnapshots = sqliteTable("source_snapshots", {
  id: text("id").primaryKey(),
  sourceId: text("source_id")
    .notNull()
    .references(() => sources.id),
  ingestionRunId: text("ingestion_run_id")
    .notNull()
    .references(() => ingestionRuns.id),
  snapshotDate: text("snapshot_date").notNull(),
  contentHash: text("content_hash"),
  archiveUrl: text("archive_url"),
});

export const citations = sqliteTable("citations", {
  id: text("id").primaryKey(),
  sourceId: text("source_id")
    .notNull()
    .references(() => sources.id),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  fieldName: text("field_name"),
  excerpt: text("excerpt"),
  pageOrSection: text("page_or_section"),
});

export const assertions = sqliteTable("assertions", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  fieldName: text("field_name").notNull(),
  value: text("value"),
  status: text("status").notNull(), // "accepted" | "disputed" | "rejected"
});

export const assertionCitations = sqliteTable(
  "assertion_citations",
  {
    assertionId: text("assertion_id")
      .notNull()
      .references(() => assertions.id),
    citationId: text("citation_id")
      .notNull()
      .references(() => citations.id),
  },
  (table) => [primaryKey({ columns: [table.assertionId, table.citationId] })]
);

// ============================= REVIEW & AUDIT ==============================

export const reviewStatus = sqliteTable("review_status", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  fieldName: text("field_name"),
  locale: text("locale"),
  status: text("status").notNull(),
  reviewer: text("reviewer"),
  reviewedAt: text("reviewed_at"),
  notes: text("notes"),
});

export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  fieldName: text("field_name"),
  action: text("action").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  actor: text("actor"),
  timestamp: text("timestamp").notNull(),
});

// ============================= SEARCH ======================================

export const searchTokens = sqliteTable("search_tokens", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  token: text("token").notNull(),
  original: text("original"),
  locale: text("locale"),
  tokenType: text("token_type"),
});

// ============================= MEDIA =======================================

export const mediaAssets = sqliteTable("media_assets", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  type: text("type"),
  storagePath: text("storage_path"),
  sourceUrl: text("source_url"),
  license: text("license"),
  attribution: text("attribution"),
  altText: text("alt_text"),
  width: integer("width"),
  height: integer("height"),
  createdAt: text("created_at"),
});
