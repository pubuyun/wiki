<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onMounted, onUnmounted, ref } from "vue";

import {
    HOME_CHAPTERS,
    homeChapterActivationLabel,
} from "~/utils/home-chapters";

gsap.registerPlugin(ScrollTrigger);

const scene = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);

// 世界地图放大倍数调节区：1 为完整显示，增大时从两侧等量放大。
const WORLD_MAP_SCALE = 1;

const regions = [
    {
        name: "South Asia",
        value: 70,
        display: "70%",
        className: "world-stat-card--south-asia",
        origin: "48% 100%",
        fromX: "1vw",
        fromY: "14vh",
    },
    {
        name: "East Asia",
        value: 5,
        display: "5%",
        className: "world-stat-card--east-asia",
        origin: "0% 92%",
        fromX: "-10vw",
        fromY: "14vh",
    },
    {
        name: "Europe",
        value: 85,
        display: "85%",
        className: "world-stat-card--europe",
        origin: "82% 70%",
        fromX: "11vw",
        fromY: "10vh",
    },
    {
        name: "Africa",
        value: 99.9,
        display: "99.9%",
        className: "world-stat-card--africa",
        origin: "50% 50%",
        fromX: "0vw",
        fromY: "-5vh",
    },
] as const;

let media: gsap.MatchMedia | undefined;

onMounted(() => {
    if (!scene.value || !stage.value) return;

    media = gsap.matchMedia();
    media.add(
        {
            reduceMotion: "(prefers-reduced-motion: reduce)",
            allowMotion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
            const cards = gsap.utils.toArray<HTMLElement>(
                ".world-stat-card",
                stage.value,
            );
            const values = gsap.utils.toArray<HTMLElement>(
                ".world-stat-card__value",
                stage.value,
            );
            const footer = stage.value?.querySelector<HTMLElement>(
                ".world-stat-scene__footer",
            );
            const { reduceMotion } = context.conditions as {
                reduceMotion: boolean;
            };
            const renderFinalValues = () => {
                values.forEach((element, index) => {
                    element.textContent = regions[index]?.display ?? "0%";
                });
            };

            const timeline = gsap.timeline({
                defaults: { ease: "power3.out" },
                onComplete: renderFinalValues,
                scrollTrigger: {
                    id: "world-stat-story",
                    trigger: scene.value,
                    start: "top top",
                    end: "+=260%",
                    pin: true,
                    scrub: 0.7,
                    onLeave: renderFinalValues,
                    onRefresh: (self) => {
                        if (self.progress >= 0.999) renderFinalValues();
                    },
                },
            });

            timeline.addLabel(
                homeChapterActivationLabel(HOME_CHAPTERS.worldStat),
                0,
            );

            if (reduceMotion) {
                renderFinalValues();
                gsap.set([...cards, footer], { clearProps: "all" });
                timeline.addLabel(HOME_CHAPTERS.worldStat, 0);
                timeline.to(scene.value, { duration: 0.01 });
                return;
            }

            gsap.set(footer, { autoAlpha: 0, y: 20 });

            regions.forEach((region, index) => {
                const card = cards[index];
                const valueElement = values[index];
                if (!card || !valueElement) return;

                const counter = { value: 0 };
                const start = 0;
                valueElement.textContent = "0%";
                gsap.set(card, {
                    autoAlpha: 0,
                    scale: 0.08,
                    x: region.fromX,
                    y: region.fromY,
                    transformOrigin: region.origin,
                });

                timeline
                    .fromTo(
                        card,
                        {
                            autoAlpha: 0,
                            scale: 0.08,
                            x: region.fromX,
                            y: region.fromY,
                            transformOrigin: region.origin,
                        },
                        {
                            autoAlpha: 1,
                            scale: 1,
                            x: 0,
                            y: 0,
                            duration: 0.72,
                            ease: "back.out(1.45)",
                            immediateRender: true,
                        },
                        start,
                    )
                    .to(
                        counter,
                        {
                            value: region.value,
                            duration: 0.7,
                            ease: "power2.out",
                            onUpdate: () => {
                                valueElement.textContent = `${
                                    region.value % 1 === 0
                                        ? Math.round(counter.value)
                                        : counter.value.toFixed(1)
                                }%`;
                            },
                        },
                        start + 0.72,
                    );
            });

            timeline
                .to(footer, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.25)
                .addLabel(HOME_CHAPTERS.worldStat);
        },
        scene.value,
    );
});

onUnmounted(() => {
    media?.revert();
});
</script>

<template>
    <section
        id="world-stat"
        ref="scene"
        class="world-stat-scene relative isolate h-svh min-h-[36rem] w-full overflow-hidden bg-[#073873]"
        aria-labelledby="world-stat-title"
    >
        <h2 id="world-stat-title" class="sr-only">
            Odor–associated ABCC11 allele frequency around the world
        </h2>

        <div ref="stage" class="world-stat-scene__stage">
            <Icon
                icon="fxemoji:worldmap"
                class="world-stat-scene__map"
                :style="{
                    '--world-map-width': `${WORLD_MAP_SCALE * 100}%`,
                }"
                aria-hidden="true"
            />

            <div class="world-stat-scene__grid">
                <article
                    v-for="region in regions"
                    :key="region.name"
                    class="world-stat-card"
                    :class="region.className"
                    :aria-label="`${region.name}: ${region.display}`"
                >
                    <h3 class="world-stat-card__name">
                        {{ region.name }}
                    </h3>
                    <span class="world-stat-card__value" aria-hidden="true">
                        {{ region.display }}
                    </span>
                </article>
            </div>

            <p class="world-stat-scene__footer">
                Odor–associated ABCC11 allele frequency
            </p>
        </div>
    </section>
</template>

<style scoped>
.world-stat-scene__stage {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: clamp(1.5rem, 5svh, 3rem);
    width: min(100%, 100rem);
    height: 100%;
    margin-inline: auto;
    padding: 8svh 5.5%;
}
.world-stat-scene__map {
    position: absolute;
    z-index: 0;
    top: 50%;
    left: 50%;
    width: var(--world-map-width, 100%);
    height: auto;
    color: #2e6dbf;
    transform: translate(-50%, -50%);
    opacity: 0.65;
    pointer-events: none;
}
.world-stat-scene__map :deep(path) {
    fill: #2e6dbf;
}
.world-stat-scene__grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(2, minmax(0, 1fr));
    gap: clamp(1rem, 3.5vw, 2.5rem);
    flex: 1;
    min-height: 0;
    max-height: 65svh;
}
.world-stat-card {
    container-type: inline-size;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: clamp(0.5rem, 1.5vw, 1.5rem);
    min-width: 0;
    padding: clamp(1rem, 2.5vw, 2.5rem);
    border-radius: clamp(1.5rem, 2.5vw, 3rem);
    color: #073873;
    font-family: var(--font-belanosima), sans-serif;
}
.world-stat-card__name,
.world-stat-card__value {
    margin: 0;
    font-weight: 400;
    line-height: 1.05;
}
.world-stat-card__name {
    max-width: 38%;
    font-size: clamp(1.25rem, 9cqi, 4rem);
    text-align: center;
    text-wrap: balance;
}
.world-stat-card__value {
    flex: 0 0 auto;
    color: inherit;
    font-size: clamp(2rem, 17cqi, 8rem);
    white-space: nowrap;
}
.world-stat-card--south-asia {
    background: #53c3d4;
}
.world-stat-card--east-asia {
    background: #60c5b2;
}
.world-stat-card--europe {
    background: #72b8e3;
}
.world-stat-card--africa {
    background: #88b5df;
}
.world-stat-scene__footer {
    position: relative;
    z-index: 1;
    margin: 0;
    color: #fff;
    font-family: var(--font-belanosima), sans-serif;
    font-size: clamp(1.25rem, 3vw, 3rem);
    line-height: 1.2;
    text-align: center;
    text-wrap: balance;
}
@media (max-width: 40rem) {
    .world-stat-scene__stage {
        padding: 10svh 5%;
    }
    .world-stat-scene__grid {
        gap: 1rem;
        max-height: 62svh;
    }
    .world-stat-card {
        flex-direction: column;
        justify-content: center;
        gap: 1rem;
        padding: 1rem 0.5rem;
    }
    .world-stat-card__name {
        max-width: none;
        font-size: clamp(1.2rem, 5vw, 2rem);
    }
    .world-stat-card__value {
        font-size: clamp(2rem, 10vw, 4rem);
    }
}
@media (max-height: 32rem) and (min-width: 40.01rem) {
    .world-stat-scene {
        min-height: 24rem;
    }
    .world-stat-scene__stage {
        padding-block: 2rem;
        gap: 1rem;
    }
    .world-stat-scene__grid {
        max-height: none;
        gap: 1rem;
    }
    .world-stat-card__name {
        font-size: clamp(1.25rem, 3vw, 2rem);
    }
    .world-stat-card__value {
        font-size: clamp(2rem, 6vw, 4rem);
    }
}
</style>
