<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onMounted, onUnmounted, ref } from "vue";

gsap.registerPlugin(ScrollTrigger);

const scene = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);

// 世界地图放大倍数调节区：1 为完整显示，增大时从两侧等量放大。
const WORLD_MAP_SCALE = 1;

const regions = [
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

            if (reduceMotion) {
                renderFinalValues();
                gsap.set([...cards, footer], { clearProps: "all" });
                return;
            }

            gsap.set(footer, { autoAlpha: 0, y: 20 });

            const timeline = gsap.timeline({
                defaults: { ease: "power3.out" },
                onComplete: renderFinalValues,
                scrollTrigger: {
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

            regions.forEach((region, index) => {
                const card = cards[index];
                const valueElement = values[index];
                if (!card || !valueElement) return;

                const counter = { value: 0 };
                const start = 0;

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

            timeline.to(footer, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.25);
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
            Unmutated ABCC11 gene frequency around the world
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
                    0%
                </span>
            </article>

            <p class="world-stat-scene__footer">
                Unmutated ABCC11 Gene Frequency
            </p>
        </div>
    </section>
</template>

<style scoped>
.world-stat-scene__stage {
    position: relative;
    width: 100%;
    height: 100%;
    margin-inline: auto;
    overflow: hidden;
}

.world-stat-scene__map {
    position: absolute;
    z-index: 0;
    top: 56%;
    left: 50%;
    width: var(--world-map-width, 100%);
    height: auto;
    color: #2e6dbf;
    transform: translate(-50%, -50%);
    opacity: 0.96;
}

.world-stat-scene__map :deep(path) {
    fill: #2e6dbf;
}

.world-stat-card {
    position: absolute;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: clamp(0.5rem, 2vw, 2rem);
    padding: clamp(1rem, 3vw, 3rem);
    border-radius: clamp(1.5rem, 3vw, 3.25rem);
    font-family: var(--font-righteous), sans-serif;
    will-change: transform, opacity;
}

.world-stat-card__name,
.world-stat-card__value {
    margin: 0;
    line-height: 0.95;
}

.world-stat-card__name {
    font-size: clamp(1.7rem, 4vw, 4.5rem);
    font-weight: 400;
    text-align: center;
    text-wrap: balance;
}

.world-stat-card__value {
    flex: 0 0 auto;
    color: #fff;
    font-size: clamp(3.4rem, 8.5vw, 9.5rem);
    white-space: nowrap;
}

.world-stat-card--europe {
    top: 10.5%;
    left: 6.5%;
    width: 42.5%;
    height: 32.5%;
    color: #fff;
    background: #0a4297;
}

.world-stat-card--south-asia {
    top: 10.5%;
    left: 51%;
    width: 32.5%;
    height: 32.5%;
    color: #073873;
    background: #28b5d4;
}

.world-stat-card--south-asia .world-stat-card__name {
    max-width: 42%;
}

.world-stat-card--east-asia {
    top: 10.5%;
    right: 5%;
    flex-direction: column;
    width: 10%;
    height: 32.5%;
    padding: clamp(0.75rem, 1.2vw, 1.5rem);
    color: #073873;
    background: #65dbbf;
}

.world-stat-card--east-asia .world-stat-card__name {
    font-size: clamp(1.25rem, 3vw, 3.2rem);
}

.world-stat-card--east-asia .world-stat-card__value {
    font-size: clamp(2.7rem, 5.8vw, 6.5rem);
}

.world-stat-card--africa {
    top: 47.5%;
    right: 5%;
    left: 6.5%;
    height: 35.5%;
    color: #fff;
    background: #0a0044;
}

.world-stat-card--africa .world-stat-card__value {
    font-size: clamp(4.4rem, 10.5vw, 12rem);
}

.world-stat-scene__footer {
    position: absolute;
    z-index: 2;
    right: 1rem;
    bottom: 4%;
    left: 1rem;
    margin: 0;
    color: #fff;
    font-family: var(--font-righteous), sans-serif;
    font-size: clamp(1.4rem, 3.2vw, 3.8rem);
    line-height: 1;
    text-align: center;
    text-wrap: balance;
    will-change: transform, opacity;
}

@media (max-width: 52rem) {
    .world-stat-card {
        padding: clamp(0.75rem, 2.5vw, 1.5rem);
        border-radius: clamp(1rem, 3vw, 2rem);
    }

    .world-stat-card__name {
        font-size: clamp(1.25rem, 4vw, 2.25rem);
    }

    .world-stat-card__value {
        font-size: clamp(2.5rem, 8vw, 5rem);
    }

    .world-stat-card--europe {
        width: 43%;
    }

    .world-stat-card--south-asia {
        left: 51%;
        width: 31%;
    }

    .world-stat-card--east-asia {
        right: 3%;
        width: 13%;
    }

    .world-stat-card--east-asia .world-stat-card__name {
        font-size: clamp(0.9rem, 3vw, 1.65rem);
    }

    .world-stat-card--east-asia .world-stat-card__value {
        font-size: clamp(2rem, 6vw, 3.75rem);
    }

    .world-stat-card--africa {
        right: 3%;
    }
}

@media (orientation: portrait) and (max-width: 40rem) {
    .world-stat-card--europe,
    .world-stat-card--south-asia {
        top: 8%;
        flex-direction: column;
        height: 25%;
        gap: 0.25rem;
    }

    .world-stat-card--europe {
        left: 3%;
        width: 45%;
    }

    .world-stat-card--south-asia {
        left: 50%;
        width: 47%;
    }

    .world-stat-card--south-asia .world-stat-card__name {
        max-width: none;
    }

    .world-stat-card--east-asia {
        top: 36%;
        right: 3%;
        width: 24%;
        height: 22%;
    }

    .world-stat-card--africa {
        top: 36%;
        right: auto;
        left: 3%;
        width: 69%;
        height: 38%;
    }

    .world-stat-card--africa .world-stat-card__value {
        font-size: clamp(3rem, 13vw, 5.5rem);
    }

    .world-stat-scene__footer {
        bottom: 6%;
        font-size: clamp(1.2rem, 5vw, 2rem);
    }
}
</style>
