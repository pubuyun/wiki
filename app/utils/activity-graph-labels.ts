export interface GraphLabelBox {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface GraphLabelNode {
    id: string;
    x: number;
    y: number;
    radius: number;
    width: number;
    height: number;
    insideWidth?: number;
    insideHeight?: number;
}
export interface GraphLabelPlacement extends GraphLabelBox {
    id: string;
    inside: boolean;
}

/** Labels keep their measured CSS font size; only their position changes. */
export function layoutActivityLabels(
    nodes: GraphLabelNode[],
    bounds: { width: number; height: number },
    obstacles: GraphLabelBox[],
): GraphLabelPlacement[] {
    if (!bounds.width || !bounds.height) return [];
    const gap = 6;
    const axisX = (606 / 1300) * bounds.width;
    const axisY = (527 / 1080) * bounds.height;
    const clamp = (n: number, low: number, high: number) =>
        Math.max(low, Math.min(n, high));
    const intersects = (a: GraphLabelBox, b: GraphLabelBox) =>
        a.x < b.x + b.width + gap &&
        a.x + a.width + gap > b.x &&
        a.y < b.y + b.height + gap &&
        a.y + a.height + gap > b.y;
    const touchesCircle = (box: GraphLabelBox, circle: GraphLabelNode) =>
        Math.hypot(
            circle.x - clamp(circle.x, box.x, box.x + box.width),
            circle.y - clamp(circle.y, box.y, box.y + box.height),
        ) <
        circle.radius + gap;
    const inside: GraphLabelPlacement[] = [];
    const outside: GraphLabelNode[] = [];
    for (const node of nodes) {
        const sizes = [
            { width: node.width, height: node.height },
            ...(node.insideWidth && node.insideHeight
                ? [{ width: node.insideWidth, height: node.insideHeight }]
                : []),
        ];
        const box = sizes
            .flatMap(({ width, height }) =>
                [0, height / 2 + gap, -height / 2 - gap].map((offset) => ({
                    id: node.id,
                    x: node.x - width / 2,
                    y: node.y - height / 2 + offset,
                    width,
                    height,
                    inside: true,
                })),
            )
            .find(
                (box) =>
                    Math.hypot(
                        box.width / 2,
                        Math.max(
                            Math.abs(box.y - node.y),
                            Math.abs(box.y + box.height - node.y),
                        ),
                    ) <=
                        node.radius - gap &&
                    !nodes.some(
                        (other) =>
                            other.id !== node.id && touchesCircle(box, other),
                    ) &&
                    !obstacles.some((other) => intersects(box, other)),
            );
        if (box) inside.push(box);
        else outside.push(node);
    }
    type Candidate = GraphLabelPlacement & { cost: number };
    type Segment = { x1: number; y1: number; x2: number; y2: number };
    const byId = new Map(nodes.map((node) => [node.id, node]));
    const connector = (box: GraphLabelPlacement): Segment => {
        const node = byId.get(box.id)!;
        const x2 = clamp(node.x, box.x, box.x + box.width);
        const y2 = clamp(node.y, box.y, box.y + box.height);
        const d = Math.hypot(x2 - node.x, y2 - node.y) || 1;
        return {
            x1: node.x + ((x2 - node.x) / d) * node.radius,
            y1: node.y + ((y2 - node.y) / d) * node.radius,
            x2,
            y2,
        };
    };
    const crosses = (a: Segment, b: Segment) => {
        const side = (x: number, y: number, line: Segment) =>
            (line.x2 - line.x1) * (y - line.y1) -
            (line.y2 - line.y1) * (x - line.x1);
        return (
            side(a.x1, a.y1, b) * side(a.x2, a.y2, b) < 0 &&
            side(b.x1, b.y1, a) * side(b.x2, b.y2, a) < 0
        );
    };
    const crossesBox = (line: Segment, box: GraphLabelBox) =>
        crosses(line, {
            x1: box.x,
            y1: box.y,
            x2: box.x + box.width,
            y2: box.y,
        }) ||
        crosses(line, {
            x1: box.x,
            y1: box.y + box.height,
            x2: box.x + box.width,
            y2: box.y + box.height,
        }) ||
        crosses(line, {
            x1: box.x,
            y1: box.y,
            x2: box.x,
            y2: box.y + box.height,
        }) ||
        crosses(line, {
            x1: box.x + box.width,
            y1: box.y,
            x2: box.x + box.width,
            y2: box.y + box.height,
        });
    const candidates = new Map<string, Candidate[]>();
    for (const node of outside) {
        const { width, height } = node;
        const positions: number[][] = [];
        for (const offset of [gap, gap + 12, gap + 24, gap + 48]) {
            const r = node.radius + offset;
            positions.push(
                [node.x - width / 2, node.y - r - height],
                [node.x + r, node.y - height / 2],
                [node.x - r - width, node.y - height / 2],
                [node.x - width / 2, node.y + r],
                [node.x + r * 0.71, node.y - r * 0.71 - height],
                [node.x - r * 0.71 - width, node.y - r * 0.71 - height],
                [node.x + r * 0.71, node.y + r * 0.71],
                [node.x - r * 0.71 - width, node.y + r * 0.71],
            );
        }
        for (let y = gap; y <= bounds.height - height - gap; y += 16)
            for (let x = gap; x <= bounds.width - width - gap; x += 16)
                positions.push([x, y]);
        const options: Candidate[] = positions.flatMap(([px, py]) => {
            const box: GraphLabelPlacement = {
                id: node.id,
                x: clamp(px!, gap, bounds.width - width - gap),
                y: clamp(py!, gap, bounds.height - height - gap),
                width,
                height,
                inside: false,
            };
            const circleHits = nodes.filter((other) =>
                touchesCircle(box, other),
            ).length;
            const axisHits = obstacles.filter((other) =>
                intersects(box, other),
            ).length;
            if (circleHits || axisHits) return [];
            const quadrantChanges =
                Number(
                    Math.abs(node.x - axisX) > node.radius + width / 2 + gap &&
                        (node.x - axisX) * (box.x + width / 2 - axisX) < 0,
                ) +
                Number(
                    Math.abs(node.y - axisY) > node.radius + height / 2 + gap &&
                        (node.y - axisY) * (box.y + height / 2 - axisY) < 0,
                );
            const distance = Math.max(
                0,
                Math.hypot(
                    node.x - clamp(node.x, box.x, box.x + width),
                    node.y - clamp(node.y, box.y, box.y + height),
                ) - node.radius,
            );
            return [
                {
                    ...box,
                    cost:
                        quadrantChanges * 1e9 +
                        distance * distance +
                        Math.max(0, distance - 64) ** 2 * 100,
                },
            ];
        });
        // Preserve distinct alternatives, not dozens of almost-identical
        // positions. The joint search can then move a neighbour out of the way.
        const cells = new Set<string>();
        candidates.set(
            node.id,
            options
                .sort((a, b) => a.cost - b.cost)
                .filter((box) => {
                    const cell =
                        Math.round(box.x / 16) + "," + Math.round(box.y / 16);
                    if (cells.has(cell)) return false;
                    cells.add(cell);
                    return true;
                }),
        );
    }
    // Retain alternatives for the whole cluster rather than committing a
    // greedy position that forces a later label into another quadrant.
    const density = (node: GraphLabelNode) =>
        nodes.filter(
            (other) => Math.hypot(node.x - other.x, node.y - other.y) < 180,
        ).length;
    const orders = [
        [...outside].sort(
            (a, b) =>
                density(b) - density(a) ||
                b.width * b.height - a.width * a.height,
        ),
        [...outside].sort((a, b) => a.y - b.y || b.x - a.x),
        [...outside].sort((a, b) => b.width * b.height - a.width * a.height),
    ];
    let best: GraphLabelPlacement[] = [];
    let bestScore = Infinity;
    // Overlap is a hard constraint. Widen the search if the nearest anchors
    // cannot fit the cluster, rather than returning overlapping labels.
    for (const limit of [64, 256, Infinity]) {
        for (const order of orders) {
            let beam = [{ placed: [...inside], cost: 0 }];
            for (const node of order) {
                const next: typeof beam = [];
                for (const state of beam) {
                    for (const box of candidates
                        .get(node.id)!
                        .slice(0, limit)) {
                        if (
                            state.placed.some((other) => intersects(box, other))
                        )
                            continue;
                        let cost = state.cost + box.cost;
                        const line = connector(box);
                        for (const other of state.placed) {
                            if (crossesBox(line, other)) cost += 1e5;
                            if (!other.inside) {
                                const otherLine = connector(other);
                                if (crossesBox(otherLine, box)) cost += 1e5;
                                if (crosses(line, otherLine)) cost += 1e3;
                            }
                        }
                        next.push({ placed: [...state.placed, box], cost });
                    }
                }
                beam = next.sort((a, b) => a.cost - b.cost).slice(0, 48);
                if (!beam.length) break;
            }
            if (
                beam[0]?.placed.length === nodes.length &&
                beam[0].cost < bestScore
            ) {
                best = beam[0].placed;
                bestScore = beam[0].cost;
            }
        }
        if (best.length === nodes.length && (bestScore < 1e9 || limit >= 256))
            break;
    }
    return best;
}

function luminance(hex: string) {
    const rgb = hex
        .replace("#", "")
        .match(/.{2}/g)!
        .map((channel) => {
            const v = parseInt(channel, 16) / 255;
            return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        });
    return rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722;
}
export function activityContrastRatio(first: string, second: string) {
    const a = luminance(first),
        b = luminance(second);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
export function activityTextColor(background: string) {
    const dark = "#00111b",
        light = "#ffffff";
    return activityContrastRatio(background, dark) >=
        activityContrastRatio(background, light)
        ? dark
        : light;
}
