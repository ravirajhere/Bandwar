import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: 'ravirajhere/bandwar-archive', // 👈 Apna GitHub username/repo daalein
  },
  ui: {
    brand: { name: 'Bandwar Admin' },
  },
  collections: {
    articles: collection({
      label: 'Articles',
      slugField: 'title',
      path: 'data/articles/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        metaTitle: fields.text({ label: 'Meta Title (SEO)' }),
        metaDescription: fields.text({ label: 'Meta Description (SEO)', multiline: true }),
        subtitle: fields.text({ label: 'Subtitle' }),
        categories: fields.array(fields.text({ label: 'Category ID' }), { label: 'Categories', itemLabel: props => props.value }),
        summary: fields.text({ label: 'Summary', multiline: true }),
        hero: fields.image({ label: 'Hero Image', directory: 'public/images', publicPath: '/images/' }),
        lastUpdated: fields.date({ label: 'Last Updated' }),
        lastEditedBy: fields.text({ label: 'Edited By' }),
        content: fields.array(
          fields.object({
            heading: fields.text({ label: 'Heading' }),
            text: fields.text({ label: 'Text', multiline: true }),
          }),
          { label: 'Content Blocks', itemLabel: props => props.fields.heading.value }
        ),
        tags: fields.array(fields.text({ label: 'Tag' }), { label: 'Tags', itemLabel: props => props.value }),
      },
    }),
  },
});