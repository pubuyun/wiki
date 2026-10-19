export default defineEventHandler(async (event) => {
    const sections = await queryCollectionSearchSections(event, "content", {
        minHeading: "h2",
        maxHeading: "h3",
    });
    return sections.filter(
        (section) => !section.id.startsWith("/human-practices/transcript/"),
    );
});
