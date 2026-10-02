interface ReferenceNode {
    type?: string;
    tag?: string;
    value?: string;
    props?: Record<string, unknown>;
    children?: ReferenceNode[];
}

export interface ReferencePage {
    path: string;
    hasReference: boolean;
    referenceIds: string[];
    citationIds: string[];
}

function nodeText(node: ReferenceNode): string {
    return node.value ?? (node.children ?? []).map(nodeText).join("");
}

export function transformReferenceTree(body: ReferenceNode) {
    const referenceIds = new Set<string>();
    const citationIds = new Set<string>();
    let hasReference = false;
    let inReference = false;

    for (const node of body.children ?? []) {
        if (node.tag === "h1" || node.tag === "h2") {
            inReference =
                node.tag === "h2" && nodeText(node).trim() === "Reference";
            hasReference ||= inReference;
        }
        if (!inReference || node.tag !== "ol") continue;

        let number = Number(node.props?.start ?? 1);
        for (const item of node.children ?? []) {
            if (item.tag !== "li") continue;
            const existing = findNodes(item, "ref-fn")[0];
            const id = String(existing?.props?.id ?? number);
            referenceIds.add(id);
            if (!existing) {
                const children = item.children ?? [];
                const paragraph = children[0]?.tag === "p" ? children[0] : null;
                const content = paragraph?.children ?? children;
                const blockIndex = content.findIndex((child) =>
                    [
                        "p",
                        "ul",
                        "ol",
                        "blockquote",
                        "pre",
                        "table",
                        "div",
                    ].includes(child.tag ?? ""),
                );
                const end = blockIndex < 0 ? content.length : blockIndex;
                const wrapped = [
                    {
                        type: "element",
                        tag: "ref-fn",
                        props: { id },
                        children: content.slice(0, end),
                    },
                    ...content.slice(end),
                ];
                if (paragraph) paragraph.children = wrapped;
                else item.children = wrapped;
            }
            number += 1;
        }
    }

    for (const node of findNodes(body, "fn-ref")) {
        if (node.props?.id != null) citationIds.add(String(node.props.id));
    }

    return {
        hasReference,
        referenceIds: [...referenceIds],
        citationIds: [...citationIds],
    };
}

function findNodes(node: ReferenceNode, tag: string): ReferenceNode[] {
    return [
        ...(node.tag === tag ? [node] : []),
        ...(node.children ?? []).flatMap((child) => findNodes(child, tag)),
    ];
}

export function referenceDestination(pages: ReferencePage[], id: string) {
    const page = pages.find(
        (page) => page.hasReference && page.referenceIds.includes(id),
    );
    return page
        ? `${page.path}#fnref-${encodeURIComponent(id)}`
        : `#fnref-${encodeURIComponent(id)}`;
}

export function citationDestination(pages: ReferencePage[], id: string) {
    const page = pages.find((page) => page.citationIds.includes(id));
    return page
        ? `${page.path}#ref-${encodeURIComponent(id)}`
        : `#ref-${encodeURIComponent(id)}`;
}
