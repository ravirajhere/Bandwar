import { z } from "zod";

// ==========================================
// 1. Core / Shared Schemas
// ==========================================
const IdSchema = z.string().regex(/^[a-z0-9-]+$/, "ID must be lowercase alphanumeric with hyphens (e.g., 'snk-high-school')");

// Date handles YYYY-MM-DD or ISO 8601 format
const DateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/,
  "Date must be YYYY-MM-DD or ISO 8601 with timezone"
);

// ==========================================
// 2. Master Schema (Strictly Typed)
// ==========================================
export const MasterSchema = z.object({
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
    established: z.string().optional()
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
    area: z.string().optional(),
    censusCode: z.number().optional()
  }).passthrough().optional(),

  emergencyContacts: z.array(
    z.object({
      label: z.string(),
      number: z.string(),
      type: z.string().optional()
    }).passthrough()
  ).optional(),

  brand: z.object({ 
    colors: z.record(z.string()), 
    fonts: z.record(z.string()) 
  }).passthrough().optional(),

  nav: z.array(
    z.object({ label: z.string(), href: z.string(), icon: z.string() })
  ),
  
  contact: z.object({
    email: z.string().email().nullable(),
    address: z.string().optional(),
    coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  }).passthrough(),

  organization: z.object({
    name: z.string(),
    type: z.string().optional(),
    foundingDate: z.string().optional(),
    founders: z.array(z.string()).optional(),
    areaServed: z.string().optional(),
  }).passthrough().optional(),

  social: z.object({
    github: z.string().nullish(),
    youtube: z.string().nullish(),
    instagram: z.string().nullish(),
    twitter: z.string().nullish(),
  }).passthrough().optional(),

  about: z.object({
    intro: z.string(),
    story: z.array(z.string()),
    principles: z.array(z.object({ icon: z.string(), title: z.string(), description: z.string() })),
    sources: z.array(z.object({ type: z.string(), name: z.string(), url: z.string().optional(), detail: z.string().optional() })),
    community: z.object({ lead: z.string(), contributors: z.string() }),
    committee: z.array(z.object({ 
      role: z.string(), 
      name: z.string(), 
      link: z.string().nullable().optional()
    })),
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
  }).passthrough().optional(),

  // 🚀 SEO Block (Strict Validation)
  seo: z.object({
    titlePattern: z.string(),
    titlePatternHome: z.string(),
    defaultDescription: z.string().min(50).max(160), 
    keywords: z.array(z.string()).optional(),
    ogImage: z.string(),
    ogImageWidth: z.number().int().positive().default(1200),
    ogImageHeight: z.number().int().positive().default(630),
    ogType: z.enum(["website", "article", "profile"]).default("website"),
    twitterHandle: z.string().nullable().optional(),
    twitterCard: z.enum(["summary", "summary_large_image"]).default("summary_large_image"),
    canonicalBase: z.string().url(),
    robots: z.object({
      index: z.boolean().default(true),
      follow: z.boolean().default(true),
      maxImagePreview: z.enum(["none", "standard", "large"]).default("large"),
      maxSnippet: z.number().default(-1),
    }),
    verification: z.object({
      google: z.string().nullable().optional(),
      bing: z.string().nullable().optional(),
    }).optional(),
  }).strict().optional(),

  // 🚀 Sitemap Block
  sitemap: z.object({
    includePages: z.array(z.string()).min(1),
    includeArticles: z.boolean().default(true),
    includeLandmarks: z.boolean().default(false),
    includeGallery: z.boolean().default(true),
    changeFrequency: z.enum(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]).default("weekly"),
    priority: z.object({
      home: z.number().min(0).max(1),
      directory: z.number().min(0).max(1),
      articles: z.number().min(0).max(1),
      gallery: z.number().min(0).max(1),
      map: z.number().min(0).max(1),
      about: z.number().min(0).max(1),
      legal: z.number().min(0).max(1),
    }).passthrough(),
  }).strict().optional(),

}).passthrough();

// ==========================================
// 3. Article Schema (SEO Upgraded)
// ==========================================
export const ArticleSchema = z.object({
  id: IdSchema,
  title: z.string().min(3).max(120),
  metaTitle: z.string().min(10).max(60).optional(),
  metaDescription: z.string().min(50).max(160).optional(),
  subtitle: z.string().min(3).max(200),
  categories: z.array(IdSchema).min(1, "Article must have at least one category"),
  summary: z.string().min(80).max(300),
  hero: z.string().optional(),
  photos: z.array(z.object({ 
    src: z.string(), 
    caption: z.string().min(10),
    imageAlt: z.string().min(10).max(160), // Enforced for Image SEO
  })).default([]),
  infobox: z.record(z.string()).optional(),
  datePublished: DateSchema.optional(),
  dateModified: DateSchema.optional(),
  lastUpdated: DateSchema,
  lastEditedBy: z.string().optional(),
  lastEditedByUsername: z.string().optional(),
  content: z.array(z.object({ 
    heading: z.string().min(2).max(80), 
    text: z.string().min(50) 
  })).min(1),
  faqs: z.array(z.object({ 
    q: z.string().min(5).max(200), 
    a: z.string().min(20).max(2000) 
  })).default([]),
  related: z.array(IdSchema).default([]),
  location: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).optional(),
  tags: z.array(z.string().min(2).max(30)).default([]),
}).passthrough();

export const ArticleListSchema = z.object({ articles: z.array(ArticleSchema) });

// ==========================================
// 4. Media Schema
// ==========================================
export const PhotoSchema = z.object({
  id: z.string(), 
  src: z.string(), 
  caption: z.string(), 
  category: z.string(), 
  year: z.string(),
});

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
});

export const LandmarkSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(), 
  name: z.string().optional(),  
  icon: z.string().optional(), 
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  description: z.string().optional(),
  category: z.string().optional(),
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
  eras: z.array(z.object({ id: z.string(), title: z.string(), subtitle: z.string(), color: z.string() })),
  landmarks: z.array(LandmarkSchema).optional(),
});

// ==========================================
// 5. People Schema
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
  tags: z.array(z.string()).optional(),
}).passthrough();

export const PeopleDataSchema = z.object({ people: z.array(PersonSchema) });

// ==========================================
// 6. Categories Schema
// ==========================================
export const CategorySchema = z.object({
  id: IdSchema, 
  title: z.string(), 
  icon: z.string(), 
  description: z.string(),
}).passthrough();

export const CategoriesDataSchema = z.object({ categories: z.array(CategorySchema) });

// ==========================================
// 7. Directory Schema
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
}).passthrough();

export const DirectoryDataSchema = z.object({
  categories: z.array(z.object({ id: z.string(), title: z.string(), icon: z.string() })),
  items: z.array(DirectoryItemSchema),
}).passthrough();

// ==========================================
// 8. Contributor Schema (E-E-A-T)
// ==========================================
export const ContributorSchema = z.object({
  username: z.string().min(2).max(50),
  displayName: z.string().min(1).max(100),
  photo: z.string().optional(),
  bio: z.string().max(1000).optional(),
  joinedAt: z.string().optional(),
  contributions: z.number().optional(),
}).passthrough();

export const ContributorsDataSchema = z.object({
  contributors: z.array(ContributorSchema),
});

// ==========================================
// TypeScript Types Export
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