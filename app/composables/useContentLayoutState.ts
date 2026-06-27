import type { ContentNavNode } from "~/utils/content-pages";

export interface ContentLayoutState {
    page: Record<string, any> | null;
    categoryTitle: string;
    categoryPath: string;
    categoryNavNodes: ContentNavNode[];
    activePath: string;
    showRightSidebar: boolean;
}

export function useContentLayoutState() {
    return useState<ContentLayoutState>("content-layout", () => ({
        page: null,
        categoryTitle: "",
        categoryPath: "",
        categoryNavNodes: [],
        activePath: "",
        showRightSidebar: true,
    }));
}
