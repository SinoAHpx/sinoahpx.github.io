import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			// Allow description to be omitted or explicitly set to null/empty.
			// Downstream, this will surface as `string | undefined`.
			description: z
				.string()
				.optional()
				.nullable()
				.transform((value) => {
					if (value == null) return undefined;
					const trimmed = value.trim();
					return trimmed === '' ? undefined : trimmed;
				}),
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
			// Whether to show the table of contents sidebar.
			toc: z.boolean().optional().default(true),
		}),
});

// Generic content pages (e.g. /about) live in `src/content/pages`.
const pages = defineCollection({
	loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		// Page descriptions may be omitted or explicitly null/empty.
		// This will be exposed as `string | undefined`.
		description: z
			.string()
			.optional()
			.nullable()
			.transform((value) => {
				if (value == null) return undefined;
				const trimmed = value.trim();
				return trimmed === '' ? undefined : trimmed;
			}),
		date: z.coerce.date(),
		// Route where this page should be mounted, e.g. "/about".
		route: z.string().optional(),
		// Text label for header navigation; falls back to title when omitted.
		navLabel: z.string().optional(),
		// Sort order for header navigation.
		navOrder: z.number().optional(),
		// Whether to show this page in the header navigation.
		showInNav: z.boolean().optional(),
		// Whether to show the table of contents sidebar.
		toc: z.boolean().optional().default(true),
	}),
});

export const collections = { blog, pages };
