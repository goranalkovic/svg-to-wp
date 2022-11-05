// @ts-ignore
import { optimize } from 'https://cdn.jsdelivr.net/npm/svgo@3.0.0/dist/svgo.browser.js';
import { addFillNone, svg2jsx } from './helpers';

export const svgOptimize = (input, options) => {
	const {
		colorToReplace,
		replaceColor,
		jsxifyAttributes,
		doubleToSingleQuotes,
		addMissingFillNone,
		assignRandomIds,
	} = options;

	const result = optimize(input, {
		multipass: true,
		plugins: [
			{
				name: 'preset-default',
				params: {
					overrides: {
						removeViewBox: false,
						cleanupNumericValues: false,
					}
				}
			},
		]
	});

	const { data } = result;

	if (!data) {
		return '';
	}

	let output = data;

	if (replaceColor) {
		const target = 'currentColor';

		output = data
			.replaceAll(colorToReplace, target)
			.replaceAll(colorToReplace.toLowerCase(), target)
			.replaceAll(colorToReplace.toUpperCase(), target);

		if (colorToReplace.slice(1, 4) === colorToReplace.slice(4, 7)) {
			output = data
				.replaceAll(colorToReplace.slice(0, 4), target)
				.replaceAll(colorToReplace.slice(0, 4).toLowerCase(), target)
				.replaceAll(colorToReplace.slice(0, 4).toUpperCase(), target);
		}
	}

	if (jsxifyAttributes) {
		output = svg2jsx(output);
	}

	if (addMissingFillNone) {
		output = addFillNone(output);
	}

	if (assignRandomIds) {
		const idTags = output.match(/id="(.*?)"|id='(.*?)'/gi);

		if (idTags) {
			for (const match of idTags) {
				const idToReplace = match.slice(4, -1);
				const newId = randomId();

				output = output
					.replaceAll(`id="${idToReplace}"`, `id="${newId}"`)
					.replaceAll(`id='${idToReplace}'`, `id='${newId}'`)
					.replaceAll(`"url(#${idToReplace})"`, `"url(#${newId})"`)
					.replaceAll(`'url(#${idToReplace})'`, `'url(#${newId})'`);
			}
		}
	}

	if (doubleToSingleQuotes) {
		output = output.replaceAll('"', "'");
	}

	return output;
};

const randomId = () => {
	if (!window?.crypto?.randomUUID) {
		const rand = window.crypto.getRandomValues(new Uint32Array(5));
		return [
			rand[0].toString(36),
			rand[1].toString(36),
			rand[2].toString(36),
			rand[3].toString(36)
		].join('-');
	}

	return window.crypto.randomUUID();
}