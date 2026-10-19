import { readFile, readdir, writeFile } from "node:fs/promises";

// Run after adding/replacing panel images so SSR can reserve their actual size.
const root = new URL("../", import.meta.url);
const content = new URL("content/", root);
const sources = new Set();
for (const file of await readdir(content, { recursive: true })) {
    if (!file.endsWith(".md")) continue;
    const markdown = await readFile(
        new URL(file.replaceAll("\\", "/"), content),
        "utf8",
    );
    for (const block of markdown.matchAll(
        /::content-components-(?:bilingual-image-panels|lightbox-panels)\r?\n---\r?\n([\s\S]*?)\r?\n---/g,
    )) {
        for (const line of block[1].matchAll(/^src(?:En|Zh)?:\s*(.+)$/gm)) {
            for (const url of line[1].matchAll(/https:\/\/[^"\s\],]+/g)) {
                sources.add(url[0]);
            }
        }
    }
}

const dimensions = {};
const queue = [...sources].sort();
await Promise.all(
    Array.from({ length: 8 }, async () => {
        while (queue.length) {
            const src = queue.shift();
            if (!new URL(src).pathname.endsWith(".avif")) {
                throw new Error(`Add a dimension reader for: ${src}`);
            }
            const response = await fetch(src, {
                headers: { Range: "bytes=0-16383" },
                signal: AbortSignal.timeout(30_000),
            });
            if (!response.ok) throw new Error(`${response.status}: ${src}`);
            const bytes = Buffer.from(await response.arrayBuffer());
            // AVIF's ImageSpatialExtentsProperty contains the intrinsic dimensions.
            const offset = bytes.indexOf("ispe");
            if (
                offset < 4 ||
                offset + 16 > bytes.length ||
                bytes.readUInt32BE(offset - 4) !== 20
            ) {
                throw new Error(`Missing AVIF image dimensions: ${src}`);
            }
            const size = [
                bytes.readUInt32BE(offset + 8),
                bytes.readUInt32BE(offset + 12),
            ];
            if (size.some((value) => value <= 0))
                throw new Error(`Invalid dimensions: ${src}`);
            dimensions[src] = size;
        }
    }),
);

await writeFile(
    new URL("app/data/panel-image-dimensions.json", root),
    JSON.stringify(
        Object.fromEntries(Object.entries(dimensions).sort()),
        null,
        2,
    ) + "\n",
);
console.log(`Recorded dimensions for ${sources.size} panel images.`);
