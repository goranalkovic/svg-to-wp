import { optimize, extendDefaultPlugins } from './svgo';

export const svgOptimize = (input, options) => {
    const {
        colorToReplace,
        replaceColor,
        jsxifyAttributes,
        doubleToSingleQuotes,
        addMissingFillNone,
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
    }

    if (doubleToSingleQuotes) {
        output = output.replaceAll('"', "'");
    }

    if (jsxifyAttributes) {
        const allMatches = output.matchAll(/([a-z]+\-[a-z]+)/g);

        for (const match of allMatches) {
            const startIndex = match.index;
            const endIndex = match.index + match[0].length;
            const targetWord = snakeToCamel(match[0]);

            output = `${output.slice(0, startIndex)}${targetWord}${output.slice(
                endIndex
            )}`;
        }
    }

    if (addMissingFillNone) {
        const skeleton = output.match(/(<svg.+'>|<\/svg>)/g);
        const beginning = skeleton[0];
        const end = skeleton[1];

        let middle = '';

        const outputWithoutSkeleton = output.replace(beginning, '').replace(end, '').replaceAll('><', '>{}<');

        console.log(outputWithoutSkeleton);

        const allMatches = outputWithoutSkeleton.split('{}');

        for (const match of allMatches) {
            if (match.includes('fill=')) {
                middle += match;
                continue;
            }

            console.log(match);
            middle += match.replace(/\/>$/g, " fill='none'\\>");
        }

        console.log(middle);

        output = `${beginning}${middle}${end}`.replaceAll('  ', ' ');
    }

    return output;
};

const snakeToCamel = (str) =>
    str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replace('-', '').replace('_', '')
    );