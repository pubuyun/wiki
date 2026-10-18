export function scrollTableByKey(event: KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const scrollRegion = event.currentTarget as HTMLElement;
    scrollRegion.scrollBy({ left: event.key === "ArrowRight" ? 120 : -120 });
}
