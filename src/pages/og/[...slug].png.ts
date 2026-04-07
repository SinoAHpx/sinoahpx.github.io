import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

import { renderOgPng } from '../../lib/og/render';

export const getStaticPaths: GetStaticPaths = async () => {
	const posts = await getCollection('blog');
	return posts.map((post) => ({
		params: { slug: post.id },
		props: { post },
	}));
};

interface RouteProps {
	post: CollectionEntry<'blog'>;
}

function formatDate(date: Date): string {
	const y = date.getUTCFullYear();
	const m = String(date.getUTCMonth() + 1).padStart(2, '0');
	const d = String(date.getUTCDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export const GET: APIRoute = async ({ props }) => {
	const { post } = props as unknown as RouteProps;

	try {
		const png = await renderOgPng({
			title: post.data.title,
			date: formatDate(post.data.pubDate),
		});

		return new Response(png as unknown as BodyInit, {
			headers: {
				'Content-Type': 'image/png',
				'Cache-Control': 'public, max-age=31536000, immutable',
			},
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.warn(
			`[og] Failed to render OG image for "${post.id}": ${message}`,
		);
		return new Response(`OG generation failed: ${message}`, {
			status: 500,
		});
	}
};
