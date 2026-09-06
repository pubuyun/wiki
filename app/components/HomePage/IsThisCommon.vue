<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onBeforeUnmount, onMounted, ref } from "vue";

import {
    HOME_CHAPTERS,
    homeChapterActivationLabel,
} from "~/utils/home-chapters";

gsap.registerPlugin(ScrollTrigger);

const ASSET_ROOT = "https://static.igem.wiki/teams/6133/wiki/homepage";

const moments = [
    {
        name: "Learning",
        src: `${ASSET_ROOT}/learning.avif`,
    },
    {
        name: "Dating",
        src: `${ASSET_ROOT}/dating.avif`,
    },
    {
        name: "Exercising",
        src: `${ASSET_ROOT}/exercising.avif`,
    },
    {
        name: "Hugging",
        src: `${ASSET_ROOT}/hugging.avif`,
    },
] as const;

const scene = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);

let media: gsap.MatchMedia | undefined;
let isMounted = false;

function refreshAfterImagesLoad(images: HTMLImageElement[]) {
    const pendingImages = images.filter((image) => !image.complete);
    if (pendingImages.length === 0) {
        requestAnimationFrame(() => ScrollTrigger.refresh());
        return;
    }

    void Promise.all(
        pendingImages.map(
            (image) =>
                new Promise<void>((resolve) => {
                    image.addEventListener("load", () => resolve(), {
                        once: true,
                    });
                    image.addEventListener("error", () => resolve(), {
                        once: true,
                    });
                }),
        ),
    ).then(() => {
        if (isMounted) ScrollTrigger.refresh();
    });
}

onMounted(() => {
    if (!scene.value || !stage.value) return;
    isMounted = true;

    const root = scene.value;
    const header = stage.value.querySelector<HTMLElement>(
        ".common-scene__question",
    );
    const copy = stage.value.querySelector<HTMLElement>(".common-scene__copy");
    const accents = gsap.utils.toArray<HTMLElement>(
        ".common-scene__accent",
        stage.value,
    );
    const cards = gsap.utils.toArray<HTMLElement>(
        ".common-scene__card",
        stage.value,
    );
    const glows = gsap.utils.toArray<HTMLElement>(
        ".common-scene__card-glow",
        stage.value,
    );
    const images = gsap.utils.toArray<HTMLImageElement>("img", stage.value);

    refreshAfterImagesLoad(images);

    media = gsap.matchMedia();
    media.add(
        {
            isPortrait: "(max-width: 52rem), (orientation: portrait)",
            reduceMotion: "(prefers-reduced-motion: reduce)",
            allowMotion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
            const { isPortrait, reduceMotion } = context.conditions as {
                isPortrait: boolean;
                reduceMotion: boolean;
            };
            const timeline = gsap.timeline({
                defaults: { ease: "power3.out" },
                scrollTrigger: {
                    id: "is-this-common-story",
                    trigger: root,
                    start: "top top",
                    end: reduceMotion
                        ? "+=70%"
                        : isPortrait
                          ? "+=250%"
                          : "+=230%",
                    pin: true,
                    scrub: reduceMotion ? true : 0.65,
                    invalidateOnRefresh: true,
                },
            });

            timeline.addLabel(
                homeChapterActivationLabel(HOME_CHAPTERS.isThisCommon),
                0,
            );

            if (reduceMotion) {
                gsap.set([header, copy, ...accents, ...cards, ...glows], {
                    autoAlpha: 1,
                    clearProps: "transform",
                });
                timeline
                    .addLabel(HOME_CHAPTERS.isThisCommon, 0)
                    .to({}, { duration: 0.01 });
                return;
            }

            const cardRotations = isPortrait ? [-4, 3, 3, -3] : [-5, 4, -4, 5];

            timeline
                .fromTo(
                    header,
                    { autoAlpha: 0, y: -30, scale: 0.9 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.42,
                    },
                    0,
                )
                .fromTo(
                    copy,
                    { autoAlpha: 0, y: 34, scale: 0.94 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.52,
                    },
                    0.12,
                )
                .fromTo(
                    accents,
                    { autoAlpha: 0, scaleX: 0.12 },
                    {
                        autoAlpha: 1,
                        scaleX: 1,
                        duration: 0.42,
                        stagger: 0.055,
                        transformOrigin: "50% 50%",
                    },
                    0.32,
                )
                .fromTo(
                    glows,
                    { autoAlpha: 0, scale: 0.45 },
                    {
                        autoAlpha: 1,
                        scale: 1,
                        duration: 0.58,
                        stagger: 0.11,
                    },
                    0.42,
                )
                .fromTo(
                    cards,
                    {
                        autoAlpha: 0,
                        y: (index) => (isPortrait ? 66 : 92) + (index % 2) * 18,
                        scale: 0.76,
                        rotation: (index) => cardRotations[index] ?? 0,
                    },
                    {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        rotation: 0,
                        duration: 0.64,
                        ease: "back.out(1.35)",
                        stagger: 0.13,
                    },
                    0.48,
                )
                .addLabel(HOME_CHAPTERS.isThisCommon)
                // Keep the navigator's stable destination inside the pin.
                .to({}, { duration: 0.2 });
        },
        root,
    );
});

onBeforeUnmount(() => {
    isMounted = false;
    media?.revert();
    media = undefined;
});
</script>

<template>
    <section
        id="is-this-common"
        ref="scene"
        class="common-scene relative isolate h-svh min-h-[36rem] w-full overflow-hidden bg-[#073873]"
        aria-labelledby="is-this-common-title"
    >
        <div ref="stage" class="common-scene__stage">
            <header class="common-scene__question">
                <img
                    class="common-scene__thinking"
                    :src="`${ASSET_ROOT}/thinking.avif`"
                    alt=""
                    draggable="false"
                />
                <h2 id="is-this-common-title">Is this common?</h2>
            </header>

            <p class="common-scene__copy">
                For an estimated
                <strong class="common-scene__number">160 million</strong>
                people worldwide, axillary odor is not a mere inconvenience but
                a daily burden, significantly affecting
                <strong class="common-scene__emphasis">aspects of life</strong>
            </p>

            <div class="common-scene__gallery">
                <span
                    v-for="accent in 8"
                    :key="accent"
                    :class="`common-scene__accent common-scene__accent--${accent}`"
                    aria-hidden="true"
                />

                <figure
                    v-for="(moment, index) in moments"
                    :key="moment.name"
                    :class="`common-scene__card-wrap common-scene__card-wrap--${index + 1}`"
                >
                    <span class="common-scene__card-glow" aria-hidden="true" />
                    <img
                        class="common-scene__card"
                        :src="moment.src"
                        :alt="`${moment.name} can be affected by axillary odor`"
                        draggable="false"
                    />
                </figure>
            </div>
        </div>
    </section>
</template>

<style scoped>
.common-scene__stage {
    position: relative;
    width: 100%;
    height: 100%;
    margin-inline: auto;
    color: white;
    font-family: var(--font-belanosima), sans-serif;
}

.common-scene__question {
    position: absolute;
    top: 4.5%;
    left: 50%;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(1rem, 2vw, 2rem);
    transform: translateX(-50%);
    white-space: nowrap;
    will-change: transform, opacity;
}

.common-scene__question h2 {
    margin: 0;
    font-size: clamp(1.7rem, 2.8vw, 2.75rem);
    line-height: 1;
    text-shadow: 0 0.15em 0.35em rgb(0 25 63 / 26%);
}

.common-scene__thinking {
    display: block;
    width: clamp(7rem, 10vw, 10rem);
    height: auto;
    filter: drop-shadow(0 0.5rem 0.7rem rgb(0 26 65 / 25%));
    user-select: none;
}

.common-scene__copy {
    position: absolute;
    top: 23.5%;
    left: 50%;
    z-index: 18;
    width: 88%;
    margin: 0;
    transform: translateX(-50%);
    font-size: clamp(1.35rem, 2.35vw, 2.35rem);
    line-height: 1.27;
    text-align: center;
    text-wrap: balance;
    text-shadow: 0 0.12em 0.28em rgb(0 25 63 / 24%);
    will-change: transform, opacity;
}

.common-scene__number,
.common-scene__emphasis {
    white-space: nowrap;
}

.common-scene__number {
    margin-inline: 0.18em;
    color: #ffad3f;
    font-size: 1.35em;
}

.common-scene__emphasis {
    color: #64ddc5;
}

.common-scene__gallery {
    position: absolute;
    top: 42.7%;
    left: 50%;
    width: 100%;
    height: 50%;
    transform: translateX(-50%);
}

.common-scene__card-wrap {
    position: absolute;
    z-index: 10;
    width: 17.2vw;
    margin: 0;
    aspect-ratio: 0.78;
}

.common-scene__card-wrap--1 {
    top: 17%;
    left: 4.5%;
}

.common-scene__card-wrap--2 {
    top: 0;
    left: 28.5%;
}

.common-scene__card-wrap--3 {
    top: 19%;
    left: 54%;
}

.common-scene__card-wrap--4 {
    top: 0;
    left: 80%;
}

.common-scene__card,
.common-scene__card-glow {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: clamp(1.6rem, 2.7vw, 2.65rem);
}

.common-scene__card {
    z-index: 2;
    object-fit: cover;
    box-shadow: 0 0.65rem 1.4rem rgb(0 25 66 / 18%);
    user-select: none;
    will-change: transform, opacity;
}

.common-scene__card-glow {
    z-index: 1;
    background: #58a9eb;
    filter: blur(clamp(1.5rem, 3vw, 3.2rem));
    opacity: 0.72;
    transform: scale(0.94);
    will-change: transform, opacity;
}

.common-scene__accent {
    position: absolute;
    z-index: 1;
    display: block;
    border-radius: 999px;
    will-change: transform, opacity;
}

.common-scene__accent--1 {
    top: 9%;
    left: 0;
    width: 9.5%;
    height: 17%;
    background: #3f8be1;
}

.common-scene__accent--2 {
    top: 48%;
    left: 17%;
    width: 16%;
    height: 22%;
    background: #3f8be1;
}

.common-scene__accent--3 {
    top: 16%;
    left: 21%;
    width: 11%;
    height: 15%;
    background: #ffe45c;
}

.common-scene__accent--4 {
    top: 54%;
    left: 65%;
    width: 10%;
    height: 15%;
    background: #67d9c4;
}

.common-scene__accent--5 {
    top: 18%;
    right: 5%;
    width: 16%;
    height: 22%;
    background: #3f8be1;
}

.common-scene__accent--6 {
    top: 6%;
    right: 10%;
    width: 8%;
    height: 14%;
    background: #ffe45c;
}

.common-scene__accent--7 {
    top: -4%;
    right: 0.5%;
    width: 5.5%;
    height: 11%;
    background: #ffb145;
}

.common-scene__accent--8 {
    top: -11%;
    right: -1%;
    width: 2%;
    aspect-ratio: 1;
    background: #3f8be1;
}

@media (max-width: 52rem), (orientation: portrait) {
    .common-scene {
        min-height: 42rem;
    }

    .common-scene__question {
        display: none;
    }

    .common-scene__copy {
        top: 18.5%;
        width: min(88%, 32rem);
        font-size: clamp(1.18rem, 4.45vw, 1.65rem);
        line-height: 1.38;
    }

    .common-scene__number {
        margin-inline: 0.12em;
        font-size: 1.32em;
    }

    .common-scene__gallery {
        top: 37.5%;
        width: 100%;
        height: 42%;
    }

    .common-scene__card-wrap {
        width: min(29vw, 10.5rem);
        aspect-ratio: 0.84;
    }

    .common-scene__card-wrap--1 {
        top: 0;
        left: 12.8%;
    }

    .common-scene__card-wrap--2 {
        top: 42.5%;
        left: 62.6%;
    }

    .common-scene__card-wrap--3 {
        top: 1.5%;
        left: 50.2%;
    }

    .common-scene__card-wrap--4 {
        top: 42%;
        left: 24.3%;
    }

    .common-scene__card,
    .common-scene__card-glow {
        border-radius: clamp(1.25rem, 5.5vw, 2rem);
    }

    .common-scene__card-glow {
        filter: blur(clamp(1.25rem, 5vw, 2.25rem));
        opacity: 0.62;
    }

    .common-scene__accent--1 {
        top: -3%;
        left: 1.5%;
        width: 9.5%;
        height: 10%;
    }

    .common-scene__accent--2 {
        top: 7%;
        left: 36%;
        width: 13%;
        height: 12%;
    }

    .common-scene__accent--3 {
        top: 33%;
        left: 6%;
        width: 19%;
        height: 12%;
    }

    .common-scene__accent--4 {
        top: 24%;
        left: 76%;
        width: 11%;
        height: 12%;
    }

    .common-scene__accent--5 {
        top: 43%;
        right: 3.5%;
        width: 13%;
        height: 12%;
    }

    .common-scene__accent--6 {
        top: 5%;
        right: 1.5%;
        width: 17%;
        height: 10%;
    }

    .common-scene__accent--7 {
        top: -1.5%;
        right: 2.5%;
        width: 6%;
        height: 7%;
    }

    .common-scene__accent--8 {
        top: -9%;
        right: 0.8%;
        width: 3.5%;
    }
}

@media (max-height: 43rem) and (orientation: landscape) {
    .common-scene__question {
        top: 2.5%;
    }

    .common-scene__copy {
        top: 21%;
        font-size: clamp(1.15rem, 2.2vw, 1.8rem);
    }

    .common-scene__gallery {
        top: 40%;
        height: 54%;
    }
}

@media (prefers-reduced-motion: reduce) {
    .common-scene__question,
    .common-scene__copy,
    .common-scene__accent,
    .common-scene__card,
    .common-scene__card-glow {
        will-change: auto;
    }
}
</style>
