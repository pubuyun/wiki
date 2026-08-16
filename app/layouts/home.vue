<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { nextTick, onBeforeUnmount, onMounted, provide } from "vue";

import {
    captureHomeScroll,
    HOME_SCROLL_REFRESH_END,
    HOME_SCROLL_REFRESH_START,
    restoreHomeScroll,
    type HomeScrollSnapshot,
} from "~/utils/home-scroll";
import { HOME_SCROLL_CONTROLLER } from "~/utils/home-scroll-controller";

gsap.registerPlugin(ScrollTrigger);

let media: gsap.MatchMedia | undefined;
let lenis: Lenis | undefined;
let updateLenis: ((time: number) => void) | undefined;
let previousScrollRestoration: ScrollRestoration | undefined;
let resizeSnapshot: HomeScrollSnapshot | undefined;
let resizeTimer: ReturnType<typeof setTimeout> | undefined;

const nextFrame = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

function scrollImmediately(position: number) {
    if (lenis) {
        lenis.scrollTo(position, { immediate: true });
        return;
    }

    window.scrollTo(0, position);
}

function scrollToChapter(
    position: number,
    options: { duration?: number; onComplete?: () => void } = {},
) {
    if (lenis) {
        lenis.scrollTo(position, {
            duration: options.duration,
            onComplete: () => options.onComplete?.(),
        });
        return;
    }

    window.scrollTo({
        top: position,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
    });
    window.requestAnimationFrame(() => options.onComplete?.());
}

function cancelChapterScroll() {
    if (lenis) {
        lenis.stop();
        lenis.start();
        return;
    }

    window.scrollTo({ top: window.scrollY, behavior: "auto" });
}

provide(HOME_SCROLL_CONTROLLER, {
    scrollTo: scrollToChapter,
    cancel: cancelChapterScroll,
});

function scheduleResizeRefresh() {
    resizeSnapshot ??= captureHomeScroll();
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(refreshAfterResize, 180);
}

async function refreshAfterResize() {
    resizeTimer = undefined;
    if (document.hidden || !resizeSnapshot) {
        resizeSnapshot = undefined;
        return;
    }

    const snapshot = resizeSnapshot;
    resizeSnapshot = undefined;

    window.dispatchEvent(new Event(HOME_SCROLL_REFRESH_START));
    await nextFrame();
    ScrollTrigger.refresh();

    // Cross-scene routes depend on the refreshed bounds of their neighbouring
    // base triggers, so rebuild those only after the refresh pass.
    window.dispatchEvent(new Event(HOME_SCROLL_REFRESH_END));
    await nextFrame();
    restoreHomeScroll(snapshot, scrollImmediately);
}

function destroyLenis() {
    if (updateLenis) {
        gsap.ticker.remove(updateLenis);
        updateLenis = undefined;
    }

    lenis?.destroy();
    lenis = undefined;
}

onMounted(async () => {
    previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    ScrollTrigger.config({
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
    });
    window.addEventListener("resize", scheduleResizeRefresh, {
        passive: true,
    });

    await nextTick();

    media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
        lenis = new Lenis({
            duration: 0.9,
            smoothWheel: true,
            syncTouch: false,
            touchMultiplier: 1,
            easing: (time) => Math.min(1, 1.001 - 2 ** (-10 * time)),
        });

        lenis.on("scroll", () => ScrollTrigger.update());

        updateLenis = (time) => lenis?.raf(time * 1000);
        gsap.ticker.add(updateLenis);
        gsap.ticker.lagSmoothing(0);

        ScrollTrigger.refresh();

        return destroyLenis;
    });
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", scheduleResizeRefresh);
    clearTimeout(resizeTimer);
    ScrollTrigger.config({
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize",
    });

    if (previousScrollRestoration) {
        window.history.scrollRestoration = previousScrollRestoration;
    }

    media?.revert();
    media = undefined;
    destroyLenis();
});
</script>

<template>
    <div class="relative z-0 min-h-screen">
        <header class="fixed top-0 z-100 flex w-full flex-col">
            <NavigationBar />
        </header>

        <div id="home-smooth-wrapper">
            <div id="home-smooth-content" class="flex min-h-screen flex-col">
                <main class="flex-1">
                    <slot />
                </main>
                <LazyFooter hydrate-on-visible />
            </div>
        </div>
    </div>
</template>
