<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onMounted, onUnmounted, ref } from "vue";

gsap.registerPlugin(ScrollTrigger);

const PRECURSOR_START_POSITION = { x: "-72vw", y: 0 } as const;
const PRECURSOR_END_POSITION = { x: "-10%", y: 0 } as const;

const scene = ref<HTMLElement | null>(null);
const binder = ref<HTMLImageElement | null>(null);
const precursor = ref<HTMLImageElement | null>(null);

let context: gsap.Context | undefined;

onMounted(() => {
    if (!scene.value || !binder.value || !precursor.value) return;

    context = gsap.context(() => {
        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        gsap.set(binder.value, {
            scale: reduceMotion ? 0.8 : 1,
            transformOrigin: "50% 50%",
        });
        gsap.set(precursor.value, {
            ...(reduceMotion
                ? PRECURSOR_END_POSITION
                : PRECURSOR_START_POSITION),
            transformOrigin: "50% 50%",
        });

        if (reduceMotion) return;

        const binderTween = gsap.to(binder.value, {
            scale: 0.8,
            duration: 0.8,
            ease: "power2.inOut",
            paused: true,
        });

        gsap.to(precursor.value, {
            ...PRECURSOR_END_POSITION,
            duration: 1,
            ease: "none",
            scrollTrigger: {
                trigger: scene.value,
                start: "top top",
                end: "+=150%",
                pin: true,
                scrub: 0.6,
                invalidateOnRefresh: true,
                onScrubComplete: (self) => {
                    if (self.progress >= 0.999) binderTween.play();
                },
                onUpdate: (self) => {
                    if (self.progress >= 0.999 || binderTween.progress() === 0)
                        return;

                    binderTween.pause(0);
                    gsap.set(binder.value, { scale: 1 });
                },
            },
        });
    }, scene.value);

    ScrollTrigger.refresh();
});

onUnmounted(() => {
    context?.revert();
});
</script>

<template>
    <section
        id="solution"
        ref="scene"
        class="binder-scene grid min-h-screen min-h-svh grid-cols-[1fr_2fr] place-items-center overflow-hidden bg-[#03316d] bg-[radial-gradient(circle_at_50%_46%,rgb(47_111_183_/_42%),transparent_38%)]"
    >
        <div
            class="binder-stage relative col-start-1 grid aspect-square w-[min(30vw,25vh)] place-items-center"
            aria-label="Precursor binding animation"
        >
            <img
                ref="binder"
                class="binder-image pointer-events-none absolute z-1 block h-auto w-[82%] will-change-transform select-none [grid-area:1/1]"
                src="https://static.igem.wiki/teams/6133/wiki/homepage/binder.avif"
                alt="Binder"
                width="1523"
                height="1458"
            />
            <img
                ref="precursor"
                class="precursor-image pointer-events-none absolute z-2 block h-auto w-[38%] will-change-transform select-none [grid-area:1/1]"
                src="https://static.igem.wiki/teams/6133/wiki/homepage/precursornew.avif"
                alt="Precursor moving into the binder"
                width="806"
                height="806"
            />
        </div>
    </section>
</template>
