import type { ContentNavNode } from "~/utils/content-pages";

export interface ContentLayoutState {
    pageTitle: string;
    categoryTitle: string;
    categoryPath: string;
    categoryNavNodes: ContentNavNode[];
    activePath: string;
    showRightSidebar: boolean;
}

export function useContentLayoutState() {
    return useState<ContentLayoutState>("content-layout", () => ({
        pageTitle: "",
        categoryTitle: "",
        categoryPath: "",
        categoryNavNodes: [],
        activePath: "",
        showRightSidebar: true,
    }));
}
