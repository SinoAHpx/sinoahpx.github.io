import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { select, input, confirm } from '@inquirer/prompts';

const COLORS = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	dim: '\x1b[2m',
	cyan: '\x1b[36m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
};

function log(message, color = COLORS.reset) {
	console.log(`${color}${message}${COLORS.reset}`);
}

function printUsage() {
	console.log(`Content Creation Wizard

Interactive mode:
  bun run new

Non-interactive examples:
  bun run new -- --type post --title "My Post" --description "Summary" --tags "AI,Writing" --categories "AI"
  bun run new -- --type post --title "My Post" --slug my-post --pub-date "2026-03-12 10:30:00" --force
  bun run new -- --type page --title "About" --route /about --nav-label About --nav-order 1

Options:
  --type <post|page>
  --title <title>
  --description <text>
  --slug <slug>
  --force
  --help

Post options:
  --pub-date "YYYY-MM-DD" | "YYYY-MM-DD HH:MM:SS"
  --tags "tag1,tag2"
  --categories "cat1,cat2"

Page options:
  --date "YYYY-MM-DD"
  --route "/path"
  --nav-label <label>
  --nav-order <number>
  --show-in-nav
  --hide-in-nav
`);
}

function slugify(value) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '') || 'untitled';
}

function formatDateTime(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatDate(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function parseDateTimeInput(value, optionName) {
	const dateRegex = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/;
	if (!dateRegex.test(value)) {
		throw new Error(`Invalid ${optionName} format. Use YYYY-MM-DD or YYYY-MM-DD HH:MM:SS`);
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		throw new Error(`Invalid ${optionName} value: ${value}`);
	}
	return date;
}

function parseDateInput(value, optionName) {
	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (!dateRegex.test(value)) {
		throw new Error(`Invalid ${optionName} format. Use YYYY-MM-DD`);
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		throw new Error(`Invalid ${optionName} value: ${value}`);
	}
	return date;
}

function splitCsv(value) {
	return (value ?? '')
		.split(',')
		.map(item => item.trim())
		.filter(Boolean);
}

function ensureDir(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

function writeBlogFile({ filePath, content, color, force }) {
	if (fs.existsSync(filePath) && !force) {
		throw new Error(`File already exists: ${filePath}. Re-run with --force to overwrite.`);
	}

	fs.writeFileSync(filePath, content, 'utf8');
	log(`\n${COLORS.green}${COLORS.bright}Success!${COLORS.reset}`, COLORS.reset);
	log(`Created: ${color}${filePath}${COLORS.reset}`, COLORS.reset);
}

function buildPostContent({ title, description, pubDate, tags, categories }) {
	const safeTitle = title.replace(/"/g, '\\"');
	const formattedDate = formatDateTime(pubDate);

	let content = `---\ntitle: "${safeTitle}"`;

	if (description.trim()) {
		content += `\ndescription: "${description.replace(/"/g, '\\"')}"`;
	}

	content += `\npubDate: ${formattedDate}`;

	if (tags.length > 0) {
		content += `\ntags: [${tags.map(t => `"${t}"`).join(', ')}]`;
	}

	if (categories.length > 0) {
		content += `\ncategories: [${categories.map(c => `"${c}"`).join(', ')}]`;
	}

	content += `\n---\n\n# ${title}\n\nWrite your post content here.\n`;
	return content;
}

function writePost({ title, description, pubDate, tags, categories, slug, force }) {
	const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
	ensureDir(blogDir);
	const filePath = path.join(blogDir, `${slug}.md`);
	const content = buildPostContent({ title, description, pubDate, tags, categories });
	writeBlogFile({ filePath, content, color: COLORS.cyan, force });
	return filePath;
}

function buildPageContent({ title, description, date, route, showInNav, navLabel, navOrder }) {
	const safeTitle = title.replace(/"/g, '\\"');
	const formattedDate = formatDate(date);

	let content = `---\ntitle: "${safeTitle}"`;

	if (description.trim()) {
		content += `\ndescription: "${description.replace(/"/g, '\\"')}"`;
	}

	content += `\ndate: ${formattedDate}`;
	content += `\nroute: "${route}"`;

	if (showInNav) {
		content += `\nnavLabel: "${navLabel.replace(/"/g, '\\"')}"`;
		content += `\nnavOrder: ${navOrder}`;
		content += `\nshowInNav: true`;
	}

	content += `\n---\n\n# ${title}\n\nWrite your page content here.\n`;
	return content;
}

function writePage({ title, description, date, route, showInNav, navLabel, navOrder, slug, force }) {
	const pagesDir = path.join(process.cwd(), 'src', 'content', 'pages');
	ensureDir(pagesDir);
	const filePath = path.join(pagesDir, `${slug}.md`);
	const content = buildPageContent({ title, description, date, route, showInNav, navLabel, navOrder });
	writeBlogFile({ filePath, content, color: COLORS.magenta, force });
	return filePath;
}

function getCliOptions() {
	const { values } = parseArgs({
		options: {
			type: { type: 'string' },
			title: { type: 'string' },
			description: { type: 'string' },
			slug: { type: 'string' },
			'pub-date': { type: 'string' },
			date: { type: 'string' },
			tags: { type: 'string' },
			categories: { type: 'string' },
			route: { type: 'string' },
			'nav-label': { type: 'string' },
			'nav-order': { type: 'string' },
			'show-in-nav': { type: 'boolean' },
			'hide-in-nav': { type: 'boolean' },
			force: { type: 'boolean' },
			help: { type: 'boolean' },
		},
		allowPositionals: false,
	});

	if (values.help) {
		printUsage();
		process.exit(0);
	}

	if (Object.keys(values).length === 0) {
		return null;
	}

	const type = values.type ?? 'post';
	if (!['post', 'page'].includes(type)) {
		throw new Error(`Invalid --type value: ${type}. Use "post" or "page".`);
	}
	if (!values.title?.trim()) {
		throw new Error('--title is required in non-interactive mode.');
	}

	if (type === 'post') {
		return {
			type,
			title: values.title.trim(),
			description: values.description ?? '',
			pubDate: values['pub-date']
				? parseDateTimeInput(values['pub-date'], '--pub-date')
				: new Date(),
			tags: splitCsv(values.tags),
			categories: splitCsv(values.categories),
			slug: values.slug?.trim() || slugify(values.title),
			force: Boolean(values.force),
		};
	}

	const showInNav = values['hide-in-nav']
		? false
		: values['show-in-nav'] ?? true;
	const navOrder = values['nav-order'] == null ? 0 : Number(values['nav-order']);

	if (Number.isNaN(navOrder)) {
		throw new Error('Invalid --nav-order value. Use a number.');
	}

	return {
		type,
		title: values.title.trim(),
		description: values.description ?? '',
		date: values.date ? parseDateInput(values.date, '--date') : new Date(),
		route: values.route ?? `/${values.slug?.trim() || slugify(values.title)}`,
		showInNav,
		navLabel: values['nav-label'] ?? values.title.trim(),
		navOrder,
		slug: values.slug?.trim() || slugify(values.title),
		force: Boolean(values.force),
	};
}

async function createPost() {
	log('\n=== Creating a New Blog Post ===\n', COLORS.cyan + COLORS.bright);

	const title = await input({
		message: 'Post title:',
		required: true,
		validate: (value) => {
			if (!value.trim()) {
				return 'Title is required';
			}
			return true;
		},
	});

	const description = await input({
		message: 'Description (optional):',
		default: '',
	});

	const useDefaultDate = await confirm({
		message: 'Use current date/time?',
		default: true,
	});

	let pubDate;
	if (useDefaultDate) {
		pubDate = new Date();
	} else {
		const dateInput = await input({
			message: 'Publication date (YYYY-MM-DD HH:MM:SS):',
			default: formatDateTime(new Date()),
			validate: (value) => {
				const dateRegex = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/;
				if (!dateRegex.test(value)) {
					return 'Invalid date format. Use YYYY-MM-DD or YYYY-MM-DD HH:MM:SS';
				}
				return true;
			},
		});
		pubDate = new Date(dateInput);
	}

	const tagsInput = await input({
		message: 'Tags (comma-separated, optional):',
		default: '',
	});

	const categoriesInput = await input({
		message: 'Categories (comma-separated, optional):',
		default: '',
	});

	const tags = tagsInput
		.split(',')
		.map(t => t.trim())
		.filter(t => t);

	const categories = categoriesInput
		.split(',')
		.map(c => c.trim())
		.filter(c => c);

	const customSlug = await confirm({
		message: 'Customize URL slug?',
		default: false,
	});

	let slug;
	if (customSlug) {
		slug = await input({
			message: 'Custom slug:',
			default: slugify(title),
			validate: (value) => {
				if (!value.trim()) {
					return 'Slug cannot be empty';
				}
				return true;
			},
		});
	} else {
		slug = slugify(title);
	}

	const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
	const filePath = path.join(blogDir, `${slug}.md`);

	if (fs.existsSync(filePath)) {
		log(`\nError: File already exists: ${filePath}`, COLORS.yellow);
		const overwrite = await confirm({
			message: 'Overwrite existing file?',
			default: false,
		});
		if (!overwrite) {
			log('\nCancelled.', COLORS.dim);
			process.exit(0);
		}
	}

	writePost({
		title,
		description,
		pubDate,
		tags,
		categories,
		slug,
		force: true,
	});
}

async function createPage() {
	log('\n=== Creating a New Page ===\n', COLORS.magenta + COLORS.bright);

	const title = await input({
		message: 'Page title:',
		required: true,
		validate: (value) => {
			if (!value.trim()) {
				return 'Title is required';
			}
			return true;
		},
	});

	const description = await input({
		message: 'Description (optional):',
		default: '',
	});

	const useDefaultDate = await confirm({
		message: 'Use current date?',
		default: true,
	});

	let date;
	if (useDefaultDate) {
		date = new Date();
	} else {
		const dateInput = await input({
			message: 'Date (YYYY-MM-DD):',
			default: formatDate(new Date()),
			validate: (value) => {
				const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
				if (!dateRegex.test(value)) {
					return 'Invalid date format. Use YYYY-MM-DD';
				}
				return true;
			},
		});
		date = new Date(dateInput);
	}

	const customSlug = await confirm({
		message: 'Customize URL slug?',
		default: false,
	});

	let slug;
	if (customSlug) {
		slug = await input({
			message: 'Custom slug:',
			default: slugify(title),
			validate: (value) => {
				if (!value.trim()) {
					return 'Slug cannot be empty';
				}
				return true;
			},
		});
	} else {
		slug = slugify(title);
	}

	const route = await input({
		message: 'Route path:',
		default: `/${slug}`,
		validate: (value) => {
			if (!value.startsWith('/')) {
				return 'Route must start with /';
			}
			return true;
		},
	});

	const showInNav = await confirm({
		message: 'Show in navigation?',
		default: true,
	});

	let navLabel = title;
	let navOrder = 0;

	if (showInNav) {
		navLabel = await input({
			message: 'Navigation label:',
			default: title,
		});

		const navOrderInput = await input({
			message: 'Navigation order (number):',
			default: '0',
			validate: (value) => {
				if (isNaN(Number(value))) {
					return 'Must be a number';
				}
				return true;
			},
		});
		navOrder = Number(navOrderInput);
	}

	const pagesDir = path.join(process.cwd(), 'src', 'content', 'pages');
	const filePath = path.join(pagesDir, `${slug}.md`);

	if (!fs.existsSync(pagesDir)) {
		fs.mkdirSync(pagesDir, { recursive: true });
	}

	if (fs.existsSync(filePath)) {
		log(`\nError: File already exists: ${filePath}`, COLORS.yellow);
		const overwrite = await confirm({
			message: 'Overwrite existing file?',
			default: false,
		});
		if (!overwrite) {
			log('\nCancelled.', COLORS.dim);
			process.exit(0);
		}
	}

	writePage({
		title,
		description,
		date,
		route,
		showInNav,
		navLabel,
		navOrder,
		slug,
		force: true,
	});
}

async function main() {
	const cliOptions = getCliOptions();

	if (cliOptions) {
		if (cliOptions.type === 'post') {
			writePost(cliOptions);
		} else {
			writePage(cliOptions);
		}
		return;
	}

	log(`${COLORS.bright}${COLORS.blue}╔════════════════════════════════════╗${COLORS.reset}`, COLORS.reset);
	log(`${COLORS.bright}${COLORS.blue}║  Content Creation Wizard          ║${COLORS.reset}`, COLORS.reset);
	log(`${COLORS.bright}${COLORS.blue}╚════════════════════════════════════╝${COLORS.reset}\n`, COLORS.reset);

	const contentType = await select({
		message: 'What would you like to create?',
		choices: [
			{
				name: 'Blog Post (default)',
				value: 'post',
				description: 'Create a new blog post with tags and categories',
			},
			{
				name: 'Page',
				value: 'page',
				description: 'Create a new static page with navigation options',
			},
		],
		default: 'post',
	});

	try {
		if (contentType === 'post') {
			await createPost();
		} else {
			await createPage();
		}
	} catch (error) {
		if (error.name === 'ExitPromptError') {
			log('\nCancelled.', COLORS.dim);
			process.exit(0);
		}
		throw error;
	}
}

main().catch((error) => {
	log(`\nError: ${error.message}`, COLORS.yellow);
	process.exit(1);
});
