import { optimize, extendDefaultPlugins } from './svgo';

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
        plugins: extendDefaultPlugins([{
            name: 'cleanupListOfValues',
            active: false
        },
        {
            name: 'convertStyleToAttrs',
            active: false
        },
        {
            name: 'removeViewBox',
            active: false
        }
        ])
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
        const allMatches = output.matchAll(/(?!\ )([a-z\-]*\-+[a-z]*)(?=\=)/g);

        let count = 0;

        for (const match of allMatches) {
            const startIndex = match.index;
            const endIndex = match.index + match[0].length;
            const targetWord = snakeToCamel(match[0]);

            output = `${output.slice(0, startIndex - count)}${targetWord}${output.slice(
                endIndex - count
            )}`;

            count++;
        }
    }

    if (addMissingFillNone) {
        const skeleton = output.match(/(<svg.+'>|<\/svg>)/g);
        const beginning = skeleton[0];
        const end = skeleton[1];

        let middle = '';

        const outputWithoutSkeleton = output.replace(beginning, '').replace(end, '').replaceAll('><', '>{}<');

        const allMatches = outputWithoutSkeleton.split('{}');

        for (const match of allMatches) {
            if (match.includes('fill=')) {
                middle += match;
                continue;
            }

            middle += match.replace(/\/>$/g, " fill=\"none\"/>");
        }

        output = `${middle}${skeleton}`.replaceAll('  ', ' ');
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

const snakeToCamel = (str) =>
    str
        .toLowerCase()
        .replace(/([-_][a-z])/g, (group) =>
            group.toUpperCase().replace('-', '').replace('_', '')
        );

const randomId = () => {
    if (!window.crypto.randomUUID) {
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