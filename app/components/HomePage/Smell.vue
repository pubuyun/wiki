<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CSSProperties } from "vue";
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";

gsap.registerPlugin(ScrollTrigger);

const scene = ref<HTMLElement | null>(null);
const revealPath = ref<SVGPathElement | null>(null);
const guidePath = ref<SVGPathElement | null>(null);
const orangeWave = ref<SVGPathElement | null>(null);
const yellowWave = ref<SVGPathElement | null>(null);
const highlightClip = ref<SVGPathElement | null>(null);

type SceneVariables = CSSProperties & Record<`--${string}`, string | number>;

// Scene tuning knobs: positions are relative to the 1600 x 900 composition.
const SCENE_LAYOUT = {
    title: {
        x: "50%",
        y: "10%",
        width: "80%",
        size: "clamp(1.0rem, 2.5vw, 2.45rem)",
    },
    questioning: { x: "11%", y: "13%", width: "15%" },
    mainCopy: {
        x: "47%",
        y: "47%",
        width: "66%",
        size: "clamp(1.5rem, 3.45vw, 4rem)",
        rotation: "-8deg",
    },
    thought: {
        x: "55%",
        y: "82%",
        width: "38%",
        size: "clamp(1.1rem, 2.2vw, 2.55rem)",
    },
    wronged: { x: "90%", y: "75%", width: "14%" },
    rotateTop: { x: "22%", y: "36%", width: "5.5%", rotation: "-10deg" },
    rotateBottom: { x: "7%", y: "90%", width: "7%", rotation: "-12deg" },
    rotateRight: { x: "95%", y: "56%", width: "6.5%", rotation: "8deg" },
} as const;

const sceneVariables: SceneVariables = {
    "--title-x": SCENE_LAYOUT.title.x,
    "--title-y": SCENE_LAYOUT.title.y,
    "--title-width": SCENE_LAYOUT.title.width,
    "--title-size": SCENE_LAYOUT.title.size,
    "--questioning-x": SCENE_LAYOUT.questioning.x,
    "--questioning-y": SCENE_LAYOUT.questioning.y,
    "--questioning-width": SCENE_LAYOUT.questioning.width,
    "--main-copy-x": SCENE_LAYOUT.mainCopy.x,
    "--main-copy-y": SCENE_LAYOUT.mainCopy.y,
    "--main-copy-width": SCENE_LAYOUT.mainCopy.width,
    "--main-copy-size": SCENE_LAYOUT.mainCopy.size,
    "--main-copy-rotation": SCENE_LAYOUT.mainCopy.rotation,
    "--thought-x": SCENE_LAYOUT.thought.x,
    "--thought-y": SCENE_LAYOUT.thought.y,
    "--thought-width": SCENE_LAYOUT.thought.width,
    "--thought-size": SCENE_LAYOUT.thought.size,
    "--wronged-x": SCENE_LAYOUT.wronged.x,
    "--wronged-y": SCENE_LAYOUT.wronged.y,
    "--wronged-width": SCENE_LAYOUT.wronged.width,
    "--rotate-top-x": SCENE_LAYOUT.rotateTop.x,
    "--rotate-top-y": SCENE_LAYOUT.rotateTop.y,
    "--rotate-top-width": SCENE_LAYOUT.rotateTop.width,
    "--rotate-top-rotation": SCENE_LAYOUT.rotateTop.rotation,
    "--rotate-bottom-x": SCENE_LAYOUT.rotateBottom.x,
    "--rotate-bottom-y": SCENE_LAYOUT.rotateBottom.y,
    "--rotate-bottom-width": SCENE_LAYOUT.rotateBottom.width,
    "--rotate-bottom-rotation": SCENE_LAYOUT.rotateBottom.rotation,
    "--rotate-right-x": SCENE_LAYOUT.rotateRight.x,
    "--rotate-right-y": SCENE_LAYOUT.rotateRight.y,
    "--rotate-right-width": SCENE_LAYOUT.rotateRight.width,
    "--rotate-right-rotation": SCENE_LAYOUT.rotateRight.rotation,
};

const SCENT_SPINE_PATH =
    "M -160 485 C 120 420 280 470 465 370 C 625 285 770 310 915 350 C 1065 390 1175 375 1305 320 C 1435 265 1540 220 1760 165";

type ScentPoint = { x: number; y: number };
type ScentWaveSample = {
    x: number;
    top: number;
    bottom: number;
    amplitude: number;
};

const SCENT_WAVE_SAMPLES: readonly ScentWaveSample[] = [
    { x: -180, top: 390, bottom: 560, amplitude: 20 },
    { x: 0, top: 350, bottom: 575, amplitude: 30 },
    { x: 220, top: 315, bottom: 650, amplitude: 42 },
    { x: 440, top: 235, bottom: 700, amplitude: 54 },
    { x: 660, top: 155, bottom: 700, amplitude: 58 },
    { x: 880, top: 195, bottom: 675, amplitude: 58 },
    { x: 1100, top: 260, bottom: 585, amplitude: 55 },
    { x: 1320, top: 220, bottom: 470, amplitude: 48 },
    { x: 1540, top: 145, bottom: 355, amplitude: 36 },
    { x: 1780, top: 110, bottom: 300, amplitude: 22 },
] as const;

const SCENT_WAVE_LENGTH = 760;
const SCENT_WAVE_DURATION = 8;
const SCENT_WAVE_AMPLITUDE = 0.6;
const SCENT_WAVE_FREQUENCY = (Math.PI * 2) / SCENT_WAVE_LENGTH;

function formatCoordinate(value: number) {
    return Math.round(value * 10) / 10;
}

function curveSegments(points: readonly ScentPoint[]) {
    return points
        .slice(0, -1)
        .map((point, index) => {
            const previous = points[index - 1] ?? point;
            const next = points[index + 1]!;
            const afterNext = points[index + 2] ?? next;
            const control1 = {
                x: point.x + (next.x - previous.x) / 6,
                y: point.y + (next.y - previous.y) / 6,
            };
            const control2 = {
                x: next.x - (afterNext.x - point.x) / 6,
                y: next.y - (afterNext.y - point.y) / 6,
            };

            return `C ${formatCoordinate(control1.x)} ${formatCoordinate(control1.y)} ${formatCoordinate(control2.x)} ${formatCoordinate(control2.y)} ${formatCoordinate(next.x)} ${formatCoordinate(next.y)}`;
        })
        .join(" ");
}

function buildScentWavePath(phase: number) {
    const samples = SCENT_WAVE_SAMPLES.map((sample) => ({
        ...sample,
        offset:
            SCENT_WAVE_AMPLITUDE *
            sample.amplitude *
            Math.sin(sample.x * SCENT_WAVE_FREQUENCY - phase),
    }));
    const top = samples.map(({ x, top: y, offset }) => ({ x, y: y + offset }));
    const bottom = samples
        .map(({ x, bottom: y, offset }) => ({ x, y: y + offset }))
        .reverse();
    const firstTop = top[0]!;
    const firstBottom = bottom[0]!;

    return `M ${formatCoordinate(firstTop.x)} ${formatCoordinate(firstTop.y)} ${curveSegments(top)} L ${formatCoordinate(firstBottom.x)} ${formatCoordinate(firstBottom.y)} ${curveSegments(bottom)} Z`;
}

const SCENT_WAVE_PATH = buildScentWavePath(0);

let media: gsap.MatchMedia | undefined;

onMounted(() => {
    if (
        !scene.value ||
        !revealPath.value ||
        !guidePath.value ||
        !orangeWave.value ||
        !yellowWave.value ||
        !highlightClip.value
    ) {
        return;
    }

    const sceneElement = scene.value;

    media = gsap.matchMedia();
    media.add(
        {
            reduceMotion: "(prefers-reduced-motion: reduce)",
            allowMotion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
            if (
                !scene.value ||
                !revealPath.value ||
                !guidePath.value ||
                !orangeWave.value ||
                !yellowWave.value ||
                !highlightClip.value
            ) {
                return;
            }

            const { reduceMotion } = context.conditions as {
                reduceMotion: boolean;
            };
            const title = sceneElement.querySelector<HTMLElement>(
                ".smell-scene__title",
            );
            const questioning = sceneElement.querySelector<HTMLElement>(
                ".smell-scene__questioning",
            );
            const mainCopy = sceneElement.querySelector<HTMLElement>(
                ".smell-scene__main-copy",
            );
            const thought = sceneElement.querySelector<HTMLElement>(
                ".smell-scene__thought",
            );
            const wronged = sceneElement.querySelector<HTMLElement>(
                ".smell-scene__wronged",
            );
            const rotatePops = gsap.utils.toArray<HTMLElement>(
                ".smell-scene__rotate-pop",
                sceneElement,
            );
            const rotateImages = gsap.utils.toArray<HTMLImageElement>(
                ".smell-scene__rotate-image",
                sceneElement,
            );

            if (!title || !questioning || !mainCopy || !thought || !wronged) {
                return;
            }

            const entranceTargets = [
                title,
                questioning,
                mainCopy,
                thought,
                wronged,
                ...rotatePops,
            ];
            const waveShapes = [
                orangeWave.value,
                yellowWave.value,
                highlightClip.value,
            ];

            if (reduceMotion) {
                gsap.set(revealPath.value, {
                    attr: { "stroke-width": 1150 },
                });
                gsap.set(guidePath.value, { autoAlpha: 0 });
                gsap.set(entranceTargets, { autoAlpha: 1 });
                return;
            }

            gsap.set(revealPath.value, {
                attr: { "stroke-width": 0 },
            });
            gsap.set(guidePath.value, {
                autoAlpha: 1,
                attr: { "stroke-dashoffset": 1 },
            });
            gsap.set(entranceTargets, { autoAlpha: 0 });

            const waveState = { phase: 0 };
            const renderWave = () => {
                const path = buildScentWavePath(waveState.phase);
                waveShapes.forEach((shape) => shape.setAttribute("d", path));
            };
            const flow = gsap.to(waveState, {
                phase: Math.PI * 2,
                duration: SCENT_WAVE_DURATION,
                ease: "none",
                paused: true,
                repeat: -1,
                onUpdate: renderWave,
            });
            const rotations = rotateImages.map((image, index) =>
                gsap.to(image, {
                    rotation: "+=360",
                    transformOrigin: "50% 50%",
                    duration: 4.2 + index * 0.55,
                    ease: "none",
                    paused: true,
                    repeat: -1,
                }),
            );
            const ambientAnimations: gsap.core.Animation[] = [
                flow,
                ...rotations,
            ];
            let ambientPlaying = false;
            const setAmbientPlayback = (shouldPlay: boolean) => {
                if (ambientPlaying === shouldPlay) return;
                ambientPlaying = shouldPlay;
                ambientAnimations.forEach((animation) => {
                    if (shouldPlay) animation.play();
                    else animation.pause();
                });
            };

            const story = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                    id: "smell-story",
                    trigger: scene.value,
                    start: "top top",
                    end: "+=280%",
                    pin: true,
                    scrub: 0.7,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        setAmbientPlayback(
                            self.isActive && self.progress > 0.18,
                        );
                    },
                    onToggle: (self) => {
                        if (!self.isActive) setAmbientPlayback(false);
                    },
                },
            });

            story
                .to(guidePath.value, {
                    attr: { "stroke-dashoffset": 0 },
                    duration: 0.38,
                })
                .to(revealPath.value, {
                    attr: { "stroke-width": 1150 },
                    duration: 0.62,
                    ease: "power2.inOut",
                })
                .to(
                    guidePath.value,
                    {
                        autoAlpha: 0,
                        duration: 0.12,
                    },
                    "<0.1",
                )
                .addLabel("content", ">-0.02")
                .fromTo(
                    questioning,
                    { autoAlpha: 0, scale: 0.68, y: -34, rotation: -9 },
                    {
                        autoAlpha: 1,
                        scale: 1,
                        y: 0,
                        rotation: 0,
                        duration: 0.34,
                        ease: "back.out(1.8)",
                    },
                    "content",
                )
                .fromTo(
                    title,
                    { autoAlpha: 0, scale: 0.88, y: -24 },
                    {
                        autoAlpha: 1,
                        scale: 1,
                        y: 0,
                        duration: 0.34,
                        ease: "power2.out",
                    },
                    "content+=0.04",
                )
                .fromTo(
                    rotatePops,
                    { autoAlpha: 0, scale: 0.2 },
                    {
                        autoAlpha: 1,
                        scale: 1,
                        duration: 0.3,
                        ease: "back.out(2.2)",
                        stagger: 0.08,
                    },
                    "content+=0.16",
                )
                .fromTo(
                    mainCopy,
                    { autoAlpha: 0, scale: 0.8, y: 38 },
                    {
                        autoAlpha: 1,
                        scale: 1,
                        y: 0,
                        duration: 0.48,
                        ease: "back.out(1.45)",
                    },
                    "content+=0.3",
                )
                .fromTo(
                    wronged,
                    { autoAlpha: 0, scale: 0.68, x: 34, y: 20 },
                    {
                        autoAlpha: 1,
                        scale: 1,
                        x: 0,
                        y: 0,
                        duration: 0.38,
                        ease: "back.out(1.8)",
                    },
                    "content+=0.55",
                )
                .fromTo(
                    thought,
                    { autoAlpha: 0, scale: 0.7, x: 28, y: 18 },
                    {
                        autoAlpha: 1,
                        scale: 1,
                        x: 0,
                        y: 0,
                        duration: 0.42,
                        ease: "back.out(1.65)",
                    },
                    "content+=0.68",
                );

            return () => {
                ambientAnimations.forEach((animation) => animation.kill());
            };
        },
        scene.value,
    );

    void nextTick(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
});

onBeforeUnmount(() => {
    media?.revert();
    media = undefined;
});
</script>

<template>
    <section
        id="smell"
        ref="scene"
        class="smell-scene relative isolate h-svh min-h-[36rem] w-full overflow-hidden bg-[#07366f]"
        :style="sceneVariables"
        aria-labelledby="smell-title"
    >
        <svg
            class="smell-scene__artwork absolute inset-0 block h-full w-full"
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
        >
            <defs>
                <mask
                    id="smell-ribbon-reveal"
                    x="-240"
                    y="-120"
                    width="2080"
                    height="1180"
                    maskUnits="userSpaceOnUse"
                >
                    <rect
                        x="-240"
                        y="-120"
                        width="2080"
                        height="1180"
                        fill="#000"
                    />
                    <path
                        ref="revealPath"
                        :d="SCENT_SPINE_PATH"
                        fill="none"
                        stroke="#fff"
                        stroke-width="0"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </mask>
                <linearGradient
                    id="smell-yellow"
                    x1="0"
                    y1="1"
                    x2="0.92"
                    y2="0"
                >
                    <stop offset="0" stop-color="#ffbe47" />
                    <stop offset="0.34" stop-color="#ffda63" />
                    <stop offset="0.72" stop-color="#ffe477" />
                    <stop offset="1" stop-color="#ffd35a" />
                </linearGradient>
                <linearGradient
                    id="smell-orange"
                    x1="0"
                    y1="1"
                    x2="0.95"
                    y2="0"
                >
                    <stop offset="0" stop-color="#ff9f38" />
                    <stop offset="0.58" stop-color="#ffb444" />
                    <stop offset="1" stop-color="#ffc34d" />
                </linearGradient>
                <clipPath id="smell-highlight-clip">
                    <path ref="highlightClip" :d="SCENT_WAVE_PATH" />
                </clipPath>
            </defs>

            <g mask="url(#smell-ribbon-reveal)">
                <path
                    ref="orangeWave"
                    :d="SCENT_WAVE_PATH"
                    fill="url(#smell-orange)"
                    transform="translate(0 48)"
                    opacity="0.96"
                />
                <path
                    ref="yellowWave"
                    :d="SCENT_WAVE_PATH"
                    fill="url(#smell-yellow)"
                />

                <g clip-path="url(#smell-highlight-clip)">
                    <path
                        d="M 36 448 C 205 430 323 435 460 365 C 584 302 705 282 830 309"
                        fill="none"
                        stroke="#fff0a8"
                        stroke-width="18"
                        stroke-linecap="round"
                    />
                    <path
                        d="M 495 392 C 665 303 792 330 925 366 C 1061 403 1176 388 1326 325"
                        fill="none"
                        stroke="#ffe99a"
                        stroke-width="16"
                        stroke-linecap="round"
                        opacity="0.82"
                    />
                    <path
                        d="M 1124 480 C 1223 430 1296 359 1382 310 C 1472 259 1555 226 1687 192"
                        fill="none"
                        stroke="#fff0a8"
                        stroke-width="14"
                        stroke-linecap="round"
                        opacity="0.76"
                    />
                </g>
            </g>

            <path
                ref="guidePath"
                :d="SCENT_SPINE_PATH"
                class="smell-scene__guide"
                fill="none"
                stroke="#ffd85f"
                stroke-width="8"
                stroke-linecap="round"
                stroke-linejoin="round"
                pathLength="1"
                stroke-dasharray="1 1"
                stroke-dashoffset="1"
            />
        </svg>

        <div class="smell-scene__content absolute inset-0 z-10">
            <div class="smell-scene__title-position">
                <h2 id="smell-title" class="smell-scene__title">
                    Have you experienced that embarrassing moment...
                </h2>
            </div>

            <div class="smell-scene__questioning-position">
                <img
                    class="smell-scene__questioning"
                    src="https://static.igem.wiki/teams/6133/wiki/homepage/questioning.avif"
                    alt="A character looking confused"
                    draggable="false"
                />
            </div>

            <div class="smell-scene__main-copy-position">
                <p class="smell-scene__main-copy">
                    When a pungent smell suddenly hits your<br />
                    nose, making you hesitate...
                </p>
            </div>

            <div
                class="smell-scene__rotate-slot smell-scene__rotate-slot--top"
                aria-hidden="true"
            >
                <div class="smell-scene__rotate-pop">
                    <img
                        class="smell-scene__rotate-image"
                        src="https://static.igem.wiki/teams/6133/wiki/homepage/rotate.avif"
                        alt=""
                        draggable="false"
                    />
                </div>
            </div>
            <div
                class="smell-scene__rotate-slot smell-scene__rotate-slot--bottom"
                aria-hidden="true"
            >
                <div class="smell-scene__rotate-pop">
                    <img
                        class="smell-scene__rotate-image"
                        src="https://static.igem.wiki/teams/6133/wiki/homepage/rotate.avif"
                        alt=""
                        draggable="false"
                    />
                </div>
            </div>
            <div
                class="smell-scene__rotate-slot smell-scene__rotate-slot--right"
                aria-hidden="true"
            >
                <div class="smell-scene__rotate-pop">
                    <img
                        class="smell-scene__rotate-image"
                        src="https://static.igem.wiki/teams/6133/wiki/homepage/rotate.avif"
                        alt=""
                        draggable="false"
                    />
                </div>
            </div>

            <div class="smell-scene__thought-position">
                <div class="smell-scene__thought">
                    Is that... coming from me
                    <span
                        class="smell-scene__thought-dot smell-scene__thought-dot--large"
                        aria-hidden="true"
                    />
                    <span
                        class="smell-scene__thought-dot smell-scene__thought-dot--small"
                        aria-hidden="true"
                    />
                </div>
            </div>

            <div class="smell-scene__wronged-position">
                <img
                    class="smell-scene__wronged"
                    src="https://static.igem.wiki/teams/6133/wiki/homepage/wronged.avif"
                    alt="A character anxiously wondering where the smell came from"
                    draggable="false"
                />
            </div>
        </div>
    </section>
</template>

<style scoped>
.smell-scene__artwork {
    will-change: transform;
}

.smell-scene__guide {
    will-change: stroke-dashoffset, opacity;
}

.smell-scene__content {
    pointer-events: none;
    color: white;
    font-family: var(--font-righteous), sans-serif;
}

.smell-scene__title-position,
.smell-scene__questioning-position,
.smell-scene__main-copy-position,
.smell-scene__thought-position,
.smell-scene__wronged-position,
.smell-scene__rotate-slot {
    position: absolute;
    transform: translate(-50%, -50%);
}

.smell-scene__title-position {
    top: var(--title-y);
    left: var(--title-x);
    z-index: 30;
    width: var(--title-width);
}

.smell-scene__title {
    margin: 0;
    color: #fff;
    font-size: var(--title-size);
    line-height: 1.08;
    text-align: center;
    text-wrap: balance;
    text-shadow: 0 0.14em 0.34em rgb(0 31 72 / 24%);
    will-change: transform, opacity;
}

.smell-scene__questioning-position {
    top: var(--questioning-y);
    left: var(--questioning-x);
    z-index: 34;
    width: var(--questioning-width);
    rotate: -10deg;
}

.smell-scene__questioning,
.smell-scene__wronged,
.smell-scene__rotate-image {
    display: block;
    width: 100%;
    height: auto;
    user-select: none;
}

.smell-scene__questioning,
.smell-scene__wronged {
    filter: drop-shadow(0 0.42rem 0.28rem rgb(0 20 55 / 20%));
    will-change: transform, opacity;
}

.smell-scene__main-copy-position {
    top: var(--main-copy-y);
    left: var(--main-copy-x);
    z-index: 38;
    width: var(--main-copy-width);
    transform: translate(-50%, -50%) rotate(var(--main-copy-rotation));
}

.smell-scene__main-copy {
    margin: 0;
    color: #07366f;
    font-size: var(--main-copy-size);
    line-height: 1.16;
    text-align: center;
    text-wrap: balance;
    text-shadow: 0 0.04em 0 rgb(7 54 111 / 8%);
    will-change: transform, opacity;
}

.smell-scene__rotate-slot {
    z-index: 42;
}

.smell-scene__rotate-slot--top {
    top: var(--rotate-top-y);
    left: var(--rotate-top-x);
    width: var(--rotate-top-width);
    transform: translate(-50%, -50%) rotate(var(--rotate-top-rotation));
}

.smell-scene__rotate-slot--bottom {
    top: var(--rotate-bottom-y);
    left: var(--rotate-bottom-x);
    width: var(--rotate-bottom-width);
    transform: translate(-50%, -50%) rotate(var(--rotate-bottom-rotation));
}

.smell-scene__rotate-slot--right {
    top: var(--rotate-right-y);
    left: var(--rotate-right-x);
    width: var(--rotate-right-width);
    transform: translate(-50%, -50%) rotate(var(--rotate-right-rotation));
}

.smell-scene__rotate-pop,
.smell-scene__rotate-image {
    transform-origin: 50% 50%;
    will-change: transform, opacity;
}

.smell-scene__thought-position {
    top: var(--thought-y);
    left: var(--thought-x);
    z-index: 46;
    width: var(--thought-width);
}

.smell-scene__thought {
    position: relative;
    width: 100%;
    border-radius: clamp(1.7rem, 3.3vw, 4.3rem);
    background: #fbfcf8;
    padding: clamp(1rem, 2.5vw, 2.9rem) clamp(1.25rem, 3vw, 3.6rem);
    color: #07366f;
    font-size: var(--thought-size);
    line-height: 1.08;
    text-align: center;
    white-space: nowrap;
    box-shadow: 0 0.65rem 1.6rem rgb(0 26 68 / 13%);
    will-change: transform, opacity;
}

.smell-scene__thought-dot {
    position: absolute;
    display: block;
    border-radius: 999px;
    background: inherit;
}

.smell-scene__thought-dot--large {
    top: 8%;
    right: -10%;
    width: 12%;
    aspect-ratio: 1;
}

.smell-scene__thought-dot--small {
    top: -18%;
    right: -18%;
    width: 7.5%;
    aspect-ratio: 1;
}

.smell-scene__wronged-position {
    top: var(--wronged-y);
    left: var(--wronged-x);
    z-index: 48;
    width: var(--wronged-width);
}

@media (max-width: 52rem), (orientation: portrait) {
    .smell-scene__title {
        font-size: min(var(--title-size), 5.8vw);
    }

    .smell-scene__main-copy {
        font-size: min(var(--main-copy-size), 5vw);
    }

    .smell-scene__thought {
        padding: clamp(0.7rem, 2.2vw, 1.2rem) clamp(0.9rem, 2.8vw, 1.5rem);
        font-size: min(var(--thought-size), 3.8vw);
    }
}

@media (prefers-reduced-motion: reduce) {
    .smell-scene__title,
    .smell-scene__questioning,
    .smell-scene__main-copy,
    .smell-scene__thought,
    .smell-scene__wronged,
    .smell-scene__rotate-pop,
    .smell-scene__rotate-image {
        will-change: auto;
    }
}
</style>
