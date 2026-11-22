import { z } from "zod";

// ==========================================
// 1. Core / Shared Primitives
// ==========================================
const IdSchema = z.string().regex(
  /^[a-z0-9-]+$/,
  "ID must be lowercase alphanumeric with hyphens (e.g., 'snk-high-school')"
);

// Strict date — timezone required for full ISO, date-only allowed
const DateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2}))?$/,
  "Date must be YYYY-MM-DD or full ISO 8601 with timezone (e.g., '2026-01-01T00:00:00Z')"
);

// ==========================================
// 2. Provenance & Confidence (Phase 0 Core)
// ==========================================
export const ConfidenceTierEnum = z.enum([
  "unverified",
  "community",
  "elder",
  "archival",
  "contested",
]);
export type ConfidenceTier = z.infer<typeof ConfidenceTierEnum>;

export const ProvenanceSchema = z.object({
  sourceId: z.string().optional(),        
  sourceLabel: z.string().optional(),      
  sourceUrl: z.string().url().optional(),
  method: z.enum([
    "document",
    "interview",
    "observation",
    "community-consensus",
    "public-record",
    "inferred",
  ]).optional(),
  verifiedBy: z.string().optional(),       
  verifiedAt: DateSchema.optional(),
  confidence: ConfidenceTierEnum.optional(),
  notes: z.string().optional(),
}).passthrough();

export const ConservationStateEnum = z.enum([
  "original",
  "good",
  "fair",
  "poor",
  "digitized-only",
  "lost",
]);

export const AbsenceReasonEnum = z.enum([
  "lost",
  "destroyed",
  "undocumented",
  "withheld",
  "unavailable",
  "unverified",
]);

// ==========================================
// 3. Infobox (Backward Compatible Upgrade)
// ==========================================
const InfoboxValueSchema = z.union([
  z.string(),
  z.object({
    value: z.string(),
    provenance: ProvenanceSchema.optional(),
    confidence: ConfidenceTierEnum.optional(),
  }).passthrough(),
]);

const InfoboxSchema = z.record(InfoboxValueSchema).transform((record) => {
  const normalized: Record<string, { value: string; provenance?: z.infer<typeof ProvenanceSchema>; confidence?: ConfidenceTier }> = {};
  for (const [key, val] of Object.entries(record)) {
    if (typeof val === "string") {
      normalized[key] = { value: val, confidence: "unverified" };
    } else {
      normalized[key] = val;
    }
  }
  return normalized;
});

// ==========================================
// 4. Article Schema (Extended, Backward Compatible)
// ==========================================
const TranslationBlockSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  content: z.array(z.object({
    heading: z.string(),
    text: z.string(),
  })).optional(),
}).passthrough();

export const ArticleSchema = z.object({
  id: IdSchema,
  title: z.string(),

  title_hi: z.string().optional(),
  title_an: z.string().optional(),

  translations: z.record(TranslationBlockSchema).optional(),

  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),

  subtitle: z.string(),
  subtitle_hi: z.string().optional(),
  subtitle_an: z.string().optional(),

  categories: z.array(IdSchema).min(1, "Article must have at least one category"),

  summary: z.string(),
  summary_hi: z.string().optional(),
  summary_an: z.string().optional(),

  hero: z.string().optional(),
  heroProvenance: ProvenanceSchema.optional(),

  photos: z.array(
    z.object({
      src: z.string(),
      caption: z.string(),
      imageAlt: z.string().optional(),
      provenance: ProvenanceSchema.optional(),
      conservation: ConservationStateEnum.optional(),
      year: z.string().optional(),
      sortKey: z.number().optional(),
    }).transform(photo => ({
      ...photo,
      imageAlt: photo.imageAlt || photo.caption || "Bandwar Village Archive",
    }))
  ).default([]),

  infobox: InfoboxSchema.optional(),

  datePublished: DateSchema.optional(),
  dateModified: DateSchema.optional(),
  lastUpdated: DateSchema,
  lastEditedBy: z.string().optional(),
  lastEditedByUsername: z.string().optional(),

  status: z.enum(["draft", "review", "published", "archived", "stale"]).optional(),
  published: z.boolean().default(true),

  content: z.array(z.object({
    heading: z.string(),
    text: z.string(),
  })).min(1),

  content_hi: z.array(z.object({ heading: z.string(), text: z.string() })).optional(),
  content_an: z.array(z.object({ heading: z.string(), text: z.string() })).optional(),

  faqs: z.array(z.object({
    q: z.string(),
    a: z.string(),
    provenance: ProvenanceSchema.optional(),
  })).default([]),

  related: z.array(IdSchema).default([]),
  connectionIds: z.array(z.string()).optional(),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
  tags: z.array(z.string()).default([]),

  provenance: ProvenanceSchema.optional(),
  confidence: ConfidenceTierEnum.optional(),

  voices: z.array(z.object({
    role: z.enum(["elder", "youth", "historian", "visitor", "resident", "descendant"]),
    name: z.string().optional(),
    text: z.string(),
    provenance: ProvenanceSchema.optional(),
  })).optional(),

  absences: z.array(z.object({
    reason: AbsenceReasonEnum,
    description: z.string(),
    provenance: ProvenanceSchema.optional(),
  })).optional(),
}).passthrough();

export const ArticleListSchema = z.object({ articles: z.array(ArticleSchema) });

// ==========================================
// 5. Media Schema (Extended)
// ==========================================
export const PhotoSchema = z.object({
  id: z.string(),
  src: z.string(),
  caption: z.string(),
  category: z.string(),
  year: z.string(),
  provenance: ProvenanceSchema.optional(),
  conservation: ConservationStateEnum.optional(),
  confidence: ConfidenceTierEnum.optional(),
  sortKey: z.number().optional(),
}).passthrough();

export const TimelineEventSchema = z.object({
  id: z.string(),
  year: z.string(),
  sortKey: z.number(),
  era: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  icon: z.string().optional(),
  article: z.string().optional(),
  provenance: ProvenanceSchema.optional(),
  confidence: ConfidenceTierEnum.optional(),
}).passthrough();

export const TemporalCoordSchema = z.object({
  year: z.string(),
  lat: z.number(),
  lng: z.number(),
  source: z.string().optional(),
  provenance: ProvenanceSchema.optional(),
});

export const LandmarkSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  name: z.string().optional(),
  icon: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  description: z.string().optional(),
  category: z.string().optional(),
  provenance: ProvenanceSchema.optional(),
  confidence: ConfidenceTierEnum.optional(),
  historicalCoords: z.array(TemporalCoordSchema).optional(),
  audioPin: z.object({
    src: z.string(),
    transcript: z.string().optional(),
    durationSeconds: z.number().optional(),
    provenance: ProvenanceSchema.optional(),
  }).optional(),
}).passthrough().refine(
  (data) => data.title || data.name,
  { message: "Landmark must have either 'title' or 'name'", path: ["title"] }
);

export const MediaSchema = z.object({
  gallery: z.object({
    categories: z.array(z.object({ id: z.string(), title: z.string(), icon: z.string() })),
    photos: z.array(PhotoSchema),
  }),
  timeline: z.array(TimelineEventSchema),
  eras: z.array(z.object({
    id: z.string(),
    title: z.string(),
    subtitle: z.string(),
    color: z.string(),
  })),
  landmarks: z.array(LandmarkSchema).optional(),
}).passthrough();

// ==========================================
// 6. People Schema (Extended)
// ==========================================
export const PersonSchema = z.object({
  id: IdSchema,
  name: z.string(),
  role: z.string(),
  locality: z.string().optional(),
  bio: z.string(),
  photo: z.string().optional(),
  photoAlt: z.string().optional(),
  dob: z.string().optional(),
  deathDate: z.string().optional(),
  birthplace: z.string().optional(),
  titles: z.array(z.string()).optional(),
  journey: z.string().optional(),
  lastUpdated: DateSchema.optional(),
  lastEditedBy: z.string().optional(),
  published: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
  provenance: ProvenanceSchema.optional(),
  confidence: ConfidenceTierEnum.optional(),
  roles: z.array(z.enum(["elder", "researcher", "volunteer", "editor", "descendant", "resident"])).optional(),
  lineage: z.array(z.object({
    type: z.enum(["teacher", "student", "parent", "child", "spouse", "sibling"]),
    personId: IdSchema,
    notes: z.string().optional(),
  })).optional(),
}).passthrough().transform(person => {
  if (person.photo && !person.photoAlt) {
    person.photoAlt = `${person.name} - ${person.role} in Bandwar`;
  }
  return person;
});

export const PeopleDataSchema = z.object({ people: z.array(PersonSchema) });

// ==========================================
// 7. Categories Schema (Extended)
// ==========================================
export const CategorySchema = z.object({
  id: IdSchema,
  title: z.string(),
  icon: z.string(),
  description: z.string(),
  provenance: ProvenanceSchema.optional(),
}).passthrough();

export const CategoriesDataSchema = z.object({ categories: z.array(CategorySchema) });

// ==========================================
// 8. Directory Schema (Extended)
// ==========================================
export const DirectoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  categoryId: z.string(),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  timing: z.string().optional(),
  isEmergency: z.boolean().default(false),
  lastUpdated: DateSchema.optional(),
  lastEditedBy: z.string().optional(),
  provenance: ProvenanceSchema.optional(),
  confidence: ConfidenceTierEnum.optional(),
  livingStatus: z.enum(["active", "retired", "passed", "family-continues"]).optional(),
  lineage: z.array(z.object({
    type: z.string(),
    personId: IdSchema,
  })).optional(),
}).passthrough();

export const DirectoryDataSchema = z.object({
  categories: z.array(z.object({ id: z.string(), title: z.string(), icon: z.string() })),
  items: z.array(DirectoryItemSchema),
}).passthrough();

// ==========================================
// 9. Contributor Schema (Extended)
// ==========================================
export const ContributorRoleEnum = z.enum([
  "contributor",
  "editor",
  "elder",
  "researcher",
  "archivist",
  "admin",
]);

export const ContributorSchema = z.object({
  username: z.string(),
  displayName: z.string(),
  photo: z.string().optional(),
  bio: z.string().optional(),
  joinedAt: z.string().optional(),
  contributions: z.number().optional(),
  roles: z.array(ContributorRoleEnum).optional(),
  canVerify: z.array(ConfidenceTierEnum).optional(),
  verifiedContributions: z.number().optional(),
}).passthrough();

export const ContributorsDataSchema = z.object({
  contributors: z.array(ContributorSchema),
});

// ==========================================
// 10. Master Schema (Extended)
// ==========================================
export const MasterSchema = z.object({
  version: z.string().optional(),
  lastUpdated: DateSchema.optional(),
  schemaVersion: z.string().optional(),

  site: z.object({
    name: z.string(),
    shortName: z.string().optional(),
    tagline: z.string().optional(),
    description: z.string(),
    url: z.string().url(),
    edition: z.string().optional(),
    language: z.string().optional(),
    locale: z.string().optional(),
    dir: z.string().optional(),
    established: z.string().optional(),
    maintainedBy: z.string().optional(),
    contentLicense: z.string().optional(),
    codeLicense: z.string().optional(),
    sourceCode: z.string().nullable().optional(),
  }).passthrough(),

  village: z.object({
    name: z.string(),
    alias: z.array(z.string()).optional(),
    region: z.string().optional(),
    district: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    pincode: z.string().optional(),
    coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
    elevation: z.string().optional(),
    population: z.number().optional(),
    households: z.number().optional(),
    sexRatio: z.union([z.string(), z.number(), z.object({ females: z.number(), perMales: z.number() })]).optional(),
    literacyRate: z.union([z.string(), z.number()]).optional(),
    area: z.string().optional(),
    censusCode: z.number().optional(),
    gramPanchayat: z.string().optional(),
    block: z.string().optional(),
    subdivision: z.string().optional(),
    lokSabha: z.string().optional(),
    vidhanSabha: z.string().optional(),
    policeStation: z.string().optional(),
    postOffice: z.string().optional(),
    nearestTown: z.string().optional(),
    nearestRailway: z.string().optional(),
    nearestAirport: z.string().optional(),
    river: z.string().optional(),
    highway: z.string().optional(),
    language: z.array(z.string()).optional(),
    festivals: z.array(z.string()).optional(),
    mainCrops: z.array(z.string()).optional(),
    popularName: z.string().optional(),
    fieldSources: z.record(ProvenanceSchema).optional(),
  }).passthrough().optional(),

  emergencyContacts: z.array(
    z.object({
      label: z.string(),
      number: z.string(),
      type: z.string().optional(),
      available: z.string().optional(),
    }).passthrough()
  ).optional(),

  brand: z.object({
    colors: z.record(z.string()),
    fonts: z.record(z.string()),
    logo: z.object({
      primary: z.string().optional(),
      mark: z.string().optional(),
      favicon: z.string().optional(),
      appleTouchIcon: z.string().optional(),
    }).passthrough().optional(),
  }).passthrough().optional(),

  nav: z.array(z.object({ label: z.string(), href: z.string(), icon: z.string() })),

  contact: z.object({
    email: z.string().email().nullable(),
    address: z.string().optional(),
    coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
    preferredChannel: z.string().optional(),
    formEndpoint: z.string().nullable().optional(),
    responseTime: z.string().optional(),
    languages: z.array(z.string()).optional(),
  }).passthrough(),

  organization: z.object({
    name: z.string(),
    alternateName: z.array(z.string()).optional(),
    type: z.string().optional(),
    foundingDate: z.string().optional(),
    founders: z.array(z.string()).optional(),
    areaServed: z.string().optional(),
    mission: z.string().optional(),
    governance: z.string().optional(),
  }).passthrough().optional(),

  social: z.object({
    github: z.string().nullish(),
    youtube: z.string().nullish(),
    instagram: z.string().nullish(),
    facebook: z.string().nullish(),
    twitter: z.string().nullish(),
    whatsapp: z.string().nullish(),
    telegram: z.string().nullish(),
  }).passthrough().optional(),

  about: z.object({
    intro: z.string(),
    story: z.array(z.string()),
    principles: z.array(z.object({
      icon: z.string(),
      title: z.string(),
      description: z.string(),
      sourceId: z.string().optional(),
      since: z.string().optional(),
    })),
    sources: z.array(z.object({
      type: z.string(),
      name: z.string(),
      url: z.string().optional(),
      detail: z.string().optional(),
    })),
    community: z.object({ lead: z.string(), contributors: z.string() }),
    committee: z.array(z.object({
      role: z.string(),
      name: z.string(),
      link: z.string().nullable().optional()
    })),
    contact: z.string().optional(),
    license: z.string().optional(),
  }).passthrough().optional(),

  provenanceTiers: z.object({
    version: z.string(),
    tiers: z.array(z.object({
      id: ConfidenceTierEnum,
      label: z.string(),
      description: z.string(),
      color: z.string(),
      icon: z.string(),
      rank: z.number(),
    })),
  }).passthrough().optional(),

  connectionTypes: z.object({
    version: z.string(),
    types: z.array(z.object({
      id: z.string(),
      label: z.string(),
      symmetric: z.boolean(),
      icon: z.string(),
    })),
  }).passthrough().optional(),

  stewardshipRoles: z.object({
    roles: z.array(z.object({
      id: z.string(),
      label: z.string(),
      canVerify: z.array(ConfidenceTierEnum),
    })),
  }).passthrough().optional(),

  sourceRegistry: z.object({
    sources: z.array(z.object({
      id: z.string(),
      type: z.string(),
      name: z.string(),
      url: z.string().url().optional(),
      accessed: DateSchema.optional(),
      reliability: z.enum(["high", "medium", "low"]).optional(),
      detail: z.string().optional(),
    })),
  }).passthrough().optional(),

  absenceReasons: z.object({
    reasons: z.array(z.object({
      id: AbsenceReasonEnum,
      label: z.string(),
    })),
  }).passthrough().optional(),

  conservationStates: z.object({
    states: z.array(z.object({
      id: ConservationStateEnum,
      label: z.string(),
    })),
  }).passthrough().optional(),

  citationFormats: z.object({
    formats: z.array(z.string()),
    default: z.string(),
    includeAccessedDate: z.boolean().optional(),
    permanentUrlPattern: z.string().optional(),
  }).passthrough().optional(),

  footer: z.object({
    copyright: z.string().optional(),
    credit: z.string().optional(),
    sections: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
    explore: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
    legal: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
  }).passthrough().optional(),

  home: z.object({
    hero: z.object({
      image: z.string(),
      alt: z.string(),
      location: z.string(),
      title: z.string(),
      tagline: z.string(),
    }),
    meta: z.array(z.object({ label: z.string(), value: z.string() })),
    about: z.object({
      eyebrow: z.string(),
      title: z.string(),
      paragraphs: z.array(z.string()),
      image: z.string().optional(),
      imageAlt: z.string().optional(),
    }),
    cta: z.object({ label: z.string(), href: z.string() }),
    pullquote: z.object({
      text: z.string(),
      cite: z.string(),
      source: z.object({ label: z.string(), href: z.string() }).optional()
    }),
    stats: z.array(z.object({ label: z.string(), value: z.string() })),
    quickLinks: z.array(z.object({ label: z.string(), href: z.string(), icon: z.string() })).optional(),
  }).passthrough().optional(),

  seo: z.object({
    titlePattern: z.string(),
    titlePatternHome: z.string(),
    defaultDescription: z.string(),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string(),
    ogImageWidth: z.number().optional(),
    ogImageHeight: z.number().optional(),
    ogType: z.enum(["website", "article", "profile"]).optional(),
    twitterHandle: z.string().nullable().optional(),
    twitterCard: z.enum(["summary", "summary_large_image"]).optional(),
    canonicalBase: z.string().url().optional(),
    robots: z.object({
      index: z.boolean().optional(),
      follow: z.boolean().optional(),
      maxImagePreview: z.enum(["none", "standard", "large"]).optional(),
      maxSnippet: z.number().optional(),
    }).passthrough().optional(),
    verification: z.object({
      google: z.string().nullable().optional(),
      bing: z.string().nullable().optional(),
    }).passthrough().optional(),
    structuredData: z.any().optional(),
  }).passthrough(),

  sitemap: z.object({
    includePages: z.array(z.string()),
    includeArticles: z.boolean().optional(),
    includeLandmarks: z.boolean().optional(),
    includeGallery: z.boolean().optional(),
    changeFrequency: z.string().optional(),
    priority: z.record(z.number()).optional(),
  }).passthrough().optional(),

  imageSEO: z.record(z.any()).optional(),
  bot: z.record(z.any()).optional(),
  features: z.record(z.any()).optional(),
  analytics: z.record(z.any()).optional(),
  license: z.record(z.any()).optional(),
  legal: z.record(z.any()).optional(),
  accessibility: z.record(z.any()).optional(),
  i18n: z.record(z.any()).optional(),
  admin: z.record(z.any()).optional(),
  connectivity: z.record(z.any()).optional(),
  climate: z.record(z.any()).optional(),

}).passthrough();

// ==========================================
// 11. NEW FILE SCHEMAS
// ==========================================

export const EdgeSchema = z.object({
  id: z.string(),
  type: z.string(),                    
  from: IdSchema,
  to: IdSchema,
  label: z.string().optional(),
  description: z.string().optional(),
  provenance: ProvenanceSchema.optional(),
  confidence: ConfidenceTierEnum.optional(),
  since: z.string().optional(),
  until: z.string().optional(),
}).passthrough();

export const EdgesDataSchema = z.object({
  version: z.string(),
  edges: z.array(EdgeSchema),
});

export const StewardshipEntrySchema = z.object({
  id: z.string(),
  entityId: IdSchema,
  entityType: z.enum(["article", "person", "photo", "landmark", "directory", "media"]),
  action: z.enum(["created", "verified", "contested", "unverified", "corrected", "flagged"]),
  tier: ConfidenceTierEnum,
  role: z.string(),                    
  actor: z.string(),                   
  method: z.string().optional(),
  notes: z.string().optional(),
  timestamp: DateSchema,
  sourceIds: z.array(z.string()).optional(),
}).passthrough();

export const StewardshipDataSchema = z.object({
  version: z.string(),
  entries: z.array(StewardshipEntrySchema),
});

export const AbsenceRecordSchema = z.object({
  id: z.string(),
  entityId: IdSchema.optional(),
  entityType: z.enum(["article", "person", "photo", "landmark", "artifact", "event"]).optional(),
  reason: AbsenceReasonEnum,
  description: z.string(),
  lastSeenAt: z.string().optional(),
  lastSeenBy: z.string().optional(),
  provenance: ProvenanceSchema.optional(),
  relatedEntityIds: z.array(IdSchema).optional(),
}).passthrough();

export const AbsencesDataSchema = z.object({
  version: z.string(),
  absences: z.array(AbsenceRecordSchema),
});

export const QueueItemSchema = z.object({
  id: z.string(),
  type: z.enum(["edit", "new-article", "photo", "directory", "person", "correction"]),
  status: z.enum(["pending", "staged", "rejected", "published"]),
  targetId: z.string().optional(),
  submittedBy: z.string(),
  submittedAt: DateSchema,
  channel: z.enum(["telegram", "web", "admin"]).optional(),
  payload: z.record(z.any()),          
  notes: z.string().optional(),
}).passthrough();

export const QueueDataSchema = z.object({
  pending: z.array(QueueItemSchema).default([]),
  approved: z.array(QueueItemSchema).default([]),
}).passthrough();

// ==========================================
// TypeScript Type Exports
// ==========================================
export type MasterConfig = z.infer<typeof MasterSchema>;
export type Article = z.infer<typeof ArticleSchema>;
export type Media = z.infer<typeof MediaSchema>;
export type Person = z.infer<typeof PersonSchema>;
export type PeopleData = z.infer<typeof PeopleDataSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type CategoriesData = z.infer<typeof CategoriesDataSchema>;
export type DirectoryItem = z.infer<typeof DirectoryItemSchema>;
export type DirectoryData = z.infer<typeof DirectoryDataSchema>;
export type Contributor = z.infer<typeof ContributorSchema>;
export type ContributorsData = z.infer<typeof ContributorsDataSchema>;
export type Edge = z.infer<typeof EdgeSchema>;
export type EdgesData = z.infer<typeof EdgesDataSchema>;
export type StewardshipEntry = z.infer<typeof StewardshipEntrySchema>;
export type StewardshipData = z.infer<typeof StewardshipDataSchema>;
export type AbsenceRecord = z.infer<typeof AbsenceRecordSchema>;
export type AbsencesData = z.infer<typeof AbsencesDataSchema>;
export type QueueItem = z.infer<typeof QueueItemSchema>;
export type QueueData = z.infer<typeof QueueDataSchema>;
export type Provenance = z.infer<typeof ProvenanceSchema>;