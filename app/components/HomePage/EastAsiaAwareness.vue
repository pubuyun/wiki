<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onMounted, onUnmounted, ref } from "vue";
import wronged from "../../../assets/wronged.png";
import rotate from "../../../assets/rotate.png";
import {
    HOME_CHAPTERS,
    homeChapterActivationLabel,
} from "~/utils/home-chapters";

gsap.registerPlugin(ScrollTrigger);
const scene = ref<HTMLElement | null>(null);
let media: gsap.MatchMedia | undefined;

onMounted(() => {
    if (!scene.value) return;
    media = gsap.matchMedia();
    media.add(
        {
            reduceMotion: "(prefers-reduced-motion: reduce)",
            allowMotion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
            const timeline = gsap.timeline({
                scrollTrigger: {
                    id: "east-asia-awareness-story",
                    trigger: scene.value,
                    start: "top top",
                    end: "+=140%",
                    pin: true,
                    scrub: 0.7,
                },
            });
            timeline.addLabel(
                homeChapterActivationLabel(HOME_CHAPTERS.eastAsiaAwareness),
                0,
            );
            if (context.conditions?.reduceMotion) {
                timeline.addLabel(HOME_CHAPTERS.eastAsiaAwareness, 0);
                timeline.to({}, { duration: 1 });
                return;
            }
            timeline
                .from(
                    ".awareness-scene__panel",
                    { autoAlpha: 0, y: 36, duration: 0.7, ease: "power3.out" },
                    0,
                )
                .from(
                    ".awareness-scene__character",
                    { autoAlpha: 0, y: 24, duration: 0.5 },
                    0.3,
                )
                .from(
                    ".awareness-scene__symbol",
                    { autoAlpha: 0, scale: 0.8, duration: 0.7 },
                    0,
                )
                .addLabel(HOME_CHAPTERS.eastAsiaAwareness)
                .to({}, { duration: 0.4 });
        },
        scene.value,
    );
});
onUnmounted(() => media?.revert());
</script>

<template>
    <section
        id="east-asia-awareness"
        ref="scene"
        class="awareness-scene"
        aria-labelledby="awareness-title"
    >
        <h2 id="awareness-title" class="sr-only">
            Understanding and awareness in East Asia
        </h2>
        <div class="awareness-scene__stage">
            <img
                :src="rotate"
                alt=""
                class="awareness-scene__symbol awareness-scene__symbol--top"
            />
            <img
                :src="rotate"
                alt=""
                class="awareness-scene__symbol awareness-scene__symbol--small"
            />
            <div class="awareness-scene__panel">
                <p>
                    In East Asia, though fewer people deal with this condition,
                    the lack of awareness often breeds even more
                    <strong class="awareness-scene__misunderstanding"
                        >misunderstanding</strong
                    >
                    and
                    <strong class="awareness-scene__discrimination"
                        >discrimination</strong
                    >
                    against those who do.
                </p>
                <img :src="wronged" alt="" class="awareness-scene__character" />
            </div>
            <img
                :src="rotate"
                alt=""
                class="awareness-scene__symbol awareness-scene__symbol--bottom"
            />
        </div>
    </section>
</template>

<style scoped>
.awareness-scene {
    position: relative;
    isolation: isolate;
    width: 100%;
    height: 100svh;
    min-height: 36rem;
    overflow: hidden;
    background: #073873;
}
.awareness-scene__stage {
    position: relative;
    display: grid;
    align-items: center;
    width: min(100%, 100rem);
    height: 100%;
    padding: 6rem 8%;
    margin-inline: auto;
}
.awareness-scene__panel {
    position: relative;
    padding: clamp(2.5rem, 6vw, 6rem) clamp(1.5rem, 4vw, 4rem);
    border-radius: clamp(1.5rem, 3vw, 3rem);
    background: #2d6cba;
    box-shadow: clamp(0.75rem, 2vw, 1.5rem) clamp(1rem, 2vw, 1.5rem) 0 #104995;
}
.awareness-scene__panel p {
    margin: 0;
    color: #fff;
    font-family: var(--font-belanosima), sans-serif;
    font-size: clamp(1.25rem, 2.8vw, 2.8rem);
    line-height: 1.5;
    text-align: center;
    text-wrap: pretty;
}
.awareness-scene__panel strong {
    font-weight: inherit;
}
.awareness-scene__misunderstanding {
    color: #c0ffe8;
}
.awareness-scene__discrimination {
    color: #fff0ac;
}
.awareness-scene__character {
    position: absolute;
    bottom: clamp(-6rem, -8vw, -3rem);
    left: -3%;
    width: clamp(7rem, 19vw, 18rem);
    height: auto;
}
.awareness-scene__symbol {
    position: absolute;
    width: clamp(3rem, 8vw, 8rem);
    height: auto;
    animation: awareness-symbol-spin 10s linear infinite;
}
@keyframes awareness-symbol-spin {
    from {
        rotate: 0turn;
    }
    to {
        rotate: 1turn;
    }
}
@media (prefers-reduced-motion: reduce) {
    .awareness-scene__symbol {
        animation: none;
    }
}
.awareness-scene__symbol--top {
    top: 6%;
    left: 11%;
    transform: rotate(35deg);
}
.awareness-scene__symbol--small {
    top: 18%;
    left: 6%;
    width: clamp(1.5rem, 3vw, 3rem);
    transform: rotate(35deg);
}
.awareness-scene__symbol--bottom {
    right: 8%;
    bottom: 12%;
    transform: rotate(-20deg);
}
@media (max-width: 40rem) {
    .awareness-scene {
        height: auto;
        min-height: max(100svh, 42rem);
    }
    .awareness-scene__stage {
        min-height: inherit;
        padding: 8rem 7% 10rem;
    }
    .awareness-scene__panel {
        padding: 2rem 1.25rem 3rem;
    }
    .awareness-scene__panel p {
        font-size: clamp(1.1rem, 4.6vw, 1.75rem);
    }
    .awareness-scene__character {
        bottom: -5rem;
        left: -3%;
        width: 8rem;
    }
    .awareness-scene__symbol--top {
        top: 5%;
    }
    .awareness-scene__symbol--small {
        top: 13%;
    }
    .awareness-scene__symbol--bottom {
        bottom: 5%;
    }
}
@media (max-height: 32rem) and (min-width: 40.01rem) {
    .awareness-scene {
        min-height: 24rem;
    }
    .awareness-scene__stage {
        padding-block: 4rem;
    }
    .awareness-scene__panel {
        padding-block: 2rem;
    }
    .awareness-scene__panel p {
        font-size: clamp(1.1rem, 2.5vw, 1.6rem);
    }
    .awareness-scene__character {
        width: 7rem;
        bottom: -3rem;
    }
    .awareness-scene__symbol--bottom {
        bottom: 3%;
    }
}
</style>
