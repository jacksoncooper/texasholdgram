import paths from './paths/paths.txt';

type Round = {
    words: Set<string>,
    next: string | null,
};

type Path = Round[];

function fetchDaily(): Promise<{ identifier: number, path: Path } | null>
{
    // The response is always decoded using UTF-8.
    // https://developer.mozilla.org/en-US/docs/Web/API/Response/text

    return fetch(paths)
        .then(response => response.text())
        .then(text => {
            let path = selectPath(text.trim().split('\n'));
            return {
                identifier: path.identifier,
                path: path.path,
            };
        })
        .catch(_ => Promise.resolve(null)); // Whee error handling.
}

function daysFromEpoch(): { days: number, from: Date }
{
    let epoch = new Date(1970, 4, 30);
    let today = new Date();

    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);

    let millisecondsInDay = 24 * 60 * 60 * 1000;
    return {
        days: Math.floor((today.valueOf() - epoch.valueOf()) / millisecondsInDay),
        from: epoch
    };
}

function selectPath(paths: string[]): { identifier: number, path: Path }
{
    let { days, from } = daysFromEpoch();
    let offset = (from.valueOf() + days) % paths.length;

    return {
        identifier: offset + 1,
        path: parsePath(paths[offset]),
    };
}

function parseRound(text: string): Round
{
    // e.g. `{alp, lap, pal} + e` or `{leap, pale, peal, plea}`
    let [members, maybe_next] = text.split(' + ');
    let words = new Set(members.substring(1, members.length - 1).split(', '));
    let next = (maybe_next === undefined) ? null : maybe_next;
    return { words, next };
}

function parsePath(text: string): Path
{
    // e.g. `{alp, lap, pal} + e -> {leap, pale, peal, plea}`

    let rounds = text.split(' -> ');
    let path = [];

    for (let round of rounds) {
        path.push(parseRound(round));
    }

    return path;
}

function showRound(round: Round): string
{
    let members = [...round.words].join(', ');

    if (round.next === null) {
        return `{${members}}`;
    }

    return `{${members}} + ${round.next}`;
}

function showPath(path: Path): string
{
    return path.map(showRound).join(' -> ');
}

function shuffleRound(round: Round): string
{
    let words: Iterator<string, undefined> = round.words.values();
    let { value } = words.next();

    console.assert(value !== undefined, 'expect at least one word');

    let word = value as string;

    // TODO: Revisit this, this is awful.
    for (let i = 0; round.words.has(word) && i < 8; ++i) {
        word = shuffle([...word]).join('');
    }

    return word;
}

function shuffle<E>(symbols: E[]): E[]
{
    // Sedgewick's 'Algorithms', fourth edition, page 32.
    // TODO: Why is each index uniformly distributed? Not a clue.

    let n = symbols.length;

    //                 n
    //  0  1  2  3  4  5
    // [a, b, c, d, e] _
    //  i        r       r ∈ 0 + [0, 5) = [0, 5)
    //     i             r ∈ 1 + [0, 4) = [1, 5)
    //        i          r ∈ 2 + [0, 3) = [2, 5)
    //           i       r ∈ 3 + [0, 2) = [3, 5)
    //              i    r ∈ 4 + [0, 1) = [4, 5)

    for (let i = 0; i < n; ++i) {
        let r = i + Math.floor(Math.random() * (n - i));
        [ symbols[i], symbols[r] ] = [ symbols[r], symbols[i] ];
    }

    return symbols;
}


// eslint-disable-next-line
async function* toLines(stream: ReadableStream<Uint8Array>): AsyncGenerator<string, null>
{
    // TODO: Can't stream the file properly because `done` is asserted before the end. Why?

    let reader = stream.getReader()
    let decoder = new TextDecoder('utf-8');
    let decoded = "";

    while(true) {
        let { value, done } = await reader.read();

        let chunk = decoder.decode(value, { stream: !done });
        decoded = decoded + chunk;

        let maybe_newline = decoded.indexOf("\n");
        if (maybe_newline !== -1) {
            let line = decoded.substring(0, maybe_newline);
            yield line;
            decoded = decoded.substring(maybe_newline + 1);
        }

        if (done) {
            break;
        }
    }

    return null;
}

export type { Path, Round };
export { fetchDaily, daysFromEpoch, showPath, showRound, shuffle, shuffleRound };
