export const concat = (strings: string[], delim = ',', spaceStart = true) =>
    strings.reduce(
        (result, part) =>
            result.concat(part ? (result ? delim : spaceStart ? ' ' : '') + part : ''),
        ''
    );
