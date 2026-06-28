export interface ContentNavNode {
    id: string;
    slug: string;
    label: string;
    path?: string;
    active?: boolean;
    children?: ContentNavNode[];
}

interface ContentPageLike {
    path: string;
    title?: string;
    description?: string;
}

export function normalizeContentPath(path: string) {
    const withoutTrailingSlash = path.replace(/\/+$/, "");
    return withoutTrailingSlash || "/";
}

export function titleizeSlug(value: string) {
    return value
        .split("-")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function categoryPages(pages: ContentPageLike[], categorySlug?: string) {
    if (!categorySlug) return [];

    const prefix = `/${categorySlug}/`;
    return pages
        .filter((item) => item.path?.startsWith(prefix))
        .sort((a, b) => a.path.localeCompare(b.path));
}

export function buildCategoryNavTree(
    pages: ContentPageLike[],
    rootSlug: string,
    activePath: string,
) {
    const root: ContentNavNode[] = [];

    for (const item of pages) {
        const relativePath = item.path
            .replace(new RegExp(`^/${rootSlug}/?`), "")
            .replace(/\/+$/, "");
        const segments = relativePath.split("/").filter(Boolean);
        if (!segments.length) continue;

        let level = root;
        let currentPath = `/${rootSlug}`;
        segments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const isLeaf = index === segments.length - 1;
            let node = level.find((candidate) => candidate.slug === segment);

            if (!node) {
                node = {
                    id: currentPath,
                    slug: segment,
                    label: isLeaf
                        ? item.title || titleizeSlug(segment)
                        : titleizeSlug(segment),
                    path: isLeaf ? item.path : undefined,
                    active: false,
                    children: isLeaf ? undefined : [],
                };
                level.push(node);
            }

            if (isLeaf) {
                node.label = item.title || titleizeSlug(segment);
                node.path = item.path;
                node.active = item.path === activePath;
            } else {
                node.children ??= [];
                level = node.children;
            }
        });
    }

    markActiveFolders(root);
    return root;
}

function markActiveFolders(nodes: ContentNavNode[]) {
    for (const node of nodes) {
        if (!node.children?.length) continue;

        markActiveFolders(node.children);
        node.active = Boolean(node.active || node.children.some((child) => child.active));
    }
}
