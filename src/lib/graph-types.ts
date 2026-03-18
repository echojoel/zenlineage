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
