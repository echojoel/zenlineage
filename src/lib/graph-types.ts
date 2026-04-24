export interface GraphNode {
  id: string;
  slug: string;
  label: string;
  schoolId: string | null;
  schoolSlug: string | null;
  schoolName: string | null;
  birthYear: number | null;
  birthPrecision: string | null;
  deathYear: number | null;
  deathPrecision: string | null;
  searchText: string;
  bio: string | null;
  imageSrc?: string | null;
  /** 48×64 WebP thumbnail; used by the lineage graph at 1× zoom. */
  imageThumb48?: string | null;
  /** 96×128 WebP thumbnail; used by the lineage graph at retina / zoomed in. */
  imageThumb96?: string | null;
  /** 200×267 WebP thumbnail; used for hover previews. */
  imageThumb200?: string | null;
  imageAlt?: string | null;
  imageAttribution?: string | null;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  isPrimary: boolean;
}

export interface GraphSchool {
  id: string;
  slug: string;
  name: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  schools: GraphSchool[];
}
