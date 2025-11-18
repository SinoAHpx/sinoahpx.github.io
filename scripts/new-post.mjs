import fs from 'node:fs';
import path from 'node:path';

function usage() {
	console.log('Usage: npm run new:post -- \"Post title\" [slug]');
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
		.replace(/^-+|-+$/g, '') || 'post';
}

const slug = slugArg ? slugify(slugArg) : slugify(title);

const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
const filePath = path.join(blogDir, `${slug}.md`);

if (!fs.existsSync(blogDir)) {
	console.error(`Blog content directory not found: ${blogDir}`);
	process.exit(1);
}

if (fs.existsSync(filePath)) {
	console.error(`File already exists: ${filePath}`);
	process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

const content = `---
title: "${title.replace(/"/g, '\\"')}"
description: "Short description of the post."
pubDate: ${today}
tags: []
categories: []
---

# ${title}

Write your post content here.
`;

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Created new post: ${filePath}`);
