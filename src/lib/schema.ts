import { z } from "zod";

export const MasterSchema = z.object({
  site: z.object({ name: z.string(), url: z.string().url(), description: z.string() }),
  brand: z.object({ colors: z.record(z.string()), fonts: z.record(z.string()) }),
  nav: z.array(z.object({ label: z.string(), href: z.string(), icon: z.string() })),
  footer: z.any().optional(),
  home: z.any().optional(),
});

export const ArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  categories: z.array(z.string()),
  summary: z.string(),
  hero: z.string().optional(),
  photos: z.array(z.object({ src: z.string(), caption: z.string() })).default([]),
  infobox: z.record(z.string()).optional(),
  lastUpdated: z.string(),
  content: z.array(z.object({ heading: z.string(), text: z.string() })),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  related: z.array(z.string()).default([]),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
  tags: z.array(z.string()).default([]),
});
export const ArticleListSchema = z.object({ articles: z.array(ArticleSchema) });

export const PhotoSchema = z.object({
  id: z.string(), src: z.string(), caption: z.string(), category: z.string(), year: z.string(),
});
export const TimelineEventSchema = z.object({
  id: z.string(), year: z.string(), sortKey: z.number(), era: z.string(),
  title: z.string(), description: z.string(), category: z.string(),
  icon: z.string().optional(), article: z.string().optional(),
});
export const MediaSchema = z.object({
  gallery: z.object({
    categories: z.array(z.object({ id: z.string(), title: z.string(), icon: z.string() })),
    photos: z.array(PhotoSchema),
  }),
  timeline: z.array(TimelineEventSchema),
  eras: z.array(z.object({ id: z.string(), title: z.string(), subtitle: z.string(), color: z.string() })),
  landmarks: z.array(z.any()).optional(),
});

export const VisionSchema = z.object({
  intro: z.string(),
  priorities: z.array(z.object({
    id: z.string(), number: z.string(), title: z.string(), ward: z.string(),
    category: z.string(), status: z.string(), targetYear: z.number(),
    present: z.object({ photo: z.string(), caption: z.string() }),
    required: z.object({ photo: z.string(), caption: z.string() }),
    reality: z.string(), vision: z.string(),
    how: z.object({ scheme: z.string(), cost: z.string(), authority: z.string(), timeline: z.string() }),
    community: z.array(z.string()),
    inside: z.object({
      intro: z.string(),
      photos: z.array(z.object({ src: z.string(), caption: z.string() })),
      checklist: z.array(z.string()),
    }),
  })),
  achievements: z.array(z.any()),
  roadmap: z.array(z.any()),
});

export const PersonSchema = z.object({
  id: z.string(), name: z.string(), role: z.string(),
  locality: z.string(), bio: z.string(), photo: z.string().optional(),
});
export const PeopleDataSchema = z.object({ people: z.array(PersonSchema) });

// 👇 Naya Category Schema
export const CategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  icon: z.string(),
  description: z.string(),
});
export const CategoriesDataSchema = z.object({ categories: z.array(CategorySchema) });

// Types
export type MasterConfig = z.infer<typeof MasterSchema>;
export type Article = z.infer<typeof ArticleSchema>;
export type Media = z.infer<typeof MediaSchema>;
export type VisionData = z.infer<typeof VisionSchema>;
export type Person = z.infer<typeof PersonSchema>;
export type PeopleData = z.infer<typeof PeopleDataSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type CategoriesData = z.infer<typeof CategoriesDataSchema>;