import { computed, toValue, type MaybeRefOrGetter } from "vue";

export function useContentPageData(path: MaybeRefOrGetter<string>) {
    const key = computed(() => `content-${toValue(path)}`);

    return useAsyncData(key, () =>
        queryCollection("content").path(toValue(path)).first(),
    );
}

export function useContentNavigationData(category: MaybeRefOrGetter<string>) {
    const categoryPath = computed(() => {
        const slug = toValue(category).replace(/^\/+|\/+$/g, "");
        return slug ? `/${slug}` : "";
    });
    const key = computed(() => `content-navigation-${categoryPath.value}`);

    return useAsyncData(
        key,
        () => {
            const path = categoryPath.value;
            if (!path) return Promise.resolve([]);

            return queryCollection("content")
                .orWhere((query) =>
                    query
                        .where("path", "=", path)
                        .where("path", "LIKE", `${path}/%`),
                )
                .select("path", "title", "description", "meta", "order")
                .all();
        },
        {
            transform: (pages) =>
                pages
                    .filter(
                        (page) =>
                            !page.path.startsWith(
                                "/human-practices/transcript/",
                            ),
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
                        ...(typeof page.meta?.icon === "string" &&
                        page.meta.icon.trim()
                            ? { icon: page.meta.icon.trim() }
                            : {}),
                    })),
        },
    );
}
