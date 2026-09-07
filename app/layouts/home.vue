<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from "vue";

import {
    captureHomeScroll,
    HOME_SCROLL_LOCK_CHANGE,
    HOME_SCROLL_REFRESH_END,
    HOME_SCROLL_REFRESH_START,
    restoreHomeScroll,
    type HomeScrollLockChange,
    type HomeScrollSnapshot,
} from "~/utils/home-scroll";
import { HOME_SCROLL_CONTROLLER } from "~/utils/home-scroll-controller";

gsap.registerPlugin(ScrollTrigger);
const { settled: homeIntroSettled } = useHomeIntroState();
const siteHeader = ref<HTMLElement>();

let media: gsap.MatchMedia | undefined;
let lenis: Lenis | undefined;
let headerEntrance: gsap.core.Tween | undefined;
let updateLenis: ((time: number) => void) | undefined;
let previousScrollRestoration: ScrollRestoration | undefined;
let resizeSnapshot: HomeScrollSnapshot | undefined;
let resizeTimer: ReturnType<typeof setTimeout> | undefined;

if (import.meta.client) {
    // Set this during setup so native reload restoration cannot race the
    // ScrollTrigger scenes before the custom restoration pass is ready.
    previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
}

const nextFrame = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

function scrollImmediately(position: number) {
    if (lenis) {
        lenis.scrollTo(position, { immediate: true, force: true });
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

function handleScrollLockChange(event: Event) {
    const detail = (event as CustomEvent<HomeScrollLockChange>).detail;
    if (detail.locked) lenis?.stop();
    else lenis?.start();
}

provide(HOME_SCROLL_CONTROLLER, {
    scrollTo: scrollToChapter,
    jumpTo: scrollImmediately,
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

function coverHeader() {
    headerEntrance?.kill();
    if (!siteHeader.value) return;
    gsap.set(siteHeader.value, {
        clearProps: "transform,opacity,visibility",
    });
}

function revealHeader() {
    headerEntrance?.kill();
    if (!siteHeader.value) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(siteHeader.value, {
            yPercent: 0,
            autoAlpha: 1,
            clearProps: "transform,opacity,visibility",
        });
        return;
    }

    headerEntrance = gsap.fromTo(
        siteHeader.value,
        { yPercent: -110, autoAlpha: 0 },
        {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.72,
            ease: "power3.out",
            overwrite: "auto",
            clearProps: "transform,opacity,visibility",
        },
    );
}

watch(
    homeIntroSettled,
    (isSettled) => {
        if (isSettled) revealHeader();
        else coverHeader();
    },
    { flush: "post" },
);

onMounted(async () => {
    ScrollTrigger.config({
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
    });
    window.addEventListener("resize", scheduleResizeRefresh, {
        passive: true,
    });
    window.addEventListener(HOME_SCROLL_LOCK_CHANGE, handleScrollLockChange);

    await nextTick();

    if (homeIntroSettled.value) revealHeader();
    else coverHeader();

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
    headerEntrance?.kill();
    headerEntrance = undefined;
    window.removeEventListener("resize", scheduleResizeRefresh);
    window.removeEventListener(HOME_SCROLL_LOCK_CHANGE, handleScrollLockChange);
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
    <div
        class="home-layout relative z-0 min-h-screen"
        :data-intro-covered="!homeIntroSettled"
    >
        <header ref="siteHeader" class="fixed top-0 z-100 flex w-full flex-col">
            <NavigationBar />
        </header>

        <div id="home-smooth-wrapper">
            <div id="home-smooth-content" class="flex min-h-screen flex-col">
                <main class="flex-1">
                    <slot />
                </main>
                <LazyFooter home-overlap hydrate-on-visible />
            </div>
        </div>
    </div>
</template>

<style>
.home-layout {
    background: #03316d;
}
.home-layout[data-intro-covered="true"] > header {
    opacity: 0;
    transform: translateY(-110%);
    visibility: hidden;
}
@media (prefers-reduced-motion: reduce) {
    .home-layout[data-intro-covered="true"] > header {
        opacity: 1;
        transform: none;
        visibility: visible;
    }
}
</style>
