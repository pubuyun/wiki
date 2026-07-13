import { titleizeSlug } from "./content-pages";

interface PageInfoLike {
    path?: string;
    title?: string;
    description?: string;
    meta?: {
        description?: string;
    };
}

export function pageDescription(item?: PageInfoLike | null) {
    return item?.description || item?.meta?.description || "";
}

export function pageTitle(item?: PageInfoLike | null) {
    return (
        item?.title ||
        titleizeSlug(item?.path?.split("/").filter(Boolean).at(-1) ?? "")
    );
}

export function pageSeoTitle(item?: PageInfoLike | null) {
    return `${pageTitle(item)}`;
}
