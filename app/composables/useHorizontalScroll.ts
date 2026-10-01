/** Add a keyboard stop only when a region has horizontal overflow. */
export function useHorizontalScroll() {
    const scrollElement = ref<HTMLElement | null>(null);
    const isScrollable = ref(false);

    if (import.meta.client) {
        watch(scrollElement, (element, _, onCleanup) => {
            isScrollable.value = false;
            if (!element) return;

            const update = () => {
                isScrollable.value = element.scrollWidth > element.clientWidth + 1;
            };
            const resize = new ResizeObserver(update);
            const observeChildren = () => {
                resize.disconnect();
                resize.observe(element);
                for (const child of element.children) resize.observe(child);
                update();
            };
            const mutation = new MutationObserver(observeChildren);
            mutation.observe(element, { childList: true, subtree: true, characterData: true });
            element.addEventListener("load", update, true);
            observeChildren();
            void document.fonts.ready.then(update);
            onCleanup(() => {
                resize.disconnect();
                mutation.disconnect();
                element.removeEventListener("load", update, true);
            });
        }, { flush: "post" });
    }

    return { scrollElement, isScrollable };
}
