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
const paper = ref<SVGPathElement>();
const yellow = ref<SVGPathElement>();
const clip = ref<SVGPathElement>();
const wand = ref<SVGGElement>();
const copy = ref<HTMLElement>();
const { settled } = useHomeIntroState();
const loadingComplete = useState("initial-loading-complete", () => false);
const paused = ref(false);
const id = `paint-${useId().replaceAll(":", "")}`;
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
    wand.value?.setAttribute(
        "transform",
        `translate(${frame.tip.x} ${frame.tip.y}) rotate(${frame.angle})`,
    );
    if (wand.value)
        wand.value.style.opacity = String(
            Math.min(1, state.progress * 20) *
                Math.min(1, (1 - state.progress) * 15),
        );
}
function tick(_time: number, delta: number) {
    if (
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
    state.progress = 1;
    state.energy = 1;
    settled.value = true;
    started = true;
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
    timeline = gsap.timeline({ paused: true, onComplete: finish });
    timeline
        .to(
            state,
            {
                progress: 1,
                duration: 1.85,
                ease: "power1.inOut",
                onUpdate: render,
            },
            0.15,
        )
        .to(state, { energy: 1, duration: 0.65, ease: "power2.out" }, 1.55);
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
    position: absolute;
    inset: var(--home-nav-clearance) 0 0;
    background: #03316d;
    overflow: hidden;
}
.painted-reveal__art {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}
.painted-reveal__content {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    padding-top: 5%;
}
.wave-pause {
    position: absolute;
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
