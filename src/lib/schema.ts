import { z } from "zod";

// ==========================================
// 1. Core / Shared Schemas
// ==========================================
const IdSchema = z.string().regex(/^[a-z0-9-]+$/, "ID must be lowercase alphanumeric with hyphens (e.g., 'snk-high-school')");
const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

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
  }),
  
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
  }).optional(),

  emergencyContacts: z.array(
    z.object({
      label: z.string(),
      number: z.string(),
      type: z.string().optional()
    })
  ).optional(),

  brand: z.object({ 
    colors: z.record(z.string()), 
    fonts: z.record(z.string()) 
  }).optional(),

  nav: z.array(
    z.object({ label: z.string(), href: z.string(), icon: z.string() })
  ),
  contact: z.object({
    email: z.string().email(),
    address: z.string().optional(),
    coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  }),
  about: z.object({
    intro: z.string(),
    story: z.array(z.string()),
    principles: z.array(z.object({ icon: z.string(), title: z.string(), description: z.string() })),
    sources: z.array(z.object({ type: z.string(), name: z.string(), url: z.string().optional(), detail: z.string().optional() })),
    community: z.object({ lead: z.string(), contributors: z.string() }),
    committee: z.array(z.object({ role: z.string(), name: z.string(), link: z.string().optional() })),
  }).optional(),
  
  footer: z.object({
    copyright: z.string().optional(),
    credit: z.string().optional(),
    sections: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
    explore: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
  }).optional(),

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
    }),
    cta: z.object({ label: z.string(), href: z.string() }),
    pullquote: z.object({ text: z.string(), cite: z.string() }),
    stats: z.array(z.object({ label: z.string(), value: z.string() })),
  }).optional(),
});

// ==========================================
// 3. Article Schema
// ==========================================
export const ArticleSchema = z.object({
  id: IdSchema,
  title: z.string(),
  subtitle: z.string(),
  categories: z.array(z.string()),
  summary: z.string(),
  hero: z.string().optional(),
  photos: z.array(z.object({ src: z.string(), caption: z.string() })).default([]),
  infobox: z.record(z.string()).optional(),
  lastUpdated: DateSchema,
  content: z.array(z.object({ heading: z.string(), text: z.string() })),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  related: z.array(z.string()).default([]),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
  tags: z.array(z.string()).default([]),
});
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
  lat: z.number(),
  lng: z.number(),
  description: z.string().optional(),
  category: z.string().optional(),
}).passthrough(); 

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
// 5. Vision 2035 Manifesto Schema
// ==========================================
export const VisionSchema = z.object({
  intro: z.string(),
  priorities: z.array(
    z.object({
      id: z.string(), 
      number: z.string(), 
      title: z.string(), 
      ward: z.string(),
      category: z.string(), 
      status: z.string(), 
      targetYear: z.number(),
      present: z.object({ photo: z.string(), caption: z.string() }),
      required: z.object({ photo: z.string(), caption: z.string() }),
      reality: z.string(), 
      vision: z.string(),
      how: z.object({ scheme: z.string(), cost: z.string(), authority: z.string(), timeline: z.string() }),
      community: z.array(z.string()),
      inside: z.object({
        intro: z.string(),
        photos: z.array(z.object({ src: z.string(), caption: z.string() })),
        checklist: z.array(z.string()),
      }),
    })
  ),
  achievements: z.array(z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    year: z.string().optional(), 
  }).passthrough()).default([]),
  roadmap: z.array(z.object({
    year: z.string().optional(), 
    title: z.string().optional(),
    items: z.array(z.any()).default([]), 
  }).passthrough()).default([]),
});

// ==========================================
// 6. People Schema
// ==========================================
export const PersonSchema = z.object({
  id: IdSchema, 
  name: z.string(), 
  role: z.string(), 
  locality: z.string(), 
  bio: z.string(), 
  photo: z.string().optional(),
});
export const PeopleDataSchema = z.object({ people: z.array(PersonSchema) });

// ==========================================
// 7. Categories Schema
// ==========================================
export const CategorySchema = z.object({
  id: IdSchema, 
  title: z.string(), 
  icon: z.string(), 
  description: z.string(),
});
export const CategoriesDataSchema = z.object({ categories: z.array(CategorySchema) });

// ==========================================
// 8. Directory Schema (NEW)
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
});

export const DirectoryDataSchema = z.object({
  categories: z.array(z.object({ id: z.string(), title: z.string(), icon: z.string() })),
  items: z.array(DirectoryItemSchema),
});

// ==========================================
// TypeScript Types Export
// ==========================================
export type MasterConfig = z.infer<typeof MasterSchema>;
export type Article = z.infer<typeof ArticleSchema>;
export type Media = z.infer<typeof MediaSchema>;
export type VisionData = z.infer<typeof VisionSchema>;
export type Person = z.infer<typeof PersonSchema>;
export type PeopleData = z.infer<typeof PeopleDataSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type CategoriesData = z.infer<typeof CategoriesDataSchema>;

// Directory Types
export type DirectoryItem = z.infer<typeof DirectoryItemSchema>;
export type DirectoryData = z.infer<typeof DirectoryDataSchema>;