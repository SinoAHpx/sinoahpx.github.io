// Fetch a subsetted font from Google Fonts at build time.
//
// Google Fonts' CSS API supports a `text=` parameter that performs server-side
// subsetting: it returns a single font file containing only the glyphs needed
// for the requested characters. This lets us ship a tiny font payload to
// Satori without bundling or downloading the full LXGW WenKai TC TTF.

const CSS_ENDPOINT = 'https://fonts.googleapis.com/css2';

// Satori does not accept WOFF2; it understands TTF, OTF, and WOFF. Google
// Fonts content-negotiates the file format from the User-Agent header — a
// pre-WOFF2 Firefox UA reliably returns plain WOFF, which Satori parses
// directly without any decompression step on our side.
const USER_AGENT =
	'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0';

async function fetchCss(family: string, text: string): Promise<string> {
	const url = `${CSS_ENDPOINT}?family=${encodeURIComponent(family)}&text=${encodeURIComponent(text)}`;
	const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
	if (!res.ok) {
		throw new Error(
			`Google Fonts CSS fetch failed (${res.status} ${res.statusText}) for ${family}`,
		);
	}
	return await res.text();
}

function extractFontUrl(css: string): string {
	const match = css.match(/url\((https:\/\/[^)]+)\)/);
	if (!match) {
		throw new Error('Could not locate font binary URL in Google Fonts CSS response');
	}
	return match[1];
}

async function fetchBinary(url: string): Promise<ArrayBuffer> {
	const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
	if (!res.ok) {
		throw new Error(
			`Font binary fetch failed (${res.status} ${res.statusText}) for ${url}`,
		);
	}
	return await res.arrayBuffer();
}

export async function fetchSubsetFont(
	family: string,
	text: string,
): Promise<ArrayBuffer> {
	// De-duplicate the character set so the URL stays compact.
	const dedup = Array.from(new Set(text)).join('');
	const css = await fetchCss(family, dedup);
	const fontUrl = extractFontUrl(css);
	return await fetchBinary(fontUrl);
}
