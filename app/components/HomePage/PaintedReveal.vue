<script setup lang="ts">
import { gsap } from "gsap";
import { paintedFrame } from "~/utils/home-painted-wave";
import {
    isHomeScrollRestoring,
    readHomeScroll,
    HOME_SCROLL_RESTORE_END,
} from "~/utils/home-scroll";

const root = ref<HTMLElement>();
const svg = ref<SVGSVGElement>();
const wandSvg = ref<SVGSVGElement>();
const paper = ref<SVGPathElement>();
const yellow = ref<SVGPathElement>();
const clip = ref<SVGPathElement>();
const wand = ref<SVGGElement>();
const copy = ref<HTMLElement>();
const spellcaster = ref<HTMLElement>();
const spellcasterGrip = ref<HTMLElement>();
const { settled } = useHomeIntroState();
const loadingComplete = useState("initial-loading-complete", () => false);
const paused = ref(false);
const id = `paint-${useId().replaceAll(":", "")}`;
const appBase = useRuntimeConfig().app.baseURL.replace(/\/?$/, "/");
const spellcasterImageUrl = `https://static.igem.wiki/teams/6133/wiki/homepage/magicwond.avif`;
useHead({
    link: [
        {
            rel: "preload",
            as: "image",
            href: spellcasterImageUrl,
            fetchpriority: "high",
        },
    ],
});
const colors = [
    "#f569a2",
    "#ffe174",
    "#347ed1",
    "#79e2b0",
    "#f569a2",
    "#ffe174",
    "#347ed1",
    "#79e2b0",
];
const state = { progress: 0, phase: 0, energy: 2.8 };
let size = { width: 1600, height: 900 };
let timeline: gsap.core.Timeline | undefined;
let observer: ResizeObserver | undefined;
let intersection: IntersectionObserver | undefined;
let motion: MediaQueryList | undefined;
let paths: SVGPathElement[] = [];
let visible = true;
let started = false;
let tickerAttached = false;
let lastPaint = 0;
let devHold = false;
let spellIntroActive = false;
let paintingStarted = false;
let wandHandoffActive = false;
let revealWandRotation = 14;
let revealWandScale = 1;

type WandPose = {
    x: number;
    y: number;
    rotation: number;
    scale: number;
};

function cssNumber(name: string, fallback: number) {
    if (!root.value) return fallback;
    const value = Number.parseFloat(
        getComputedStyle(root.value).getPropertyValue(name),
    );
    return Number.isFinite(value) ? value : fallback;
}

function applyWandPose(pose: WandPose) {
    wand.value?.setAttribute(
        "transform",
        `translate(${pose.x} ${pose.y}) rotate(${pose.rotation}) scale(${pose.scale})`,
    );
}

type WandGrip = { x: number; y: number };

function rotatedGripOffset(pose: WandPose, grip: WandGrip) {
    const radians = (pose.rotation * Math.PI) / 180;
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);
    return {
        x: (grip.x * cosine - grip.y * sine) * pose.scale,
        y: (grip.x * sine + grip.y * cosine) * pose.scale,
    };
}

function applyWandAroundGrip(
    pose: WandPose,
    fixedGrip: WandGrip,
    localGrip: WandGrip,
) {
    const offset = rotatedGripOffset(pose, localGrip);
    pose.x = fixedGrip.x - offset.x;
    pose.y = fixedGrip.y - offset.y;
    applyWandPose(pose);
}

function readSpellcasterGrip(): WandGrip {
    if (!root.value || !spellcasterGrip.value) {
        return { x: size.width, y: size.height / 2 };
    }
    const rootRect = root.value.getBoundingClientRect();
    const gripRect = spellcasterGrip.value.getBoundingClientRect();
    return {
        x: gripRect.left + gripRect.width / 2 - rootRect.left,
        y: gripRect.top + gripRect.height / 2 - rootRect.top,
    };
}

function readHeldWandPose(localGrip: WandGrip): WandPose {
    // offsetWidth stays in the character's untransformed coordinate space.
    // A rotated bounding box also contains projected height and would make the
    // wand grow at different viewport aspect ratios.
    const casterWidth = spellcaster.value?.offsetWidth ?? 512;
    const pose = {
        x: 0,
        y: 0,
        rotation: cssNumber("--wand-held-rotation", 10),
        scale:
            cssNumber("--wand-held-scale", 0.25) *
            (casterWidth / cssNumber("--wand-scale-reference", 512)),
    };
    const fixedGrip = readSpellcasterGrip();
    const offset = rotatedGripOffset(pose, localGrip);
    pose.x = fixedGrip.x - offset.x;
    pose.y = fixedGrip.y - offset.y;
    return pose;
}

function render() {
    const frame = paintedFrame(size.width, size.height, state);
    yellow.value?.setAttribute(
        "d",
        state.progress === 0 ? "M0 0Z" : frame.yellow,
    );
    paper.value?.setAttribute(
        "d",
        state.progress === 0 ? "M0 0Z" : frame.white,
    );
    if (paper.value)
        paper.value.style.opacity = String(
            Math.min(1, Math.max(0, (state.progress - 0.13) / 0.13)),
        );
    clip.value?.setAttribute("d", state.progress === 0 ? "M0 0Z" : frame.white);
    paths.forEach((path, i) => {
        path.setAttribute("d", frame.bands[i]!);
        const layer = i % 4;
        const start = 0.2 + layer * 0.065 + (i >= 4 ? 0.04 : 0);
        path.style.opacity = String(
            Math.min(1, Math.max(0, (state.progress - start) / 0.14)),
        );
    });
    if (!spellIntroActive) {
        wand.value?.setAttribute(
            "transform",
            `translate(${frame.tip.x} ${frame.tip.y}) rotate(${revealWandRotation}) scale(${revealWandScale})`,
        );
        if (state.progress >= 0.05) wandHandoffActive = false;
        if (wand.value) {
            const revealOpacity =
                Math.min(1, state.progress * 20) *
                Math.min(1, (1 - state.progress) * 15);
            wand.value.style.opacity = String(
                wandHandoffActive ? 1 : revealOpacity,
            );
        }
    }
}
function tick(_time: number, delta: number) {
    if (
        !paintingStarted ||
        document.hidden ||
        !visible ||
        paused.value ||
        motion?.matches ||
        devHold
    )
        return;
    state.phase +=
        (Math.min(delta, 40) / 1000) * ((Math.PI * 2) / 26) * state.energy;
    const now = performance.now();
    // Throttle this artwork only; Lenis keeps its existing shared ticker rate.
    if (now - lastPaint >= 1000 / (size.height > size.width ? 30 : 60)) {
        render();
        lastPaint = now;
    }
}
function syncPlayback() {
    const active =
        !document.hidden &&
        visible &&
        !paused.value &&
        !motion?.matches &&
        !devHold &&
        started;
    if (active && !tickerAttached) {
        gsap.ticker.add(tick);
        tickerAttached = true;
    }
    if (!active && tickerAttached) {
        gsap.ticker.remove(tick);
        tickerAttached = false;
    }
    if (active && !settled.value) timeline?.resume();
    else timeline?.pause();
}
function finish() {
    timeline?.kill();
    spellIntroActive = false;
    paintingStarted = true;
    wandHandoffActive = false;
    state.progress = 1;
    state.energy = 1;
    settled.value = true;
    started = true;
    if (spellcaster.value)
        gsap.set(spellcaster.value, { autoAlpha: 0, xPercent: 112 });
    if (copy.value) copy.value.style.clipPath = "none";
    render();
    syncPlayback();
}
function start() {
    if (
        started ||
        !root.value ||
        !loadingComplete.value ||
        isHomeScrollRestoring()
    )
        return;
    const saved = readHomeScroll();
    const restoredOutsideHero =
        (saved?.scrollY ?? 0) > 10 && saved?.sceneId !== "expelliodor";
    if (
        motion?.matches ||
        restoredOutsideHero ||
        (window.scrollY > 10 && saved?.sceneId !== "expelliodor")
    ) {
        finish();
        return;
    }
    started = true;
    settled.value = false;
    spellIntroActive = true;
    paintingStarted = false;
    wandHandoffActive = true;
    const localGrip = {
        x: cssNumber("--wand-grip-x", 0),
        y: cssNumber("--wand-grip-y", 780),
    };
    const openingFrame = paintedFrame(size.width, size.height, state);
    if (spellcaster.value)
        gsap.set(spellcaster.value, {
            autoAlpha: 1,
            xPercent: 112,
        });
    const heldWand = readHeldWandPose(localGrip);
    const heldRotation = heldWand.rotation;
    let wandAttachedToSpellcaster = true;
    const syncHeldWand = () => {
        if (!wandAttachedToSpellcaster) return;
        applyWandAroundGrip(heldWand, readSpellcasterGrip(), localGrip);
    };
    applyWandPose(heldWand);
    if (wand.value) gsap.set(wand.value, { opacity: 0 });
    timeline = gsap.timeline({
        paused: true,
        onUpdate: syncHeldWand,
        onComplete: finish,
    });
    timeline
        .to(
            spellcaster.value,
            {
                xPercent: 0,
                duration: 0.38,
                ease: "back.out(1.25)",
            },
            0,
        )
        .set(wand.value, { opacity: 1 }, 0.16)
        .to(
            heldWand,
            {
                rotation: heldRotation + 10,
                duration: 0.1,
                ease: "power2.out",
            },
            0.32,
        )
        .to(heldWand, {
            rotation: heldRotation - 8,
            duration: 0.09,
            ease: "power1.inOut",
        })
        .to(heldWand, {
            rotation: heldRotation + 5,
            duration: 0.08,
            ease: "power1.inOut",
        })
        .to(heldWand, {
            rotation: heldRotation + 4,
            duration: 0.08,
            ease: "power1.inOut",
        })
        .call(
            () => {
                revealWandRotation = heldWand.rotation;
                revealWandScale = heldWand.scale;
            },
            [],
            0.67,
        )
        .call(
            () => {
                syncHeldWand();
                wandAttachedToSpellcaster = false;
            },
            [],
            0.7,
        )
        .to(
            spellcaster.value,
            {
                xPercent: 112,
                autoAlpha: 0,
                duration: 0.36,
                ease: "power3.in",
            },
            0.7,
        )
        .to(
            heldWand,
            {
                x: openingFrame.tip.x,
                y: openingFrame.tip.y,
                duration: 0.36,
                ease: "power3.inOut",
                onUpdate: () => applyWandPose(heldWand),
            },
            0.7,
        )
        .call(
            () => {
                spellIntroActive = false;
                paintingStarted = true;
                render();
            },
            [],
            1.06,
        )
        .to(
            state,
            {
                progress: 1,
                duration: 1.85,
                ease: "power1.inOut",
                onUpdate: render,
            },
            1.06,
        )
        .to(state, { energy: 1, duration: 0.65, ease: "power2.out" }, 2.46);
    syncPlayback();
}
function intent(event: Event) {
    if (devHold || settled.value || !loadingComplete.value) return;
    if (
        event instanceof KeyboardEvent &&
        !["Tab", "Escape", " ", "ArrowDown", "PageDown", "End"].includes(
            event.key,
        )
    )
        return;
    finish();
}
function motionChanged() {
    if (motion?.matches) finish();
    else syncPlayback();
}
watch(loadingComplete, start);
watch(paused, syncPlayback);
onMounted(() => {
    paths = Array.from(
        svg.value!.querySelectorAll<SVGPathElement>(".paint-accent"),
    );
    motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const measure = () => {
        if (!root.value) return;
        const rect = root.value.getBoundingClientRect();
        size = { width: rect.width, height: rect.height };
        svg.value?.setAttribute("viewBox", `0 0 ${size.width} ${size.height}`);
        wandSvg.value?.setAttribute(
            "viewBox",
            `0 0 ${size.width} ${size.height}`,
        );
        render();
    };
    measure();
    observer = new ResizeObserver(measure);
    observer.observe(root.value!);
    intersection = new IntersectionObserver(([entry]) => {
        visible = entry?.isIntersecting ?? false;
        syncPlayback();
    });
    intersection.observe(root.value!);
    motion.addEventListener("change", motionChanged);
    document.addEventListener("visibilitychange", syncPlayback);
    window.addEventListener(HOME_SCROLL_RESTORE_END, start);
    window.addEventListener("keydown", intent, true);
    window.addEventListener("wheel", intent, { passive: true });
    window.addEventListener("touchmove", intent, { passive: true });
    if (import.meta.dev) {
        const frame = new URLSearchParams(window.location.search).get(
            "intro-frame",
        );
        if (frame !== null && Number.isFinite(Number(frame))) {
            devHold = true;
            started = true;
            paintingStarted = true;
            settled.value = false;
            state.progress = Math.max(0, Math.min(1, Number(frame)));
            state.phase = 0.3 * state.progress;
            render();
        }
    }
    if (!devHold) start();
});
onBeforeUnmount(() => {
    timeline?.kill();
    gsap.ticker.remove(tick);
    observer?.disconnect();
    intersection?.disconnect();
    motion?.removeEventListener("change", motionChanged);
    document.removeEventListener("visibilitychange", syncPlayback);
    window.removeEventListener(HOME_SCROLL_RESTORE_END, start);
    window.removeEventListener("keydown", intent, true);
    window.removeEventListener("wheel", intent);
    window.removeEventListener("touchmove", intent);
    settled.value = true;
});
</script>
<template>
    <div ref="root" class="painted-reveal">
        <svg
            ref="svg"
            class="painted-reveal__art"
            viewBox="0 0 1600 900"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <clipPath :id="id" clipPathUnits="userSpaceOnUse">
                    <path ref="clip" d="M0 0Z" />
                </clipPath>
            </defs>
            <path ref="yellow" fill="#ffe174" />
            <path ref="paper" fill="#fffff8" />
            <path
                v-for="(color, i) in colors"
                :key="i"
                class="paint-accent"
                :fill="color"
            />
        </svg>
        <div ref="spellcaster" class="spellcaster" aria-hidden="true">
            <img
                :src="spellcasterImageUrl"
                alt=""
                decoding="async"
                fetchpriority="high"
            />
            <span ref="spellcasterGrip" class="spellcaster__grip" />
        </div>
        <svg
            ref="wandSvg"
            class="painted-reveal__wand"
            viewBox="0 0 1600 900"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
        >
            <g ref="wand" opacity="0">
                <path d="M-5 0 L-13 1100 L18 1100 L5 0Z" fill="#59b5e1" />
                <path d="M-5 0 L-6 24 L6 24 L5 0Z" fill="#c2edee" />
            </g>
        </svg>
        <div
            ref="copy"
            class="painted-reveal__content"
            :style="{ clipPath: `url(#${id})` }"
        >
            <slot />
        </div>
        <button
            v-if="settled"
            class="wave-pause"
            type="button"
            :aria-label="
                paused
                    ? 'Resume background animation'
                    : 'Pause background animation'
            "
            :aria-pressed="paused"
            @click="paused = !paused"
        >
            <svg viewBox="0 0 20 20" aria-hidden="true">
                <path v-if="paused" d="M6 4L16 10L6 16Z" fill="currentColor" />
                <path
                    v-else
                    d="M7 5V15M13 5V15"
                    stroke="currentColor"
                    stroke-width="2"
                />
            </svg>
        </button>
    </div>
</template>
<style scoped>
.painted-reveal {
    --spellcaster-peek-right: -10vw;
    --spellcaster-peek-y: 1vh;
    --spellcaster-peek-rotation: -37deg;
    --spellcaster-size: clamp(18rem, 29vw, 32rem);
    --spellcaster-grip-x: 16.5%;
    --spellcaster-grip-y: 28.8%;
    --wand-held-rotation: -30;
    --wand-held-scale: 0.25;
    --wand-scale-reference: 512;
    --wand-grip-x: 0;
    --wand-grip-y: 860;

    position: absolute;
    inset: var(--home-nav-clearance) 0 0;
    background: #03316d;
    overflow: hidden;
}
.painted-reveal__art {
    position: absolute;
    z-index: 1;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}
.spellcaster {
    position: absolute;
    z-index: 2;
    top: calc(50% + var(--spellcaster-peek-y));
    right: var(--spellcaster-peek-right);
    width: var(--spellcaster-size);
    opacity: 0;
    transform: translateY(-50%) rotate(var(--spellcaster-peek-rotation));
    transform-origin: 60% 48%;
    pointer-events: none;
    visibility: hidden;
    will-change: transform, opacity;
}
.spellcaster img {
    display: block;
    width: 100%;
    height: auto;
}
.spellcaster__grip {
    position: absolute;
    top: var(--spellcaster-grip-y);
    left: var(--spellcaster-grip-x);
    width: 1px;
    height: 1px;
    pointer-events: none;
}
.painted-reveal__wand {
    position: absolute;
    z-index: 3;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
}
.painted-reveal__content {
    position: absolute;
    z-index: 4;
    inset: 0;
    display: flex;
    align-items: center;
    padding-top: 5%;
}
.wave-pause {
    position: absolute;
    z-index: 5;
    bottom: 1.2rem;
    left: 1.2rem;
    display: grid;
    place-items: center;
    width: 2.5rem;
    height: 2.5rem;
    border: 1px solid #ffffff50;
    border-radius: 50%;
    color: white;
    background: #03316d;
    cursor: pointer;
}
.wave-pause svg {
    width: 1.2rem;
    height: 1.2rem;
}
.wave-pause:focus-visible {
    outline: 3px solid #ffe174;
    outline-offset: 4px;
}
@media (max-width: 40rem) {
    .painted-reveal {
        --spellcaster-peek-right: -33vw;
        --spellcaster-peek-y: -2vh;
        --spellcaster-peek-rotation: -8deg;
        --spellcaster-size: clamp(16rem, 74vw, 20rem);
        --spellcaster-grip-x: 16.5%;
        --spellcaster-grip-y: 28.8%;
        --wand-held-rotation: -20;
        --wand-held-scale: 0.224;
        --wand-grip-x: 0;
        --wand-grip-y: 780;
    }
    .wave-pause {
        top: 4.25rem;
        right: 1rem;
        bottom: auto;
        left: auto;
    }
}
@media (prefers-reduced-motion: reduce) {
    .wave-pause {
        display: none;
    }
    .painted-reveal__content {
        clip-path: none !important;
    }
    .painted-reveal {
        background: #fffff8;
    }
}
</style>
