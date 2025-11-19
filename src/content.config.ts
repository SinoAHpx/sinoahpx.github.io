import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			tags: z
				.union([z.array(z.string()), z.string()])
				.optional()
				.transform((value) => {
					if (!value) return [];
					return Array.isArray(value) ? value : [value];
				}),
			categories: z
				.union([z.array(z.string()), z.string()])
				.optional()
				.transform((value) => {
					if (!value) return [];
					return Array.isArray(value) ? value : [value];
				}),
		}),
});

// Generic content pages (e.g. /about) live in `src/content/pages`.
const pages = defineCollection({
	loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
	}),
});

export const collections = { blog, pages };
