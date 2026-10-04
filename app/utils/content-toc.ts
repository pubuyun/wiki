interface ToCLink {
    id: string;
    depth: number;
    text: string;
    children?: ToCLink[];
}

interface ContentBody {
    children?: unknown[];
    value?: unknown[];
    toc?: { links?: ToCLink[] };
}

function nodeTag(node: unknown): string | undefined {
    if (Array.isArray(node)) return node[0];
    if (node && typeof node === "object" && "tag" in node) {
        return String(node.tag);
    }
}

function nodeProps(node: unknown): Record<string, unknown> | undefined {
    if (Array.isArray(node)) return node[1];
    if (node && typeof node === "object" && "props" in node) {
        return node.props as Record<string, unknown>;
    }
}

export function isCollapsibleParagraph(node: unknown): boolean {
    return [
        "collapsible-paragraph",
        "content-components-collapsible-paragraph",
    ].includes(nodeTag(node) ?? "");
}

export function contentTocLinks(body?: ContentBody | null): ToCLink[] {
    const links = [...(body?.toc?.links ?? [])];
    const children = body?.children ?? body?.value ?? [];

    for (const [index, child] of children.entries()) {
        if (!isCollapsibleParagraph(child)) continue;

        const { id, title } = nodeProps(child) ?? {};
        if (typeof id !== "string" || typeof title !== "string") continue;
        if (links.some((link) => link.id === id)) continue;

        const nextHeading = children
            .slice(index + 1)
            .find((node) => nodeTag(node) === "h2");
        const nextId = nodeProps(nextHeading)?.id;
        const nextIndex = links.findIndex((link) => link.id === nextId);

        links.splice(nextIndex < 0 ? links.length : nextIndex, 0, {
            id,
            depth: 2,
            text: title,
        });
    }

    return links;
}
