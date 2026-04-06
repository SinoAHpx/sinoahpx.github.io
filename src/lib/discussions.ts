/**
 * GitHub Discussions loader.
 *
 * Fetches all discussions in the configured category at build time and
 * caches them by title. The cache is module-scoped, so within a single
 * `astro build` run we hit the GitHub API only once regardless of how
 * many post pages reference it.
 *
 * Auth precedence:
 *   1. GITHUB_DISCUSSIONS_TOKEN (preferred — fine-grained PAT, read-only)
 *   2. GITHUB_TOKEN             (auto-injected in GitHub Actions)
 *   3. unauthenticated          (60 req/hr per IP — fine for occasional dev)
 *
 * Failures (network, auth, rate limit) are logged and surfaced as `null`
 * results so the build never breaks because of comments.
 */

import { DISCUSSIONS } from '../consts';

const GITHUB_GRAPHQL = 'https://api.github.com/graphql';

export type ReactionContent =
	| 'THUMBS_UP'
	| 'THUMBS_DOWN'
	| 'LAUGH'
	| 'HOORAY'
	| 'CONFUSED'
	| 'HEART'
	| 'ROCKET'
	| 'EYES';

export interface ReactionGroup {
	content: ReactionContent;
	count: number;
}

export interface DiscussionAuthor {
	login: string;
	avatarUrl: string;
	url: string;
}

export interface DiscussionComment {
	id: string;
	url: string;
	createdAt: string;
	bodyHTML: string;
	author: DiscussionAuthor | null;
	reactions: ReactionGroup[];
	replies: DiscussionComment[];
}

export interface Discussion {
	id: string;
	number: number;
	title: string;
	url: string;
	createdAt: string;
	reactions: ReactionGroup[];
	comments: DiscussionComment[];
	totalCommentCount: number;
}

interface RawReactionGroup {
	content: ReactionContent;
	reactors: { totalCount: number };
}

interface RawAuthor {
	login: string;
	avatarUrl: string;
	url: string;
}

interface RawComment {
	id: string;
	url: string;
	createdAt: string;
	bodyHTML: string;
	author: RawAuthor | null;
	reactionGroups: RawReactionGroup[];
	replies?: { nodes: RawComment[] };
}

interface RawDiscussion {
	id: string;
	number: number;
	title: string;
	url: string;
	createdAt: string;
	reactionGroups: RawReactionGroup[];
	comments: {
		totalCount: number;
		nodes: RawComment[];
	};
}

interface DiscussionsQueryResponse {
	data?: {
		repository: {
			discussions: {
				pageInfo: { hasNextPage: boolean; endCursor: string | null };
				nodes: RawDiscussion[];
			};
		};
	};
	errors?: Array<{ message: string }>;
}

const QUERY = `
query Discussions($owner: String!, $name: String!, $categoryId: ID!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    discussions(
      first: 50
      categoryId: $categoryId
      after: $cursor
      orderBy: { field: CREATED_AT, direction: DESC }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        number
        title
        url
        createdAt
        reactionGroups {
          content
          reactors {
            totalCount
          }
        }
        comments(first: 100) {
          totalCount
          nodes {
            id
            url
            createdAt
            bodyHTML
            author {
              login
              avatarUrl
              url
            }
            reactionGroups {
              content
              reactors {
                totalCount
              }
            }
            replies(first: 50) {
              nodes {
                id
                url
                createdAt
                bodyHTML
                author {
                  login
                  avatarUrl
                  url
                }
                reactionGroups {
                  content
                  reactors {
                    totalCount
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`;

let cachePromise: Promise<Map<string, Discussion>> | null = null;

function resolveToken(): string | null {
	const env = import.meta.env;
	const token =
		env.GITHUB_DISCUSSIONS_TOKEN ||
		env.GITHUB_TOKEN ||
		process.env.GITHUB_DISCUSSIONS_TOKEN ||
		process.env.GITHUB_TOKEN ||
		null;
	return token && token.length > 0 ? token : null;
}

function normalizeReactions(groups: RawReactionGroup[]): ReactionGroup[] {
	return groups
		.map((g) => ({ content: g.content, count: g.reactors.totalCount }))
		.filter((g) => g.count > 0);
}

function normalizeComment(raw: RawComment): DiscussionComment {
	return {
		id: raw.id,
		url: raw.url,
		createdAt: raw.createdAt,
		bodyHTML: raw.bodyHTML,
		author: raw.author,
		reactions: normalizeReactions(raw.reactionGroups),
		replies: (raw.replies?.nodes ?? []).map(normalizeComment),
	};
}

function normalizeDiscussion(raw: RawDiscussion): Discussion {
	const topLevel = raw.comments.nodes.map(normalizeComment);
	// totalCount on the comments connection only counts top-level comments;
	// add up replies ourselves so the page can show the true total.
	const totalCommentCount = topLevel.reduce(
		(sum, c) => sum + 1 + c.replies.length,
		0,
	);
	return {
		id: raw.id,
		number: raw.number,
		title: raw.title,
		url: raw.url,
		createdAt: raw.createdAt,
		reactions: normalizeReactions(raw.reactionGroups),
		comments: topLevel,
		totalCommentCount,
	};
}

async function fetchAllDiscussions(): Promise<Map<string, Discussion>> {
	const token = resolveToken();
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		Accept: 'application/vnd.github+json',
		'User-Agent': 'ahpxex.github.io-build',
	};
	if (token) headers.Authorization = `Bearer ${token}`;

	const result = new Map<string, Discussion>();
	let cursor: string | null = null;

	while (true) {
		const response = await fetch(GITHUB_GRAPHQL, {
			method: 'POST',
			headers,
			body: JSON.stringify({
				query: QUERY,
				variables: {
					owner: DISCUSSIONS.owner,
					name: DISCUSSIONS.repo,
					categoryId: DISCUSSIONS.categoryId,
					cursor,
				},
			}),
		});

		if (!response.ok) {
			throw new Error(
				`GitHub GraphQL request failed: ${response.status} ${response.statusText}`,
			);
		}

		const payload = (await response.json()) as DiscussionsQueryResponse;
		if (payload.errors && payload.errors.length > 0) {
			throw new Error(
				`GitHub GraphQL errors: ${payload.errors.map((e) => e.message).join('; ')}`,
			);
		}
		if (!payload.data) {
			throw new Error('GitHub GraphQL returned no data');
		}

		const page = payload.data.repository.discussions;
		for (const raw of page.nodes) {
			result.set(raw.title, normalizeDiscussion(raw));
		}

		if (!page.pageInfo.hasNextPage) break;
		cursor = page.pageInfo.endCursor;
	}

	return result;
}

async function getCache(): Promise<Map<string, Discussion>> {
	if (!cachePromise) {
		// Resolve to an empty cache on failure and keep that empty result
		// for the rest of the build. This prevents N retries (one per post
		// page) from hammering the GitHub API and getting us rate-limited.
		// The warning is logged exactly once because the catch only runs
		// the first time the promise settles.
		cachePromise = fetchAllDiscussions().catch((err) => {
			const message = err instanceof Error ? err.message : String(err);
			console.warn(
				`[discussions] failed to load discussions, comments will be hidden for the rest of this build: ${message}`,
			);
			return new Map<string, Discussion>();
		});
	}
	return cachePromise;
}

/**
 * Look up the discussion that backs a given post by its pathname.
 * The pathname must match the discussion title exactly (giscus's
 * `pathname` mapping convention — leading and trailing slash included).
 *
 * Returns `null` if no matching discussion exists OR if the GitHub API
 * call failed (cache will be empty in that case). The caller is expected
 * to render a graceful fallback in either case.
 */
export async function getDiscussionForPathname(
	pathname: string,
): Promise<Discussion | null> {
	const cache = await getCache();
	return cache.get(pathname) ?? null;
}

/**
 * Build the GitHub URL the reader follows when they want to leave a
 * reply. If a discussion already exists we link straight to it; if not,
 * we open the "new discussion" form pre-filled with the right title and
 * category, so the first comment also creates the backing discussion in
 * the same shape giscus would have created it.
 */
export function getReplyUrl(
	pathname: string,
	discussion: Discussion | null,
): string {
	if (discussion) return discussion.url;
	const params = new URLSearchParams({
		category: DISCUSSIONS.categorySlug,
		title: pathname,
	});
	return `https://github.com/${DISCUSSIONS.owner}/${DISCUSSIONS.repo}/discussions/new?${params.toString()}`;
}
