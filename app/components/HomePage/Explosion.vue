<script setup lang="ts">
import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { onMounted, onUnmounted, ref, watch } from "vue";

const CLOUD_START_PATH =
    "M 369 758 C 369 741 384 730 401 734 C 419 734 430 748 426 765 C 427 783 411 796 394 792 C 377 796 363 782 367 766 C 364 763 365 760 369 758 Z";
const CLOUD_BURST_PATH =
    "M 95 774 C 12 677 43 541 151 473 C 89 341 175 198 323 183 C 365 41 543 -46 688 18 C 818 -65 1008 -35 1090 101 C 1243 55 1402 133 1441 271 C 1596 267 1711 384 1688 521 C 1827 594 1842 758 1732 849 C 1736 991 1588 1093 1432 1052 C 1311 1156 1121 1139 1028 1032 C 875 1139 665 1100 592 964 C 425 1001 274 932 238 818 C 184 832 131 815 95 774 Z";
const CLOUD_FINAL_PATH =
    "M 137 760 C 72 672 94 558 190 493 C 139 378 220 256 348 243 C 391 112 550 43 675 98 C 793 29 959 57 1036 174 C 1174 135 1310 207 1346 326 C 1482 322 1586 421 1565 541 C 1690 607 1700 748 1607 827 C 1613 949 1485 1035 1351 1002 C 1244 1090 1083 1078 996 983 C 860 1074 684 1045 615 925 C 474 958 340 901 308 800 C 244 817 179 801 137 760 Z";

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
            const star =
                root.value?.querySelector<SVGPathElement>(".explosion__star");
            const { reduceMotion } = context.conditions as {
                reduceMotion: boolean;
            };

            if (!cloud || !star) return;

            if (reduceMotion) {
                gsap.set(cloud, {
                    attr: { d: CLOUD_FINAL_PATH },
                    autoAlpha: 1,
                });
                gsap.set(star, { autoAlpha: 1 });
                return;
            }

            gsap.set(cloud, { autoAlpha: 0 });
            gsap.set(star, {
                autoAlpha: 0,
                scale: 0,
                transformOrigin: "50% 50%",
            });

            const timeline = gsap.timeline({
                paused: true,
                defaults: { ease: "power2.out" },
            });
            explosionTimeline = timeline;

            timeline
                .addLabel("burst", 0)
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
                    star,
                    {
                        autoAlpha: 1,
                        scale: 1,
                        rotation: 8,
                        duration: 0.42,
                        ease: "back.out(2.5)",
                    },
                    "burst+=0.62",
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
        </svg>
    </div>
</template>
