export default defineEventHandler(async (event) => {
    const sections = await queryCollectionSearchSections(event, "content", {
        minHeading: "h2",
        maxHeading: "h3",
    });

    setResponseHeader(
        event,
        "Cache-Control",
        "public, max-age=3600, stale-while-revalidate=86400",
    );

    return sections;
});
