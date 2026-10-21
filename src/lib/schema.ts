import { z } from 'zod';

export const ArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  summary: z.string(),
  datePublished: z.string().optional(),
  lastUpdated: z.string().optional(),
  hero: z.string().optional(),
  categories: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  infobox: z.record(z.string()).optional(),
  quote: z.object({
    text: z.string(),
    author: z.string().optional(),
    context: z.string().optional()
  }).optional(),
  content: z.array(z.object({
    heading: z.string(),
    text: z.string()
  })),
  faqs: z.array(z.object({
    q: z.string(),
    a: z.string()
  })).optional(),
  photos: z.array(z.object({
    src: z.string(),
    caption: z.string().optional()
  })).optional(),
  related: z.array(z.string()).optional(),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

export type Article = z.infer<typeof ArticleSchema>;