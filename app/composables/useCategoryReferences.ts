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
            .select(
                "path",
                "title",
                "hasReference",
                "referenceIds",
                "citationIds",
            )
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

    function currentCitationLink(id: string) {
        const from = route.query.from;
        if (typeof from === "string") {
            if (from.endsWith(`#ref-${encodeURIComponent(id)}`)) {
                return from;
            }
        }
        return (
            citations.value[`${categoryPath.value}:${id}`] ??
            citationDestination(pages.value ?? [], id)
        );
    }

    function withCitationSource(destination: string, id: string) {
        const [pathAndQuery, hash = ""] = destination.split("#", 2);
        const source = `${route.path}#ref-${encodeURIComponent(id)}`;
        const separator = pathAndQuery.includes("?") ? "&" : "?";
        return `${pathAndQuery}${separator}from=${encodeURIComponent(source)}${
            hash ? `#${hash}` : ""
        }`;
    }

    return {
        referenceLink: (id: string) =>
            withCitationSource(referenceDestination(pages.value ?? [], id), id),
        citationLink: currentCitationLink,
        citationLinks: (id: string) =>
            (pages.value ?? [])
                .filter((page) => page.citationIds?.includes(id))
                .map((page) => ({
                    to: `${page.path}#ref-${encodeURIComponent(id)}`,
                    label: [
                        ...page.path
                            .split("/")
                            .filter(Boolean)
                            .slice(1, -1)
                            .map((part, index) => {
                                const parentPath = `/${page.path
                                    .split("/")
                                    .filter(Boolean)
                                    .slice(0, index + 2)
                                    .join("/")}`;
                                return (
                                    pages.value?.find(
                                        (parent) => parent.path === parentPath,
                                    )?.title ||
                                    part
                                        .replace(/-/g, " ")
                                        .replace(/\b\w/g, (letter) =>
                                            letter.toUpperCase(),
                                        )
                                );
                            }),
                        page.title || page.path,
                    ].join(" / "),
                })),
        rememberCitation,
    };
}
