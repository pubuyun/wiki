// The wand, painted boundaries, and HTML clip share one coordinate system.
export type PaintPoint = { x: number; y: number };
export type PaintState = { progress: number; phase: number; energy: number };
type Side = -1 | 1;
type Profile = readonly number[];
const TAU = Math.PI * 2;
const n = (value: number) => Math.round(value * 100) / 100;

// Art-directed silhouettes at evenly spaced horizontal stations. The upper
// and lower edges have different crests, but each color follows its own edge.
const TOP_INNER: Profile = [
    0.205, 0.135, 0.19, 0.275, 0.235, 0.145, 0.13, 0.215, 0.255, 0.215, 0.135,
];
const BOTTOM_INNER: Profile = [
    0.78, 0.73, 0.785, 0.87, 0.86, 0.81, 0.835, 0.875, 0.85, 0.823, 0.835,
];
const TOP_WIDTH: Profile = [
    0.135, 0.1, 0.095, 0.1, 0.09, 0.085, 0.08, 0.105, 0.105, 0.1, 0.105,
];
const BOTTOM_WIDTH: Profile = [
    0.16, 0.16, 0.135, 0.09, 0.085, 0.085, 0.12, 0.115, 0.105, 0.09, 0.1,
];

function sample(profile: Profile, x: number) {
    const position = Math.min(1, Math.max(0, x)) * (profile.length - 1);
    const index = Math.min(profile.length - 2, Math.floor(position));
    const t = position - index;
    const a = profile[Math.max(0, index - 1)]!;
    const b = profile[index]!;
    const c = profile[index + 1]!;
    const d = profile[Math.min(profile.length - 1, index + 2)]!;
    return (
        b +
        0.5 *
            t *
            (c -
                a +
                t * (2 * a - 5 * b + 4 * c - d + t * (3 * (b - c) + d - a)))
    );
}

function curve(points: PaintPoint[]) {
    return points
        .slice(1)
        .map((b, i) => {
            const a = points[i]!;
            const before = points[Math.max(0, i - 1)]!;
            const after = points[Math.min(points.length - 1, i + 2)]!;
            return `C${n(a.x + (b.x - before.x) / 6)},${n(a.y + (b.y - before.y) / 6)} ${n(b.x - (after.x - a.x) / 6)},${n(b.y - (after.y - a.y) / 6)} ${n(b.x)},${n(b.y)}`;
        })
        .join(" ");
}

function closed(top: PaintPoint[], bottom: PaintPoint[]) {
    const reversed = [...bottom].reverse();
    return `M${n(top[0]!.x)},${n(top[0]!.y)} ${curve(top)} L${n(reversed[0]!.x)},${n(reversed[0]!.y)} ${curve(reversed)} Z`;
}

// A wide, smooth pigment patch. Zero slope at its ends avoids clipped-looking
// tips, and bounded coverage keeps the foreground from swallowing other colors.
function pigment(x: number, center: number, radius: number) {
    const distance = Math.min(1, Math.abs((x - center) / radius));
    return Math.pow(0.5 + 0.5 * Math.cos(distance * Math.PI), 0.8);
}

export function paintedFrame(width: number, height: number, state: PaintState) {
    const { progress: p, phase } = state;
    const portraitMix = Math.min(1, Math.max(0, (height / width - 0.8) / 0.6));
    const end = -0.82 - 0.22 * portraitMix;
    const tip = {
        x: width * (0.96 + (end - 0.96) * p),
        y: height * (0.53 + 0.055 * Math.sin(p * Math.PI) - 0.015 * p),
    };
    const length = width * 1.12 - tip.x;
    const growth = 0.015 + 0.985 * Math.pow(p, 1.3);
    // Extra samples preserve the broad drawn arcs even when the tip is offscreen.
    const count = height > width ? 64 : 88;
    const samples = Array.from({ length: count + 1 }, (_, i) => i / count);
    const geometry = (u: number, side: Side) => {
        const x = tip.x + length * u;
        const viewportX = x / width;
        const flowPhase = side < 0 ? phase : phase * 0.83 + 1.9;
        const drift = Math.sin(flowPhase) * 0.018;
        const profileX = viewportX + drift;
        const flow =
            Math.sin(viewportX * TAU * 1.35 - flowPhase) * 0.009 +
            Math.sin(viewportX * TAU * 2.1 - flowPhase * 0.7 + side) * 0.003;
        const inner =
            sample(side < 0 ? TOP_INNER : BOTTOM_INNER, profileX) + flow;
        const thickness = sample(side < 0 ? TOP_WIDTH : BOTTOM_WIDTH, profileX);
        const spread = Math.pow(Math.min(1, u / 0.38), 0.72) * growth;
        // Color patches move a little within the common contour, never on
        // unrelated wave frequencies or in opposing directions.
        const pigmentX = profileX + Math.sin(flowPhase + 0.6) * 0.012;
        return { x, inner, thickness, spread, pigmentX };
    };
    type Station = ReturnType<typeof geometry>;
    const stations = {
        top: samples.map((u) => geometry(u, -1)),
        bottom: samples.map((u) => geometry(u, 1)),
    };
    // depth 0 is the navy-facing edge; depth 1 is the paper-facing edge.
    const point = (station: Station, side: Side, depth: number): PaintPoint => {
        const target = station.inner + side * station.thickness * (1 - depth);
        return {
            x: station.x,
            y: tip.y + (height * target - tip.y) * station.spread,
        };
    };
    const ribbon = (depth: number) =>
        closed(
            stations.top.map((station) => point(station, -1, depth)),
            stations.bottom.map((station) => point(station, 1, depth)),
        );
    const bands = (side: Side) => {
        const edge = side < 0 ? stations.top : stations.bottom;
        const strip = (depths: (x: number) => [number, number]) => {
            const limits = edge.map((station) => depths(station.pigmentX));
            return closed(
                edge.map((station, i) => point(station, side, limits[i]![0])),
                edge.map((station, i) => point(station, side, limits[i]![1])),
            );
        };
        return [
            // Pink is an accent on the outer edge, with one broad exposed area.
            strip((x) => {
                const patch = pigment(x, side < 0 ? 0.06 : 0.95, 0.36);
                return [-0.22 * patch, 0.36 * patch];
            }),
            strip(() => [0, 0.38]),
            // Blue establishes one uninterrupted, legible primary ribbon.
            strip((x) => [0.26 + 0.09 * Math.sin(x * TAU * 1.05 + side), 1]),
            // Large green overlaps share the blue inner edge and taper into it.
            strip((x) => {
                const left = pigment(x, 0.1, 0.27) * 0.38;
                const middle = pigment(x, 0.43, 0.23);
                const patch =
                    side < 0
                        ? pigment(x, 0.86, 0.34)
                        : left + middle - left * middle;
                return [1 - patch * 0.96, 1];
            }),
        ];
    };
    return {
        tip,
        angle: 14 - 6 * Math.sin(p * Math.PI),
        yellow: ribbon(0),
        white: ribbon(1),
        bands: [...bands(-1), ...bands(1)],
    };
}
