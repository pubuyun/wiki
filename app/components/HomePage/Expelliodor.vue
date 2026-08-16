<script setup lang="ts">
import { gsap } from "gsap";
import { onMounted, onUnmounted, ref, useId, watch } from "vue";

const showExplosionStudy = true;

const scene = ref<HTMLElement | null>(null);
const artwork = ref<SVGSVGElement | null>(null);
const spraySweep = ref<SVGRectElement | null>(null);
const sprayHead = ref<HTMLElement | null>(null);
const sprayMist = ref<HTMLElement | null>(null);
const product = ref<HTMLImageElement | null>(null);
const isInitialLoadingComplete = useState<boolean>(
    "initial-loading-complete",
    () => false,
);

// Product position is a viewport-width ratio.
const PRODUCT_START_POSITION = 0.75;
const PRODUCT_END_POSITION = 0.12;
const PRODUCT_TIMELINE_DURATION = 1;

const BACKGROUND_TIMELINE_DURATION = 1.22;

const SPRAY_BLOBS = [
    { x: 1870, y: 300, radius: 250 },
    { x: 1740, y: 690, radius: 330 },
    { x: 1580, y: 430, radius: 390 },
    { x: 1400, y: 760, radius: 310 },
    { x: 1240, y: 300, radius: 360 },
    { x: 1060, y: 600, radius: 430 },
    { x: 860, y: 360, radius: 350 },
    { x: 680, y: 730, radius: 380 },
    { x: 490, y: 430, radius: 410 },
    { x: 300, y: 690, radius: 330 },
    { x: 120, y: 390, radius: 310 },
] as const;

const SPRAY_PARTICLES = Array.from({ length: 22 }, (_, index) => ({
    id: index,
    x: 48 + ((index * 29) % 150),
    y: -62 + ((index * 47) % 130),
    size: 4 + ((index * 7) % 13),
}));

const componentId = useId().replaceAll(":", "");
const maskId = `expelliodor-spray-mask-${componentId}`;
const blurId = `expelliodor-spray-blur-${componentId}`;

let media: gsap.MatchMedia | undefined;
let introTimeline: gsap.core.Timeline | undefined;

function productX(position: number) {
    return window.innerWidth * position - (product.value?.offsetWidth ?? 0) / 2;
}

watch(isInitialLoadingComplete, (isComplete) => {
    if (isComplete) {
        introTimeline?.play();
    }
});

onMounted(() => {
    if (
        !scene.value ||
        !artwork.value ||
        !spraySweep.value ||
        !sprayHead.value ||
        !sprayMist.value ||
        !product.value
    ) {
        return;
    }

    media = gsap.matchMedia();
    media.add(
        {
            reduceMotion: "(prefers-reduced-motion: reduce)",
            allowMotion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
            const { reduceMotion } = context.conditions as {
                reduceMotion: boolean;
            };
            const blobs = gsap.utils.toArray<SVGCircleElement>(
                ".spray-mask__blob",
                scene.value,
            );
            const particles = gsap.utils.toArray<HTMLElement>(
                ".spray-head__particle",
                scene.value,
            );
            const backgroundDuration = BACKGROUND_TIMELINE_DURATION;

            if (reduceMotion) {
                gsap.set(spraySweep.value, {
                    scaleX: 1,
                    svgOrigin: "2220 540",
                });
                blobs.forEach((blob) => {
                    gsap.set(blob, { attr: { r: blob.dataset.radius } });
                });
                gsap.set(sprayHead.value, { autoAlpha: 0 });
                return;
            }

            gsap.set(spraySweep.value, {
                scaleX: 0,
                svgOrigin: "2220 540",
            });
            gsap.set(blobs, { attr: { r: 0 } });
            gsap.set(sprayHead.value, { yPercent: -50 });
            gsap.set(product.value, {
                rotation: 165,
                transformOrigin: "50% 50%",
            });
            gsap.set(particles, {
                autoAlpha: 0,
                scale: 0.2,
                transformOrigin: "50% 50%",
            });
            gsap.set(sprayMist.value, {
                autoAlpha: 0.2,
                scale: 0.65,
                transformOrigin: "0% 50%",
            });

            const timeline = gsap.timeline({
                paused: true,
                defaults: { ease: "none" },
            });

            introTimeline = timeline;

            timeline
                .to(
                    spraySweep.value,
                    { scaleX: 1, duration: backgroundDuration },
                    0,
                )
                .fromTo(
                    sprayHead.value,
                    { x: () => productX(PRODUCT_START_POSITION) },
                    {
                        x: () => productX(PRODUCT_END_POSITION),
                        duration: PRODUCT_TIMELINE_DURATION,
                    },
                    0,
                )
                .to(
                    sprayMist.value,
                    {
                        autoAlpha: 0.78,
                        scale: 1.08,
                        duration: PRODUCT_TIMELINE_DURATION * 0.16,
                        ease: "power1.out",
                    },
                    0,
                )
                .to(
                    sprayMist.value,
                    {
                        autoAlpha: 0,
                        scale: 1.3,
                        duration: PRODUCT_TIMELINE_DURATION * 0.16,
                        ease: "power1.out",
                    },
                    PRODUCT_TIMELINE_DURATION * 0.84,
                );

            blobs.forEach((blob, index) => {
                const start =
                    (index / Math.max(blobs.length - 1, 1)) *
                    backgroundDuration *
                    0.7;
                timeline.to(
                    blob,
                    {
                        attr: { r: blob.dataset.radius },
                        duration: backgroundDuration * 0.3,
                        ease: "power1.out",
                    },
                    start,
                );
            });

            particles.forEach((particle, index) => {
                const start =
                    (index / particles.length) *
                    PRODUCT_TIMELINE_DURATION *
                    0.76;
                timeline
                    .to(
                        particle,
                        {
                            autoAlpha: 0.82,
                            scale: 1,
                            duration: PRODUCT_TIMELINE_DURATION * 0.07,
                            ease: "power1.out",
                        },
                        start,
                    )
                    .to(
                        particle,
                        {
                            autoAlpha: 0,
                            scale: 1.8,
                            duration: PRODUCT_TIMELINE_DURATION * 0.16,
                            ease: "power1.out",
                        },
                        start + PRODUCT_TIMELINE_DURATION * 0.07,
                    );
            });

            if (isInitialLoadingComplete.value) {
                timeline.play();
            }

            return () => {
                if (introTimeline === timeline) {
                    introTimeline = undefined;
                }
            };
        },
        scene.value,
    );
});

onUnmounted(() => {
    media?.revert();
    introTimeline = undefined;
});
</script>

<template>
    <section
        id="expelliodor"
        ref="scene"
        class="expelliodor-scene relative isolate grid h-svh w-full place-items-center overflow-hidden bg-[#03316d]"
        aria-labelledby="expelliodor-title"
    >
        <h1 id="expelliodor-title" class="sr-only">Expelliodor</h1>

        <Explosion v-if="showExplosionStudy" />

        <svg
            v-if="!showExplosionStudy"
            ref="artwork"
            class="expelliodor-scene__artwork block h-auto w-[min(92vw,120rem)] rotate-6 overflow-visible max-[40rem]:w-[115vw]"
            viewBox="0 0 1920 1080"
            aria-hidden="true"
        >
            <defs>
                <filter
                    :id="blurId"
                    x="-400"
                    y="-400"
                    width="2800"
                    height="1880"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                >
                    <feGaussianBlur stdDeviation="34" />
                </filter>
                <mask
                    :id="maskId"
                    x="0"
                    y="0"
                    width="1920"
                    height="1080"
                    maskUnits="userSpaceOnUse"
                    class="[mask-type:luminance]"
                >
                    <rect width="1920" height="1080" fill="#000" />
                    <g :filter="`url(#${blurId})`">
                        <rect
                            ref="spraySweep"
                            x="-300"
                            y="-180"
                            width="2520"
                            height="1440"
                            fill="#fff"
                        />
                        <circle
                            v-for="blob in SPRAY_BLOBS"
                            :key="`${blob.x}-${blob.y}`"
                            class="spray-mask__blob"
                            :cx="blob.x"
                            :cy="blob.y"
                            r="0"
                            :data-radius="blob.radius"
                            fill="#fff"
                        />
                    </g>
                </mask>
            </defs>

            <g :mask="`url(#${maskId})`">
                <image
                    href="https://static.igem.wiki/teams/6133/wiki/homepage/expelliodorbg.avif"
                    width="1920"
                    height="1080"
                    preserveAspectRatio="xMidYMid meet"
                />
                <text
                    class="expelliodor-scene__title expelliodor-scene__title--shadow fill-[#0a4297] text-[190px] font-normal tracking-[0.01em]"
                    x="1000"
                    y="645"
                    text-anchor="middle"
                    transform="rotate(-6 1000 645)"
                >
                    Expelliodor
                </text>
                <text
                    class="expelliodor-scene__title fill-white text-[190px] font-normal tracking-[0.01em]"
                    x="988"
                    y="640"
                    text-anchor="middle"
                    transform="rotate(-6 988 640)"
                >
                    Expelliodor
                </text>
            </g>
        </svg>

        <div
            v-if="!showExplosionStudy"
            ref="sprayHead"
            class="spray-head pointer-events-none absolute top-1/2 left-0 z-2 aspect-[213/505] w-[clamp(7rem,12vw,11rem)] will-change-transform max-[40rem]:w-[clamp(6rem,23vw,8rem)]"
            aria-hidden="true"
        >
            <span
                ref="sprayMist"
                class="spray-head__mist absolute top-[64%] left-[42%] z-0 aspect-[2.4] w-[230%] -translate-y-1/2 rotate-8 bg-[radial-gradient(ellipse_at_left,rgb(218_249_255_/_70%)_0%,rgb(137_220_247_/_35%)_34%,rgb(89_178_232_/_0%)_76%)] blur-[12px] max-[40rem]:w-[190%]"
            />
            <span
                v-for="particle in SPRAY_PARTICLES"
                :key="particle.id"
                class="spray-head__particle"
                :style="`--particle-x: ${particle.x}%; --particle-y: ${particle.y}%; --particle-size: ${particle.size}px`"
            />
            <img
                ref="product"
                class="expelliodor-scene__product relative z-2 block h-auto w-full origin-center will-change-transform select-none"
                src="https://static.igem.wiki/teams/6133/wiki/homepage/product.avif"
                alt=""
                fetchpriority="high"
                draggable="false"
            />
        </div>
    </section>
</template>

<style scoped>
.expelliodor-scene__title {
    font-family: var(--font-righteous);
}

.spray-head__particle {
    position: absolute;
    z-index: 1;
    top: calc(69% + var(--particle-y));
    left: var(--particle-x);
    width: var(--particle-size);
    aspect-ratio: 1;
    border-radius: 50%;
    background: rgb(225 250 255 / 86%);
    box-shadow: 0 0 0.8rem rgb(107 213 247 / 70%);
}
</style>
