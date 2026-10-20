import type { MinimarkTree } from "minimark";

export type CaptionBody = MinimarkTree | (MinimarkTree | null)[];

/** Keep precompiled captions in sync with the document's figure numbering. */
export function renumberCaptionBody(
    body: MinimarkTree | null | undefined,
    caption: unknown,
): MinimarkTree | null | undefined {
    if (!body || typeof caption !== "string") return body;
    const prefix = caption.match(/^Fig\. \d+ \| /)?.[0];
    if (!prefix) return body;

    const value = [...body.value];
    const paragraph = value[0];
    if (!Array.isArray(paragraph) || paragraph[0] !== "p") return body;

    function text(node: unknown): string {
        return typeof node === "string"
            ? node
            : Array.isArray(node)
              ? node.slice(2).map(text).join("")
              : "";
    }

    let remaining =
        text(paragraph).match(
            /^\s*Fig(?:ure)?\.?\s*\d+\.?\s*(?:[|:：—–-]\s*)?/i,
        )?.[0].length ?? 0;

    function strip(node: (typeof value)[number]): (typeof value)[number] {
        if (remaining === 0) return node;
        if (typeof node === "string") {
            const count = Math.min(remaining, node.length);
            remaining -= count;
            return node.slice(count);
        }
        const [tag, props, ...children] = node;
        const stripped = children.map(strip).filter((child) => child !== "");
        return stripped.length ? [tag, props, ...stripped] : "";
    }

    const children = paragraph.slice(2) as (typeof value)[number][];
    value[0] = [
        "p",
        paragraph[1],
        prefix,
        ...children.map(strip).filter((child) => child !== ""),
    ];
    return { ...body, value };
}
