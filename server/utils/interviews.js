export async function queryInterviewPages(event, includeBody) {
    return queryCollection(event, "content")
        .where("path", "LIKE", "/human-practices/transcript/%")
        .orWhere((query) =>
            query.where("path", "LIKE", "/human-practices/transcript/%"),
        )
        .orWhere((query) =>
            query.where("path", "LIKE", "/sustainability/interviews/%"),
        )
        .select(
            "stem",
            "path",
            "title",
            "meta",
            ...(includeBody ? ["body"] : []),
        )
        .all();
}

export function interviewMap(pages) {
    return Object.fromEntries(
        pages.filter((page) => page.stem).map((page) => [page.stem, page]),
    );
}
