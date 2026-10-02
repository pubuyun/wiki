import {
    citationDestination,
    referenceDestination,
} from "~/utils/content-references";

export async function useCategoryReferences() {
    const route = useRoute();
    const categoryPath = computed(
        () => `/${route.path.split("/").filter(Boolean)[0] ?? ""}`,
    );
    const key = computed(() => `category-references-${categoryPath.value}`);
    const citations = useState<Record<string, string>>(
        "reference-citation-origins",
        () => ({}),
    );

    const { data: pages } = await useAsyncData(key, () =>
        queryCollection("content")
            .orWhere((query) =>
                query
                    .where("path", "=", categoryPath.value)
                    .where("path", "LIKE", `${categoryPath.value}/%`),
            )
            .select("path", "hasReference", "referenceIds", "citationIds")
            .order("path", "ASC")
            .all(),
    );

    function rememberCitation(id: string, event: MouseEvent) {
        if (
            event.button !== 0 ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey
        )
            return;
        citations.value[`${categoryPath.value}:${id}`] =
            `${route.path}#ref-${encodeURIComponent(id)}`;
    }

    return {
        referenceLink: (id: string) =>
            referenceDestination(pages.value ?? [], id),
        citationLink: (id: string) =>
            citations.value[`${categoryPath.value}:${id}`] ??
            citationDestination(pages.value ?? [], id),
        rememberCitation,
    };
}
