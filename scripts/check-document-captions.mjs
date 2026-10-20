import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createJiti } from "jiti";
import { parseMarkdown } from "@nuxtjs/mdc/runtime";
import { fromHast } from "minimark/hast";

// Exercise content transformations directly, without a Nuxt build or server.
const jiti = createJiti(import.meta.url);
const { default: transformer } = await jiti.import(
    resolve("app/utils/build/caption-transformer.ts"),
);
const { numberDocumentFigures } = await jiti.import(
    resolve("app/utils/document-figures.ts"),
);
const { renumberCaptionBody } = await jiti.import(
    resolve("app/utils/document-captions.ts"),
);
const options = { highlight: false, toc: false, contentHeading: false };
const compile = async (text) =>
    fromHast((await parseMarkdown(text, options)).body);

// Equivalent ASTs can split adjacent text nodes differently after numbering.
function normalize(node) {
    if (typeof node === "string") return node;
    const children = [];
    for (const child of node.slice(2).map(normalize)) {
        if (child === "") continue;
        if (typeof child === "string" && typeof children.at(-1) === "string") {
            children[children.length - 1] += child;
        } else children.push(child);
    }
    return [node[0], node[1], ...children];
}

for (const source of [
    "Fig. 8 | **Bold** and *RFdiffusion* [link](https://example.com)",
    "**Fig. 91** | **Description**",
    "Figure 7: text with `code` and 中文",
    "A description without a number",
    "Fig. 6 | A citation :fn-ref{#9} and **bold**",
]) {
    const body = await compile(source);
    const snapshot = JSON.stringify(body);
    const description = source.replace(
        /^\s*(?:\*{1,2})?Fig(?:ure)?\.?\s*\d+\.?(?:\*{1,2})?\s*(?:[|:：—–-]\s*)?/i,
        "",
    );
    const expected = await compile(`Fig. 2 | ${description}`);
    const numbered = renumberCaptionBody(body, `Fig. 2 | ${description}`);
    assert.deepEqual(
        numbered.value.map(normalize),
        expected.value.map(normalize),
    );
    assert.equal(
        JSON.stringify(body),
        snapshot,
        "Numbering mutated its source",
    );
}

let fileCount = 0;
let captionCount = 0;
async function verifyNode(node, filename) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
        node = { tag: node[0], props: node[1], children: node.slice(2) };
    }
    if (node.props?.[":captionBody"]) {
        const body = JSON.parse(node.props[":captionBody"]);
        const caption =
            node.props.caption ??
            node.props.title ??
            JSON.parse(node.props[":caption"] ?? node.props[":title"]);
        const bodies = Array.isArray(body) ? body : [body];
        for (const [index, item] of bodies.entries()) {
            if (!item) continue;
            const expected = await compile(
                Array.isArray(caption) ? caption[index] : caption,
            );
            assert.deepEqual(
                item.value.map(normalize),
                expected.value.map(normalize),
                `${filename}: caption ${index}`,
            );
            captionCount++;
        }
    }
    await Promise.all(
        (node.children ?? node.value ?? []).map((child) =>
            verifyNode(child, filename),
        ),
    );
}

async function verifyDirectory(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const filename = join(directory, entry.name);
        if (entry.isDirectory()) {
            await verifyDirectory(filename);
        } else if (entry.name.endsWith(".md")) {
            const { body } = await parseMarkdown(
                await readFile(filename, "utf8"),
                { highlight: false },
            );
            const content = await transformer.transform({
                body: { ...fromHast(body), toc: { links: [] } },
            });
            assert.deepEqual(content.body.toc, { links: [] });
            await verifyNode(numberDocumentFigures(content.body), filename);
            fileCount++;
        }
    }
}

await verifyDirectory(resolve("content"));
assert.ok(captionCount > 0, "No captions were checked");
console.log(`PASS: ${fileCount} Markdown files, ${captionCount} captions.`);
