export interface ActivityCalloutPoint {
    id: string;
    x: number;
    y: number;
    radius: number;
    contentHeight?: number;
}
export interface ActivityCalloutBox {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

/** A small beam search keeps alternative placements alive for nearby nodes.
 * Each candidate tries all four sides; the 14px gutter includes the backplate.
 */
export function layoutActivityCallouts(
    points: ActivityCalloutPoint[],
    bounds: { x: number; y: number; width: number; height: number },
): ActivityCalloutBox[] {
    if (!points.length || bounds.width <= 0 || bounds.height <= 0) return [];
    const gap = 14;
    const columns = Math.min(
        points.length,
        Math.max(1, Math.floor((bounds.width + gap) / 240)),
    );
    const rows = Math.ceil(points.length / columns);
    const width = Math.min(260, (bounds.width - gap * (columns - 1)) / columns);
    const maxHeight = (bounds.height - gap * (rows - 1)) / rows;
    if (width <= 0 || maxHeight <= 0) return [];
    const clamp = (n: number, min: number, max: number) =>
        Math.max(min, Math.min(n, max));
    const overlaps = (a: ActivityCalloutBox, b: ActivityCalloutBox) =>
        a.x < b.x + b.width + gap - 0.1 &&
        a.x + a.width + gap - 0.1 > b.x &&
        a.y < b.y + b.height + gap - 0.1 &&
        a.y + a.height + gap - 0.1 > b.y;
    let beam: { cards: ActivityCalloutBox[]; score: number }[] = [
        { cards: [], score: 0 },
    ];
    for (const point of points) {
        const height = Math.min(point.contentHeight ?? maxHeight, maxHeight);
        const next: typeof beam = [];
        for (const state of beam) {
            const r = point.radius + 12;
            const positions = [
                [point.x + r, point.y - height / 2],
                [point.x - r - width, point.y - height / 2],
                [point.x - width / 2, point.y - r - height],
                [point.x - width / 2, point.y + r],
            ];
            const xs = [
                bounds.x,
                bounds.x + bounds.width - width,
                point.x - width / 2,
                ...state.cards.flatMap((c) => [
                    c.x,
                    c.x + c.width + gap,
                    c.x - width - gap,
                ]),
            ];
            const ys = [
                bounds.y,
                bounds.y + bounds.height - height,
                point.y - height / 2,
                ...state.cards.flatMap((c) => [
                    c.y,
                    c.y + c.height + gap,
                    c.y - height - gap,
                ]),
            ];
            for (const x of xs) for (const y of ys) positions.push([x, y]);
            const seen = new Set<string>();
            for (const [px, py] of positions) {
                const c = {
                    id: point.id,
                    x: clamp(px!, bounds.x, bounds.x + bounds.width - width),
                    y: clamp(py!, bounds.y, bounds.y + bounds.height - height),
                    width,
                    height,
                };
                const key = c.x.toFixed(1) + "," + c.y.toFixed(1);
                if (
                    seen.has(key) ||
                    state.cards.some((other) => overlaps(c, other))
                )
                    continue;
                seen.add(key);
                const distance = Math.hypot(
                    point.x - clamp(point.x, c.x, c.x + width),
                    point.y - clamp(point.y, c.y, c.y + height),
                );
                const covered = points.filter(
                    (p) =>
                        Math.hypot(
                            p.x - clamp(p.x, c.x, c.x + width),
                            p.y - clamp(p.y, c.y, c.y + height),
                        ) <
                        p.radius + 4,
                ).length;
                next.push({
                    cards: [...state.cards, c],
                    score: state.score + distance + covered * 1000,
                });
            }
        }
        beam = next.sort((a, b) => a.score - b.score).slice(0, 48);
        if (!beam.length) break;
    }
    if (beam[0]?.cards.length === points.length) return beam[0].cards;
    return points.map((p, i) => ({
        id: p.id,
        x: bounds.x + (i % columns) * (width + gap),
        y: bounds.y + Math.floor(i / columns) * (maxHeight + gap),
        width,
        height: Math.min(p.contentHeight ?? maxHeight, maxHeight),
    }));
}
