import type { ContentNavNode } from "~/utils/content-pages";

export interface ContentLayoutState {
    page: Record<string, any> | null;
    categoryTitle: string;
    categoryNavNodes: ContentNavNode[];
    activePath: string;
    showRightSidebar: boolean;
}

export function useContentLayoutState() {
    return useState<ContentLayoutState>("content-layout", () => ({
        page: null,
        categoryTitle: "",
        categoryNavNodes: [],
        activePath: "",
        showRightSidebar: true,
    }));
}
