export function fromDegree(angle) {
    return (angle * Math.PI / 180) % (2 * Math.PI)
}


async function loadJSON(url) {
    return await fetch(url)
        .then(res => res.json())
        .catch(err => {
            throw err
        });

}

export async function loadReplay(url) {
    const replay = await loadJSON(url);
    replay.frames.sort(function (x, y) {
        if (x.time > y.time)
            return 1;
        if (x.time < y.time)
            return -1;

        return 0;
    });
    return replay;

}
