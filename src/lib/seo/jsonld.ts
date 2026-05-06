// JSON-LD builders. Emit structured data that points search engines and
// LLM crawlers at the same canonical entities the rest of the site
// already exposes. All builders return plain objects; render with
// <JsonLd> below to handle the embed-safe stringification.

export const SITE_URL = "https://zenlineage.org";
export const SITE_NAME = "Zen Lineage";
const SITE_DESCRIPTION =
  "An interactive encyclopedia of Zen Buddhism — lineage explorer, masters, schools, and teachings across 2,500 years of Chan/Zen history.";

export type JsonLdNode = Record<string, unknown>;

export function abs(path: string): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function organizationSchema(): JsonLdNode {
  return {
    "@type": ["Organization", "EducationalOrganization"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/opengraph-image.png`,
    description: SITE_DESCRIPTION,
  };
}

export function websiteSchema(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export type BreadcrumbTrailItem = { name: string; url: string };

export function breadcrumbSchema(trail: BreadcrumbTrailItem[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export type PersonSchemaInput = {
  name: string;
  slug: string;
  alternateNames?: string[];
  birthYear?: number | null;
  deathYear?: number | null;
  description?: string | null;
  image?: string | null;
  school?: { slug: string; name: string } | null;
  teachers?: { slug: string; name: string }[];
  students?: { slug: string; name: string }[];
  sameAs?: string[];
};

export function personSchema(p: PersonSchemaInput): JsonLdNode {
  const url = abs(`/masters/${p.slug}`);
  const knows = [
    ...(p.teachers ?? []).map((t) => ({
      "@type": "Person",
      name: t.name,
      url: abs(`/masters/${t.slug}`),
    })),
    ...(p.students ?? []).map((s) => ({
      "@type": "Person",
      name: s.name,
      url: abs(`/masters/${s.slug}`),
    })),
  ];

  return {
    "@type": "Person",
    "@id": `${url}#person`,
    name: p.name,
    url,
    ...(p.alternateNames && p.alternateNames.length > 0
      ? { alternateName: p.alternateNames }
      : {}),
    ...(p.image ? { image: abs(p.image) } : {}),
    ...(p.birthYear ? { birthDate: String(p.birthYear) } : {}),
    ...(p.deathYear ? { deathDate: String(p.deathYear) } : {}),
    ...(p.description
      ? { description: p.description.slice(0, 280) }
      : { description: `${p.name}, a Zen Buddhist master.` }),
    ...(p.school
      ? {
          memberOf: {
            "@type": "EducationalOrganization",
            name: p.school.name,
            url: abs(`/schools/${p.school.slug}`),
          },
        }
      : {}),
    ...(knows.length > 0 ? { knows } : {}),
    ...(p.sameAs && p.sameAs.length > 0 ? { sameAs: p.sameAs } : {}),
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

export type SchoolSchemaInput = {
  name: string;
  slug: string;
  description?: string | null;
  tradition?: string | null;
  parent?: { slug: string; name: string } | null;
  members?: { slug: string; name: string }[];
  knowsAbout?: string[];
};

export function schoolSchema(s: SchoolSchemaInput): JsonLdNode {
  const url = abs(`/schools/${s.slug}`);
  return {
    "@type": "EducationalOrganization",
    "@id": `${url}#school`,
    name: s.name,
    url,
    ...(s.description ? { description: s.description.slice(0, 600) } : {}),
    ...(s.tradition ? { keywords: [s.tradition, "Zen Buddhism"] } : {}),
    ...(s.parent
      ? {
          parentOrganization: {
            "@type": "EducationalOrganization",
            name: s.parent.name,
            url: abs(`/schools/${s.parent.slug}`),
          },
        }
      : {}),
    ...(s.members && s.members.length > 0
      ? {
          member: s.members.slice(0, 50).map((m) => ({
            "@type": "Person",
            name: m.name,
            url: abs(`/masters/${m.slug}`),
          })),
        }
      : {}),
    ...(s.knowsAbout && s.knowsAbout.length > 0
      ? { knowsAbout: s.knowsAbout }
      : {}),
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

export type TeachingSchemaInput = {
  slug: string;
  type: string | null;
  title: string;
  content?: string | null;
  collection?: string | null;
  caseNumber?: string | null;
  era?: string | null;
  translator?: string | null;
  author?: { slug: string; name: string } | null;
};

// Pick the most specific schema.org type for a teaching. Koans become
// Quiz with an embedded Question; works become Book; proverbs and
// verses become Quotation. Others fall back to CreativeWork.
export function teachingSchema(t: TeachingSchemaInput): JsonLdNode {
  const url = abs(`/teachings/${t.slug}`);
  const author = t.author
    ? {
        "@type": "Person",
        name: t.author.name,
        url: abs(`/masters/${t.author.slug}`),
      }
    : undefined;

  const base: JsonLdNode = {
    "@id": `${url}#teaching`,
    url,
    name: t.title,
    ...(author ? { author } : {}),
    ...(t.era ? { temporalCoverage: t.era } : {}),
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  if (t.type === "koan") {
    return {
      ...base,
      "@type": "Quiz",
      headline: t.title,
      ...(t.collection
        ? {
            isPartOf: {
              "@type": "Book",
              name: t.collection,
              ...(t.caseNumber ? { position: t.caseNumber } : {}),
            },
          }
        : {}),
      ...(t.content
        ? {
            hasPart: {
              "@type": "Question",
              name: t.title,
              text: t.content.slice(0, 1500),
            },
          }
        : {}),
    };
  }

  if (t.type === "work") {
    return {
      ...base,
      "@type": "Book",
      ...(t.content ? { abstract: t.content.slice(0, 600) } : {}),
      ...(t.translator ? { translator: { "@type": "Person", name: t.translator } } : {}),
      inLanguage: "en",
    };
  }

  if (t.type === "proverb" || t.type === "verse") {
    return {
      ...base,
      "@type": "Quotation",
      ...(t.content ? { text: t.content } : {}),
      ...(author ? { spokenByCharacter: author } : {}),
    };
  }

  return {
    ...base,
    "@type": "CreativeWork",
    ...(t.content ? { abstract: t.content.slice(0, 600) } : {}),
  };
}

// Embed-safe stringify — escapes `<` so a stray `</script>` in a quote
// can't break out of the JSON-LD block. Returns a string ready for
// dangerouslySetInnerHTML.
export function jsonLdString(node: JsonLdNode | JsonLdNode[]): string {
  const payload = Array.isArray(node)
    ? { "@context": "https://schema.org", "@graph": node }
    : { "@context": "https://schema.org", ...node };
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}
