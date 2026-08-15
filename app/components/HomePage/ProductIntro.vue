<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onMounted, onUnmounted, ref } from "vue";

gsap.registerPlugin(ScrollTrigger);

const scene = ref<HTMLElement | null>(null);
const answer = ref<HTMLElement | null>(null);

let media: gsap.MatchMedia | undefined;

const THINKING_IMAGE =
    "https://static.igem.wiki/teams/6133/wiki/homepage/thinking.avif";

const THINKING_IMAGE_LAYOUT = {
    landscape: {
        left: "8vw",
        bottom: "8svh",
        width: "clamp(11rem, 20vw, 23rem)",
    },
    portrait: {
        left: "8vw",
        bottom: "7svh",
        width: "clamp(8.5rem, 38vw, 15rem)",
    },
} as const;

const thinkingImageStyle = {
    "--thinking-image-left": THINKING_IMAGE_LAYOUT.landscape.left,
    "--thinking-image-bottom": THINKING_IMAGE_LAYOUT.landscape.bottom,
    "--thinking-image-width": THINKING_IMAGE_LAYOUT.landscape.width,
    "--thinking-image-left-portrait": THINKING_IMAGE_LAYOUT.portrait.left,
    "--thinking-image-bottom-portrait": THINKING_IMAGE_LAYOUT.portrait.bottom,
    "--thinking-image-width-portrait": THINKING_IMAGE_LAYOUT.portrait.width,
};

onMounted(() => {
    if (!scene.value || !answer.value) return;

    media = gsap.matchMedia();
    media.add(
        {
            reduceMotion: "(prefers-reduced-motion: reduce)",
            allowMotion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
            if (!scene.value || !answer.value) return;

            const { reduceMotion } = context.conditions as {
                reduceMotion: boolean;
            };

            if (reduceMotion) {
                gsap.set(answer.value, {
                    autoAlpha: 1,
                    clearProps: "transform",
                });
                return;
            }

            gsap.fromTo(
                answer.value,
                { autoAlpha: 0, y: 48, scale: 0.9 },
                {
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        id: "product-intro-answer-entrance",
                        trigger: scene.value,
                        start: "top top",
                        end: "+=35%",
                        scrub: 0.45,
                        invalidateOnRefresh: true,
                    },
                },
            );
        },
    );
});

onUnmounted(() => {
    media?.revert();
    media = undefined;
});
</script>

<template>
    <section
        ref="scene"
        class="product-intro relative h-svh min-h-screen overflow-hidden bg-[#07366f] text-white"
        :style="thinkingImageStyle"
        aria-labelledby="product-intro-question"
    >
        <p id="product-intro-question" class="product-intro__question">
            This raises the question: is there a safer, more targeted and more
            inclusive way to prevent underarm odor?
        </p>

        <p ref="answer" class="product-intro__answer">
            <span aria-hidden="true">—</span>
            Absolutely
        </p>

        <img
            class="product-intro__character -rotate-15"
            :src="THINKING_IMAGE"
            alt="A character thinking about the question"
            loading="eager"
            decoding="async"
            draggable="false"
        />
    </section>
</template>

<style scoped>
.product-intro {
    font-family: var(--font-righteous), sans-serif;
}

.product-intro__question {
    position: absolute;
    top: clamp(8rem, 28svh, 18rem);
    left: 50%;
    width: min(82vw, 90rem);
    margin: 0;
    transform: translateX(-50%);
    font-size: clamp(1.5rem, 3.1vw, 3.75rem);
    line-height: 1.22;
    letter-spacing: 0.005em;
    text-align: center;
    text-wrap: balance;
}

.product-intro__answer {
    position: absolute;
    top: clamp(24rem, 63svh, 39rem);
    left: 50%;
    margin: 0;
    transform: translateX(-50%);
    font-size: clamp(1.75rem, 3.25vw, 4rem);
    line-height: 1;
    white-space: nowrap;
}

.product-intro__character {
    position: absolute;
    bottom: var(--thinking-image-bottom);
    left: var(--thinking-image-left);
    width: var(--thinking-image-width);
    height: auto;
    object-fit: contain;
    user-select: none;
}

@media (orientation: portrait) {
    .product-intro__question {
        top: clamp(6rem, 16svh, 11rem);
        width: min(88vw, 42rem);
        font-size: clamp(1.4rem, 5.95vw, 3rem);
        line-height: 1.2;
    }

    .product-intro__answer {
        top: clamp(22rem, 52svh, 35rem);
        font-size: clamp(1.55rem, 6.75vw, 3.25rem);
    }

    .product-intro__character {
        bottom: var(--thinking-image-bottom-portrait);
        left: var(--thinking-image-left-portrait);
        width: var(--thinking-image-width-portrait);
    }
}
</style>
