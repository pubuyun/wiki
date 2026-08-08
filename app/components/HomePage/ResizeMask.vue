<script setup lang="ts">
import { Icon } from "@iconify/vue";

const isVisible = ref(false);

let previousBodyOverflow = "";
let previousScrollRestoration: ScrollRestoration | undefined;
let initialViewportWidth = 0;
let initialViewportHeight = 0;
let resizeTimer: ReturnType<typeof setTimeout> | undefined;

function handleViewportResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(showMaskForChangedViewport, 200);
}

function showMaskForChangedViewport() {
    resizeTimer = undefined;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Minimizing a browser hides the document and may temporarily report a
    // zero-sized viewport. Restoring it to the same size is not a layout change.
    if (
        document.hidden ||
        width <= 0 ||
        height <= 0 ||
        (width === initialViewportWidth && height === initialViewportHeight)
    ) {
        return;
    }

    if (!isVisible.value) {
        isVisible.value = true;
        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
    }
}

function refreshPage() {
    window.scrollTo(0, 0);
    window.location.reload();
}

onMounted(() => {
    initialViewportWidth = window.innerWidth;
    initialViewportHeight = window.innerHeight;
    previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const navigation = window.performance.getEntriesByType("navigation")[0] as
        PerformanceNavigationTiming | undefined;

    if (navigation?.type === "reload") {
        window.scrollTo(0, 0);
    }

    window.addEventListener("resize", handleViewportResize, { passive: true });
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", handleViewportResize);
    clearTimeout(resizeTimer);
    resizeTimer = undefined;

    if (previousScrollRestoration) {
        window.history.scrollRestoration = previousScrollRestoration;
    }

    if (isVisible.value) {
        document.body.style.overflow = previousBodyOverflow;
    }
});
</script>

<template>
    <Teleport to="body">
        <div
            v-if="isVisible"
            class="fixed inset-0 z-[2147483647] grid place-items-center bg-[#03316d]/96 px-6 text-white backdrop-blur-sm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="resize-mask-title"
            aria-describedby="resize-mask-description"
        >
            <div class="flex max-w-xl flex-col items-center text-center">
                <div
                    class="mb-7 grid size-24 place-items-center rounded-full bg-white/12 ring-2 ring-white/25"
                    aria-hidden="true"
                >
                    <Icon icon="lucide:refresh-cw" class="size-12" />
                </div>

                <h2
                    id="resize-mask-title"
                    class="font-righteous text-3xl leading-tight sm:text-4xl"
                >
                    Window size changed
                </h2>
                <p
                    id="resize-mask-description"
                    class="mt-4 max-w-md text-lg leading-relaxed text-white/80 sm:text-xl"
                >
                    Please refresh the page so the animations display correctly
                    at the new size.
                </p>

                <button
                    type="button"
                    class="mt-8 flex cursor-pointer items-center gap-2 rounded-full bg-white px-7 py-3 font-righteous text-lg text-[#03316d] shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-95"
                    @click="refreshPage"
                >
                    <Icon
                        icon="lucide:rotate-cw"
                        class="size-5"
                        aria-hidden="true"
                    />
                    Refresh page
                </button>
            </div>
        </div>
    </Teleport>
</template>
