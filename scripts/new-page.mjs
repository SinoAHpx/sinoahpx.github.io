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

const pagesDir = path.join(process.cwd(), 'src', 'content', 'pages');
const filePath = path.join(pagesDir, `${slug}.md`);

if (!fs.existsSync(pagesDir)) {
	fs.mkdirSync(pagesDir, { recursive: true });
}

if (fs.existsSync(filePath)) {
	console.error(`File already exists: ${filePath}`);
	process.exit(1);
}

const safeTitle = title.replace(/"/g, '\\"');

const content = `---
title: "${safeTitle}"
description: "Short description of the page."
route: "/${slug}"
navLabel: "${safeTitle}"
navOrder: 0
showInNav: true
---

# ${title}

Write your page content here.
`;

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Created new page content: ${filePath}`);
