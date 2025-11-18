import fs from 'node:fs';
import path from 'node:path';

function usage() {
	console.log('Usage: npm run new:page -- \"Page title\" [slug]');
	process.exit(1);
}

const args = process.argv.slice(2);
if (args.length === 0) {
	usage();
}

const [title, slugArg] = args;

function slugify(value) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '') || 'page';
}

const slug = slugArg ? slugify(slugArg) : slugify(title);

const pagesDir = path.join(process.cwd(), 'src', 'pages');
const filePath = path.join(pagesDir, `${slug}.astro`);

if (!fs.existsSync(pagesDir)) {
	console.error(`Pages directory not found: ${pagesDir}`);
	process.exit(1);
}

if (fs.existsSync(filePath)) {
	console.error(`File already exists: ${filePath}`);
	process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

const content = `---
import Layout from '../layouts/BlogPost.astro';
---

<Layout
	title="${title.replace(/"/g, '\\"')}"
	description="Short description of the page."
	pubDate={new Date('${today}')}
>
	<p>Write your page content here.</p>
</Layout>
`;

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Created new page: ${filePath}`);

