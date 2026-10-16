import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
    layoutActivityLabels,
    activityTextColor,
    activityContrastRatio,
} from "../app/utils/activity-graph-labels.ts";

const { activities } = JSON.parse(
    readFileSync(
        new URL("../app/data/education/activites.json", import.meta.url),
    ),
);

// Rendered label sizes from the 775.8px-wide plot that previously allowed
// Online discussion group to cover the market analysis lecture label.
const sizes = [
    [128, 48],
    [128, 48],
    [160, 68],
    [160, 68],
    [128, 48],
    [160, 68],
    [128, 68],
    [84.69, 28],
    [128, 48],
    [128, 68],
    [128, 48],
    [86.74, 68],
    [88.91, 68],
    [128, 48],
    [121.25, 28],
    [128, 48],
    [98.84, 28],
    [102.24, 28],
    [101.75, 28],
];
const overlaps = (a, b) =>
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

test("a label that fits when centered is placed inside its circle", () => {
    const [label] = layoutActivityLabels(
        [{ id: "center", x: 150, y: 150, radius: 52, width: 80, height: 40 }],
        { width: 300, height: 300 },
        [],
    );
    assert.equal(label.inside, true);
    assert.equal(label.y + label.height / 2, 150);
});

test("a naturally wrapped label can fit inside without reducing font size", () => {
    const [label] = layoutActivityLabels(
        [
            {
                id: "wrapped",
                x: 150,
                y: 150,
                radius: 60,
                width: 140,
                height: 28,
                insideWidth: 84,
                insideHeight: 56,
            },
        ],
        { width: 300, height: 300 },
        [],
    );
    assert.equal(label.inside, true);
    assert.equal(label.width, 84);
    assert.equal(label.height, 56);
});

test("a label too large for its circle remains outside", () => {
    const [label] = layoutActivityLabels(
        [
            {
                id: "small",
                x: 150,
                y: 150,
                radius: 20,
                width: 128,
                height: 48,
                insideWidth: 64,
                insideHeight: 68,
            },
        ],
        { width: 300, height: 300 },
        [],
    );
    assert.equal(label.inside, false);
    assert.equal(label.width, 128);
});

test("every category uses text with at least 4.5:1 contrast inside circles", () => {
    const { categories } = JSON.parse(
        readFileSync(
            new URL("../app/data/education/activites.json", import.meta.url),
        ),
    );
    for (const { color } of categories)
        assert.ok(
            activityContrastRatio(color, activityTextColor(color)) >= 4.5,
        );
});

for (const width of [760, 775.7858, 800, 840, 900, 1065]) {
    test(`all labels remain unobscured in a ${width}px plot`, () => {
        const height =
            width <= 768 ? 1152 : Math.max(736, (width * 1080) / 1300);
        const nodes = activities.map((activity, i) => ({
            id: activity.nodeId,
            x: (activity.x / 1300) * width,
            y: (activity.y / 1080) * height,
            radius: (activity.size / 2600) * width,
            width: sizes[i][0],
            height: sizes[i][1],
        }));
        const rightWidth = Math.min(160, width * 0.2);
        const obstacles = [
            { x: width * 0.4662 - 40, y: 0, width: 80, height: 40 },
            { x: width * 0.4662 - 40, y: height - 40, width: 80, height: 40 },
            { x: 0, y: height * 0.488 - 20, width: 73.5, height: 40 },
            {
                x: width - rightWidth,
                y: height * 0.488 - 20,
                width: rightWidth,
                height: 40,
            },
            {
                x: (width * 606) / 1300 - 2,
                y: (height * 93) / 1080,
                width: 4,
                height: (height * 879) / 1080,
            },
            {
                x: (width * 165) / 1300,
                y: (height * 527) / 1080 - 2,
                width: (width * 879) / 1300,
                height: 4,
            },
        ];
        const labels = layoutActivityLabels(
            nodes,
            { width, height },
            obstacles,
        );
        assert.equal(
            labels.length,
            nodes.length,
            "every activity keeps its label",
        );
        for (const [i, label] of labels.entries()) {
            assert.ok(label.x >= 0 && label.y >= 0);
            assert.ok(
                label.x + label.width <= width &&
                    label.y + label.height <= height,
            );
            for (const other of labels.slice(i + 1))
                assert.ok(
                    !overlaps(label, other),
                    `${label.id} overlaps ${other.id}`,
                );
            for (const obstacle of obstacles)
                assert.ok(
                    !overlaps(label, obstacle),
                    `${label.id} overlaps an axis`,
                );
            for (const node of nodes) {
                if (label.inside && label.id === node.id) continue;
                const distance = Math.hypot(
                    node.x - clamp(node.x, label.x, label.x + label.width),
                    node.y - clamp(node.y, label.y, label.y + label.height),
                );
                assert.ok(
                    distance >= node.radius,
                    `${label.id} is covered by ${node.id}`,
                );
            }
        }
    });
}
