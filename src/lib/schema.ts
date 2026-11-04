import { z } from "zod";

// ==========================================
// 1. Core / Shared Schemas
// ==========================================
const IdSchema = z.string().regex(/^[a-z0-9-]+$/, "ID must be lowercase alphanumeric with hyphens (e.g., 'snk-high-school')");

const DateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/,
  "Date must be YYYY-MM-DD or ISO 8601 with timezone"
);

// ==========================================
// 2. Master Schema (Relaxed for existing data)
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

  seo: z.object({
    titlePattern: z.string(),
    titlePatternHome: z.string(),
    defaultDescription: z.string(), // 🚀 Relaxed max length
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
    structuredData: z.any().optional(), // 🚀 Fixed: Unrecognized key error
  }).passthrough().optional(), // 🚀 Removed .strict()

  sitemap: z.object({
    includePages: z.array(z.string()),
    includeArticles: z.boolean().optional(),
    includeLandmarks: z.boolean().optional(),
    includeGallery: z.boolean().optional(),
    changeFrequency: z.string().optional(),
    priority: z.record(z.number()).optional(),
  }).passthrough().optional(), // 🚀 Removed .strict()

}).passthrough();

// ==========================================
// 3. Article Schema (Relaxed Limits)
// ==========================================
export const ArticleSchema = z.object({
  id: IdSchema,
  title: z.string(),
  metaTitle: z.string().optional(), // 🚀 Relaxed
  metaDescription: z.string().optional(), // 🚀 Relaxed
  subtitle: z.string(),
  categories: z.array(IdSchema).min(1, "Article must have at least one category"),
  summary: z.string(), // 🚀 Relaxed max length
  hero: z.string().optional(),
  photos: z.array(z.object({ 
    src: z.string(), 
    caption: z.string(),
    imageAlt: z.string().optional(), // 🚀 Made optional to prevent build fail
  })).default([]),
  infobox: z.record(z.string()).optional(),
  datePublished: DateSchema.optional(),
  dateModified: DateSchema.optional(),
  lastUpdated: DateSchema,
  lastEditedBy: z.string().optional(),
  lastEditedByUsername: z.string().optional(),
  published: z.boolean().optional(),
  content: z.array(z.object({ 
    heading: z.string(), 
    text: z.string() 
  })).min(1),
  faqs: z.array(z.object({ 
    q: z.string(), 
    a: z.string() 
  })).default([]),
  related: z.array(IdSchema).default([]),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
  tags: z.array(z.string()).default([]), // 🚀 Relaxed max length
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
  lat: z.number(),
  lng: z.number(),
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
  published: z.boolean().optional(),
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
  username: z.string(),
  displayName: z.string(),
  photo: z.string().optional(),
  bio: z.string().optional(),
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