export const concat = (strings: any[], delim = ',', spaceStart = true) =>
    strings.reduce(
        (result, part) =>
            result.concat(part ? (result ? delim : spaceStart ? ' ' : '') + part : ''),
        ''
    );
