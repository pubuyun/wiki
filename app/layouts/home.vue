<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { nextTick, onBeforeUnmount, onMounted } from "vue";

gsap.registerPlugin(ScrollTrigger);

let media: gsap.MatchMedia | undefined;
let lenis: Lenis | undefined;
let updateLenis: ((time: number) => void) | undefined;

function destroyLenis() {
    if (updateLenis) {
        gsap.ticker.remove(updateLenis);
        updateLenis = undefined;
    }

    lenis?.destroy();
    lenis = undefined;
}

onMounted(async () => {
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
