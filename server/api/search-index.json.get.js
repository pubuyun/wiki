export default defineEventHandler((event) => {
    return queryCollectionSearchSections(event, "content", {
        minHeading: "h2",
        maxHeading: "h3",
    });
});
