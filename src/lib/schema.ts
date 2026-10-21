import { z } from "zod";

// 1. Master Schema (Config & Identity)
export const MasterSchema = z.object({
  site: z.object({
    name: z.string(),
    url: z.string().url(),
    description: z.string(),
  }),
  brand: z.object({
    colors: z.record(z.string()),
    fonts: z.record(z.string()),
  }),
  nav: z.array(z.object({ label: z.string(), href: z.string(), icon: z.string() })),
});

// 2. Article Schema (Wikipedia-style)
export const ArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  categories: z.array(z.string()),
  summary: z.string(),
  hero: z.string().optional(),
  photos: z.array(z.object({ src: z.string(), caption: z.string() })).default([]),
  infobox: z.record(z.string()).optional(), // Key-value pairs
  lastUpdated: z.string(),
  content: z.array(z.object({ heading: z.string(), text: z.string() })),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  related: z.array(z.string()).default([]),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
  tags: z.array(z.string()).default([]),
});

export const ArticleListSchema = z.object({
  articles: z.array(ArticleSchema),
});

// 3. Media & Timeline Schema
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

export const MediaSchema = z.object({
  gallery: z.object({
    categories: z.array(z.object({ id: z.string(), title: z.string(), icon: z.string() })),
    photos: z.array(PhotoSchema),
  }),
  timeline: z.array(TimelineEventSchema),
  eras: z.array(z.object({ id: z.string(), title: z.string(), subtitle: z.string(), color: z.string() })),
});

// Types export kar rahe hain taaki TypeScript ko pata chale
export type Article = z.infer<typeof ArticleSchema>;
export type Media = z.infer<typeof MediaSchema>;
export type MasterConfig = z.infer<typeof MasterSchema>;

// 4. Vision Schema (2035 Manifesto)
export const VisionSchema = z.object({
  intro: z.string(),
  priorities: z.array(z.object({
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
    how: z.object({
      scheme: z.string(),
      cost: z.string(),
      authority: z.string(),
      timeline: z.string(),
    }),
    community: z.array(z.string()),
    inside: z.object({
      intro: z.string(),
      photos: z.array(z.object({ src: z.string(), caption: z.string() })),
      checklist: z.array(z.string()),
    }),
  })),
  achievements: z.array(z.object({
    id: z.string(),
    icon: z.string(),
    title: z.string(),
    cost: z.string(),
    date: z.string(),
    by: z.string(),
    description: z.string(),
  })),
  roadmap: z.array(z.object({
    phase: z.number(),
    label: z.string(),
    title: z.string(),
    focus: z.string(),
    items: z.array(z.object({ icon: z.string(), title: z.string(), description: z.string() })),
  })),
});

export type VisionData = z.infer<typeof VisionSchema>;