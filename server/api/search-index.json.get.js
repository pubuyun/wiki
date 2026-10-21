export default defineEventHandler(async (event) => {
    const sections = await queryCollectionSearchSections(event, "content", {
        minHeading: "h2",
        maxHeading: "h3",
        ignoredTags: ["pre", "code", "script", "style"],
    });
    return sections
        .filter(
            (section) =>
                !section.id.startsWith("/human-practices/transcript/") &&
                !section.id.startsWith("/sustainability/interviews/"),
        )
        .map((section) => ({
            id: section.id,
            title: section.title,
            titles: section.titles,
            level: section.level,
            content:
                section.content.length > 2400
                    ? `${section.content.slice(0, 2400)}…`
                    : section.content,
        }));
});
