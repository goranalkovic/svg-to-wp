import { optimize, extendDefaultPlugins } from './svgo';

export const svgOptimize = (input, options) => {
    const {
        colorToReplace,
        replaceColor,
        jsxifyAttributes,
        doubleToSingleQuotes,
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
        const matchAll = output.matchAll(/([a-z]+\-[a-z]+)/g);

        for (const match of matchAll) {
            const startIndex = match.index;
            const endIndex = match.index + match[0].length;
            const targetWord = snakeToCamel(match[0]);

            output = `${output.slice(0, startIndex)}${targetWord}${output.slice(
                endIndex
            )}`;
        }
    }

    return output;
};

const snakeToCamel = (str) =>
    str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replace('-', '').replace('_', '')
    );