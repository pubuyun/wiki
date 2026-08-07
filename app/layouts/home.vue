<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const wrapper = ref<HTMLElement | null>(null);
const content = ref<HTMLElement | null>(null);

let media: gsap.MatchMedia | undefined;
let smoother: ScrollSmoother | undefined;

onMounted(async () => {
    await nextTick();

    media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
        if (!wrapper.value || !content.value) return;

        smoother = ScrollSmoother.create({
            wrapper: wrapper.value,
            content: content.value,
            smooth: 0.9,
            effects: true,
        });

        ScrollTrigger.refresh();

        return () => {
            smoother?.kill();
            smoother = undefined;
        };
    });
});

onBeforeUnmount(() => {
    media?.revert();
    media = undefined;
    smoother?.kill();
    smoother = undefined;
});
</script>

<template>
    <div class="relative z-0 min-h-screen">
        <header class="fixed top-0 z-100 flex w-full flex-col">
            <NavigationBar />
        </header>

        <div id="home-smooth-wrapper" ref="wrapper">
            <div
                id="home-smooth-content"
                ref="content"
                class="flex min-h-screen flex-col"
            >
                <main class="flex-1">
                    <slot />
                </main>
                <LazyFooter hydrate-on-visible />
            </div>
        </div>
    </div>
</template>
