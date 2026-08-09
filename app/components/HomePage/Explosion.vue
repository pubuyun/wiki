<script setup lang="ts">
import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { onMounted, onUnmounted, ref, watch } from "vue";

const BURST_ORIGIN = { x: 392, y: 758 } as const;

const CLOUD_START_PATH =
    "M 369 758 C 369 741 384 730 401 734 C 419 734 430 748 426 765 C 427 783 411 796 394 792 C 377 796 363 782 367 766 C 364 763 365 760 369 758 Z";
const CLOUD_BURST_PATH =
    "M 95 774 C 12 677 43 541 151 473 C 89 341 175 198 323 183 C 365 41 543 -46 688 18 C 818 -65 1008 -35 1090 101 C 1243 55 1402 133 1441 271 C 1596 267 1711 384 1688 521 C 1827 594 1842 758 1732 849 C 1736 991 1588 1093 1432 1052 C 1311 1156 1121 1139 1028 1032 C 875 1139 665 1100 592 964 C 425 1001 274 932 238 818 C 184 832 131 815 95 774 Z";
const CLOUD_FINAL_PATH =
    "M 137 760 C 72 672 94 558 190 493 C 139 378 220 256 348 243 C 391 112 550 43 675 98 C 793 29 959 57 1036 174 C 1174 135 1310 207 1346 326 C 1482 322 1586 421 1565 541 C 1690 607 1700 748 1607 827 C 1613 949 1485 1035 1351 1002 C 1244 1090 1083 1078 996 983 C 860 1074 684 1045 615 925 C 474 958 340 901 308 800 C 244 817 179 801 137 760 Z";

const PARTICLE_COLORS = [
    "#a9dcf7",
    "#75c7ee",
    "#69d6c2",
    "#ffdc70",
    "#ffb347",
    "#ff73aa",
] as const;

const PARTICLES = Array.from({ length: 44 }, (_, index) => {
    const angle = ((index * 137.5 - 164) * Math.PI) / 180;
    const distance = 180 + ((index * 83) % 650);

    return {
        id: index,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: 7 + ((index * 11) % 24),
        color: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
        rotation: (index % 2 === 0 ? 1 : -1) * (80 + ((index * 41) % 220)),
    };
});

const RAYS = [
    { x: 115, y: 562, color: "#ff73aa", width: 27 },
    { x: 260, y: 449, color: "#ffdc70", width: 31 },
    { x: 426, y: 406, color: "#69d6c2", width: 24 },
    { x: 594, y: 458, color: "#ff73aa", width: 28 },
    { x: 711, y: 582, color: "#ffb347", width: 34 },
    { x: 752, y: 749, color: "#69d6c2", width: 25 },
] as const;

const root = ref<HTMLElement | null>(null);
const isInitialLoadingComplete = useState<boolean>(
    "initial-loading-complete",
    () => false,
);

let media: gsap.MatchMedia | undefined;
let explosionTimeline: gsap.core.Timeline | undefined;

watch(isInitialLoadingComplete, (isComplete) => {
    if (isComplete) explosionTimeline?.play();
});

onMounted(() => {
    if (!root.value) return;

    gsap.registerPlugin(MorphSVGPlugin);
    media = gsap.matchMedia();
    media.add(
        {
            reduceMotion: "(prefers-reduced-motion: reduce)",
            allowMotion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
            const cloud =
                root.value?.querySelector<SVGPathElement>(".explosion__cloud");
            const flash =
                root.value?.querySelector<SVGPathElement>(".explosion__flash");
            const wand =
                root.value?.querySelector<SVGGElement>(".explosion__wand");
            const rays = gsap.utils.toArray<SVGLineElement>(
                ".explosion__ray",
                root.value,
            );
            const particles = gsap.utils.toArray<SVGCircleElement>(
                ".explosion__particle",
                root.value,
            );
            const shockwaves = gsap.utils.toArray<SVGCircleElement>(
                ".explosion__shockwave",
                root.value,
            );
            const star =
                root.value?.querySelector<SVGPathElement>(".explosion__star");
            const { reduceMotion } = context.conditions as {
                reduceMotion: boolean;
            };

            if (!cloud || !flash || !wand || !star) return;

            if (reduceMotion) {
                gsap.set(cloud, {
                    attr: { d: CLOUD_FINAL_PATH },
                    autoAlpha: 1,
                });
                gsap.set(star, { autoAlpha: 1 });
                gsap.set([...rays, ...particles, ...shockwaves, flash], {
                    autoAlpha: 0,
                });
                return;
            }

            gsap.set(cloud, { autoAlpha: 0 });
            gsap.set(rays, {
                autoAlpha: 0,
                scale: 0.08,
                svgOrigin: `${BURST_ORIGIN.x} ${BURST_ORIGIN.y}`,
            });
            gsap.set(particles, {
                autoAlpha: 0,
                scale: 0,
                svgOrigin: `${BURST_ORIGIN.x} ${BURST_ORIGIN.y}`,
            });
            gsap.set(shockwaves, {
                autoAlpha: 0,
                scale: 0.08,
                svgOrigin: `${BURST_ORIGIN.x} ${BURST_ORIGIN.y}`,
            });
            gsap.set(flash, {
                autoAlpha: 0,
                scale: 0.12,
                svgOrigin: `${BURST_ORIGIN.x} ${BURST_ORIGIN.y}`,
            });
            gsap.set(star, {
                autoAlpha: 0,
                scale: 0,
                transformOrigin: "50% 50%",
            });
            gsap.set(wand, {
                rotation: -13,
                svgOrigin: "235 1080",
            });

            const timeline = gsap.timeline({
                paused: true,
                defaults: { ease: "power2.out" },
            });
            explosionTimeline = timeline;

            timeline
                .addLabel("charge", 0)
                .to(
                    wand,
                    {
                        rotation: 6,
                        duration: 0.38,
                        ease: "back.out(2.8)",
                    },
                    "charge",
                )
                .addLabel("burst", 0.27)
                .set(cloud, { autoAlpha: 1 }, "burst")
                .to(
                    cloud,
                    {
                        morphSVG: {
                            shape: CLOUD_BURST_PATH,
                            type: "rotational",
                            map: "complexity",
                        },
                        duration: 0.68,
                        ease: "expo.out",
                    },
                    "burst",
                )
                .to(
                    cloud,
                    {
                        morphSVG: {
                            shape: CLOUD_FINAL_PATH,
                            type: "rotational",
                            map: "complexity",
                        },
                        duration: 0.36,
                        ease: "back.out(1.7)",
                    },
                    "burst+=0.59",
                )
                .to(
                    flash,
                    {
                        autoAlpha: 1,
                        scale: 1.45,
                        duration: 0.14,
                        ease: "power4.out",
                    },
                    "burst",
                )
                .to(
                    flash,
                    {
                        autoAlpha: 0,
                        scale: 2.4,
                        duration: 0.28,
                    },
                    "burst+=0.11",
                )
                .to(
                    rays,
                    {
                        autoAlpha: 1,
                        scale: 1,
                        duration: 0.3,
                        stagger: 0.018,
                        ease: "back.out(3.2)",
                    },
                    "burst",
                )
                .to(
                    rays,
                    {
                        autoAlpha: 0,
                        scale: 1.28,
                        duration: 0.25,
                    },
                    "burst+=0.34",
                )
                .to(
                    shockwaves,
                    {
                        autoAlpha: 0.72,
                        scale: (index) => 4.3 + index * 2.2,
                        duration: (index) => 0.52 + index * 0.12,
                        stagger: 0.08,
                        ease: "expo.out",
                    },
                    "burst+=0.02",
                )
                .to(
                    shockwaves,
                    {
                        autoAlpha: 0,
                        duration: 0.26,
                        stagger: 0.06,
                    },
                    "burst+=0.38",
                )
                .set(shockwaves, { autoAlpha: 0 }, "burst+=0.78")
                .to(
                    particles,
                    {
                        autoAlpha: 1,
                        scale: (index) => 0.7 + (index % 4) * 0.16,
                        x: (index) => PARTICLES[index]?.x ?? 0,
                        y: (index) => PARTICLES[index]?.y ?? 0,
                        rotation: (index) => PARTICLES[index]?.rotation ?? 0,
                        duration: (index) => 0.58 + (index % 7) * 0.045,
                        stagger: 0.006,
                        ease: "power3.out",
                    },
                    "burst+=0.015",
                )
                .to(
                    particles,
                    {
                        autoAlpha: 0,
                        scale: 0.15,
                        duration: 0.34,
                        stagger: 0.004,
                        ease: "power1.in",
                    },
                    "burst+=0.5",
                )
                .to(
                    star,
                    {
                        autoAlpha: 1,
                        scale: 1,
                        rotation: 8,
                        duration: 0.42,
                        ease: "back.out(2.5)",
                    },
                    "burst+=0.64",
                );

            if (isInitialLoadingComplete.value) timeline.play();

            return () => {
                if (explosionTimeline === timeline) {
                    explosionTimeline = undefined;
                }
            };
        },
        root.value,
    );
});

onUnmounted(() => {
    media?.revert();
    media = undefined;
    explosionTimeline = undefined;
});
</script>

<template>
    <div
        ref="root"
        class="explosion pointer-events-none absolute inset-0 z-10 overflow-hidden bg-[#073873]"
        aria-hidden="true"
    >
        <svg
            class="h-full w-full"
            viewBox="0 0 1920 1080"
            preserveAspectRatio="xMinYMid slice"
        >
            <path
                class="explosion__cloud"
                :d="CLOUD_START_PATH"
                fill="#a9dcf7"
            />

            <path
                class="explosion__star"
                d="M 1651 164 C 1661 199 1678 216 1715 226 C 1678 237 1660 255 1651 292 C 1640 255 1623 237 1587 226 C 1624 216 1641 199 1651 164 Z"
                fill="#9fd8f5"
            />

            <g class="explosion__shockwaves" fill="none">
                <circle
                    v-for="index in 2"
                    :key="index"
                    class="explosion__shockwave"
                    :cx="BURST_ORIGIN.x"
                    :cy="BURST_ORIGIN.y"
                    :r="34 + index * 7"
                    :stroke="
                        PARTICLE_COLORS[(index + 2) % PARTICLE_COLORS.length]
                    "
                    :stroke-width="12 - index * 2"
                />
            </g>

            <g class="explosion__particles">
                <circle
                    v-for="particle in PARTICLES"
                    :key="particle.id"
                    class="explosion__particle"
                    :cx="BURST_ORIGIN.x"
                    :cy="BURST_ORIGIN.y"
                    :r="particle.size"
                    :fill="particle.color"
                />
            </g>

            <g class="explosion__burst" fill="none">
                <line
                    v-for="ray in RAYS"
                    :key="`${ray.x}-${ray.y}`"
                    class="explosion__ray"
                    :x1="BURST_ORIGIN.x"
                    :y1="BURST_ORIGIN.y"
                    :x2="ray.x"
                    :y2="ray.y"
                    :stroke="ray.color"
                    :stroke-width="ray.width"
                    stroke-linecap="round"
                />
                <path
                    class="explosion__flash"
                    d="M 392 671 C 404 720 425 742 477 758 C 426 774 404 796 392 847 C 380 796 358 774 307 758 C 358 742 380 720 392 671 Z"
                    fill="#e8fbff"
                />
            </g>

            <g class="explosion__wand">
                <path
                    d="M 196 1080 L 357 765 Q 367 746 386 754 L 404 762 L 260 1080 Z"
                    fill="#58b1e2"
                />
                <path
                    d="M 260 1080 L 393 775"
                    fill="none"
                    stroke="#153f98"
                    stroke-width="12"
                    stroke-linecap="round"
                />
            </g>
        </svg>
    </div>
</template>
