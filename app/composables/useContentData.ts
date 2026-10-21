import { computed, toValue, type MaybeRefOrGetter } from "vue";
import type { ContentCollectionItem } from "@nuxt/content";
import { readStaticContent } from "./useStaticContent";

interface ContentNavigationItem {
    path: string;
    title: string;
    order: number;
    description: string;
    icon?: string;
}

export function useContentPageData(path: MaybeRefOrGetter<string>) {
    const key = computed(() => `content-${toValue(path)}`);

    return useAsyncData(key, () => {
        if (import.meta.server || !import.meta.env.WIKI_STATIC_CONTENT) {
            return queryCollection("content").path(toValue(path)).first();
        }
        return readStaticContent<ContentCollectionItem | null>(key.value);
    });
}

export function useContentNavigationData(category: MaybeRefOrGetter<string>) {
    const categoryPath = computed(() => {
        const slug = toValue(category).replace(/^\/+|\/+$/g, "");
        return slug ? `/${slug}` : "";
    });
    const key = computed(() => `content-navigation-${categoryPath.value}`);

    return useAsyncData(key, async () => {
        if (import.meta.client && import.meta.env.WIKI_STATIC_CONTENT) {
            return readStaticContent<ContentNavigationItem[]>(key.value);
        }
        const path = categoryPath.value;
        if (!path) return [];

        const pages = await queryCollection("content")
            .orWhere((query) =>
                query
                    .where("path", "=", path)
                    .where("path", "LIKE", `${path}/%`),
            )
            .select("path", "title", "description", "meta", "order")
            .all();
        return pages
            .filter(
                (page) =>
                    !page.path.startsWith("/human-practices/transcript/") &&
                    !page.path.startsWith("/sustainability/interviews/"),
            )
            .map((page) => ({
                path: page.path,
                title: page.title,
                order: page.order,
                description:
                    page.description ||
                    (typeof page.meta?.description === "string"
                        ? page.meta.description
                        : ""),
                ...(typeof page.meta?.icon === "string" && page.meta.icon.trim()
                    ? { icon: page.meta.icon.trim() }
                    : {}),
            }));
    });
}
