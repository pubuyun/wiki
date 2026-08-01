import type { MaybeRefOrGetter } from "vue";

export function useContentPageData(path: MaybeRefOrGetter<string>) {
    const key = computed(() => `content-${toValue(path)}`);

    return useAsyncData(key, () =>
        queryCollection("content").path(toValue(path)).first(),
    );
}

export function useContentNavigationData() {
    return useAsyncData("content-navigation", () =>
        queryCollection("content")
            .select("path", "title", "description", "meta", "order")
            .all(),
    );
}
