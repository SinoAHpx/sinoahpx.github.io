import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

import { SITE_TITLE } from '../../consts';
import { fetchSubsetFont } from './font';
import { buildOgTree, type SatoriNode } from './template';

const FONT_FAMILY = 'LXGW WenKai TC';
const SITE_URL_LABEL = 'ahpx.me';
const WIDTH = 1200;
const HEIGHT = 630;

export interface RenderOgInput {
	title: string;
	date: string; // already formatted, e.g. "2026-04-07"
}

export async function renderOgPng(input: RenderOgInput): Promise<Uint8Array> {
	// Build the union of every character that will appear on the card so the
	// Google Fonts subset request comes back with exactly what we need.
	const charset =
		input.title + SITE_TITLE + input.date + SITE_URL_LABEL;

	const fontData = await fetchSubsetFont(FONT_FAMILY, charset);

	const tree: SatoriNode = buildOgTree({
		title: input.title,
		siteName: SITE_TITLE,
		date: input.date,
		siteUrl: SITE_URL_LABEL,
	});

	// Satori's type signature expects a React element, but it accepts the
	// plain object form at runtime. Cast through `unknown` to silence TS.
	const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
		width: WIDTH,
		height: HEIGHT,
		fonts: [
			{
				name: FONT_FAMILY,
				data: fontData,
				weight: 400,
				style: 'normal',
			},
		],
	});

	const png = new Resvg(svg, {
		fitTo: { mode: 'width', value: WIDTH },
	})
		.render()
		.asPng();

	return png;
}
