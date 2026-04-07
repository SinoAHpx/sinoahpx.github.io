// Satori accepts a plain object tree shaped like React elements:
//   { type, props: { style, children } }
// We build the tree without JSX so the project does not need a JSX runtime.

type Style = Record<string, string | number>;

export type SatoriNode = {
	type: string;
	props: {
		style?: Style;
		children?: SatoriNode | SatoriNode[] | string;
	};
};

function el(
	type: string,
	style: Style,
	children?: SatoriNode | SatoriNode[] | string,
): SatoriNode {
	return { type, props: { style, children } };
}

export interface OgTemplateInput {
	title: string;
	siteName: string;
	date: string;
	siteUrl: string;
}

// A minimal, ink-toned card. Generous whitespace, a thin rule under the
// title, faint meta in the corners. No decoration beyond typography.
export function buildOgTree(input: OgTemplateInput): SatoriNode {
	const { title, siteName, date, siteUrl } = input;

	const ink = '#1c1c1c';
	const inkFaint = '#9a958c';
	const paper = '#f6f4ee';
	const rule = '#c9c4b8';

	return el(
		'div',
		{
			width: '100%',
			height: '100%',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
			padding: '88px 104px',
			backgroundColor: paper,
			fontFamily: 'LXGW WenKai TC',
			color: ink,
		},
		[
			// Top row: site name
			el(
				'div',
				{
					display: 'flex',
					fontSize: 26,
					color: inkFaint,
					letterSpacing: 4,
				},
				siteName,
			),
			// Middle: title block
			el(
				'div',
				{
					display: 'flex',
					flexDirection: 'column',
					flexGrow: 1,
					justifyContent: 'center',
					paddingTop: 24,
					paddingBottom: 24,
				},
				[
					el(
						'div',
						{
							display: 'flex',
							fontSize: 76,
							lineHeight: 1.4,
							color: ink,
						},
						title,
					),
					el('div', {
						display: 'flex',
						marginTop: 48,
						width: 72,
						height: 1,
						backgroundColor: rule,
					}),
				],
			),
			// Bottom row: date / domain
			el(
				'div',
				{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					fontSize: 24,
					color: inkFaint,
				},
				[
					el('div', { display: 'flex' }, date),
					el('div', { display: 'flex', letterSpacing: 1 }, siteUrl),
				],
			),
		],
	);
}
