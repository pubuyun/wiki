<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onBeforeUnmount, onMounted, ref } from "vue";

import {
    HOME_CHAPTERS,
    homeChapterActivationLabel,
} from "~/utils/home-chapters";
import {
    HOME_SCROLL_LOCK_CHANGE,
    HOME_SCROLL_REFRESH_END,
    HOME_SCROLL_REFRESH_START,
    HOME_SCROLL_RESTORE_END,
    isHomeScrollRestoring,
    type HomeScrollLockChange,
} from "~/utils/home-scroll";

import MoreAboutUs from "./MoreAboutUs.vue";
import Product from "./Product.vue";
import ProductIntro from "./ProductIntro.vue";
import ProductWaveTransition from "./ProductWaveTransition.vue";
import Solution from "./Solution.vue";
import SolutionSmokeTransition from "./SolutionSmokeTransition.vue";

gsap.registerPlugin(ScrollTrigger);

// Paint-path controls. The product rig itself follows this circle; there is no
// model-specific ball compensation, so the orbit remains stable and centered.
// model-viewer's orientation tuple maps to Z roll / X pitch / Y yaw:
// - forwardPitch aims the roller ball into the page;
// - sideYaw keeps the bottle slightly turned so its side remains visible;
// - screenRoll is normally kept at zero to avoid an extra visible spin.
const PAINT_PATH = {
    centerXOffsetPercent: 2,
    centerYOffsetPercent: 16,
    radiusWidthRatio: 0.33,
    radiusHeightRatio: 0.37,
    radiusScale: 1.15,
    startAngle: -90,
    endAngle: 270,
    forwardPitch: -78,
    sideYaw: 7,
    sideYawPeakOffset: 30,
    sideYawEndOffset: -30,
    sideYawPeakProgress: 0.3,
    screenRoll: 0,
    landscapeScale: 0.38,
    portraitScale: 0.3,
} as const;

const SOLUTION_MARKER_ANGLES = [-90, 30, 150] as const;

const PAINT_REVEAL = {
    radiusPercent: 170,
    edgeSoftnessPercent: 14,
    duration: 0.68,
} as const;

const PRODUCT_ENTRANCE = {
    maskStartX: -220,
    maskEndX: 1990,
    maskEndWidth: 2210,
    maskEdgeWidth: 150,
    modelRevealDuration: 0.72,
    landscapeStartScale: 0.16,
    portraitStartScale: 0.1,
} as const;

const PRODUCT_HANDOFF = {
    moveDuration: 0.58,
    scaleDuration: 0.34,
} as const;

const WAVE_REVEAL_LAYERS = [
    {
        id: "background",
        delay: 0,
        duration: 1.16,
        ease: "power3.inOut",
    },
    { id: "warm", delay: 0.02, duration: 0.96, ease: "power4.inOut" },
    { id: "blue", delay: 0.07, duration: 1.08, ease: "power3.inOut" },
    { id: "lower", delay: 0.14, duration: 1.14, ease: "power3.inOut" },
    { id: "right", delay: 0.22, duration: 1.2, ease: "power3.inOut" },
] as const;

const WAVE_EXIT = {
    // 1 is the old rate. Larger values move the artwork upward faster.
    upwardMoveSpeed: 1.1,
    // The layer is one viewport tall, so -100% is equivalent to -100vh.
    upwardExitYPercent: -90,
} as const;

const WAVE_EXIT_LAYERS = [
    {
        id: "background",
        durationRatio: 1,
        ease: "power2.inOut",
    },
    {
        id: "warm",
        durationRatio: 0.78,
        ease: "power2.out",
    },
    {
        id: "blue",
        durationRatio: 0.94,
        ease: "power2.inOut",
    },
    {
        id: "lower",
        durationRatio: 0.86,
        ease: "power2.out",
    },
    {
        id: "right",
        durationRatio: 1,
        ease: "power2.inOut",
    },
] as const;

const SOLUTION_MORE_AUTOMATIC_DURATION = 3.7;
const SOLUTION_MORE_REVERSE_SPEED_MULTIPLIER = 3;
const TRANSITION_SCROLL_KEYS = new Set([
    "ArrowDown",
    "ArrowUp",
    "End",
    "Home",
    "PageDown",
    "PageUp",
    " ",
]);

type ProductTimelinePayload = {
    timeline: gsap.core.Timeline;
    scene: HTMLElement;
    productRig: HTMLElement;
    featureLayer: HTMLElement;
    modelOrientation: {
        roll: number;
        pitch: number;
        yaw: number;
        parallaxStrength: number;
    };
    applyModelOrientation: () => void;
};

type SolutionTimelinePayload = {
    timeline: gsap.core.Timeline;
    scene: HTMLElement;
};

type ProductIntroTimelinePayload = SolutionTimelinePayload;
type MoreAboutUsTimelinePayload = SolutionTimelinePayload;

const sequence = ref<HTMLElement | null>(null);
const productIntroLayer = ref<HTMLElement | null>(null);
const waveTransition = ref<HTMLElement | null>(null);
const smokeTransition = ref<HTMLElement | null>(null);

let productPayload: ProductTimelinePayload | undefined;
let productIntroPayload: ProductIntroTimelinePayload | undefined;
let solutionPayload: SolutionTimelinePayload | undefined;
let moreAboutUsPayload: MoreAboutUsTimelinePayload | undefined;
let master: gsap.core.Timeline | undefined;
let automaticSolutionMore: gsap.core.Timeline | undefined;
let homeFooter: HTMLElement | undefined;
let homeFooterWave: HTMLElement | undefined;
let buildFrame = 0;
let resizeResumeFrame = 0;
let restoreResumeFrame = 0;
let scrollLocked = false;
let lockedScrollY = 0;
let transitionRevealed = false;
let isLayoutRefreshing = false;
let interruptedTransition:
    { progress: number; reversed: boolean; revealed: boolean } | undefined;

function handleProductReady(payload: ProductTimelinePayload) {
    productPayload = payload;
    scheduleBuild();
}

function handleProductIntroReady(payload: ProductIntroTimelinePayload) {
    productIntroPayload = payload;
    scheduleBuild();
}

function handleSolutionReady(payload: SolutionTimelinePayload) {
    solutionPayload = payload;
    scheduleBuild();
}

function handleMoreAboutUsReady(payload: MoreAboutUsTimelinePayload) {
    moreAboutUsPayload = payload;
    scheduleBuild();
}

function scheduleBuild() {
    cancelAnimationFrame(buildFrame);
    buildFrame = requestAnimationFrame(buildSequence);
}

function detachTimeline(timeline: gsap.core.Timeline) {
    timeline.pause(0);
    timeline.parent?.remove(timeline);
}

function promoteChapterLabels(
    parent: gsap.core.Timeline,
    child: gsap.core.Timeline,
    startLabel: string,
) {
    const startTime = parent.labels[startLabel];
    if (typeof startTime !== "number") return;

    Object.entries(child.labels).forEach(([label, time]) => {
        if (label.startsWith("pause:") || label.startsWith("active:")) {
            parent.addLabel(label, startTime + time);
        }
    });
}

function preventTransitionScroll(event: Event) {
    event.preventDefault();
    event.stopImmediatePropagation();
}

function preventTransitionScrollKey(event: KeyboardEvent) {
    if (!TRANSITION_SCROLL_KEYS.has(event.key)) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("input, textarea, select, [contenteditable='true']")) {
        return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
}

function clampTransitionScroll() {
    if (scrollLocked && Math.abs(window.scrollY - lockedScrollY) > 1) {
        window.scrollTo(0, lockedScrollY);
    }
}

function dispatchScrollLockChange(detail: HomeScrollLockChange) {
    window.dispatchEvent(
        new CustomEvent<HomeScrollLockChange>(HOME_SCROLL_LOCK_CHANGE, {
            detail,
        }),
    );
}

function lockTransitionScroll(position: number, direction: "up" | "down") {
    lockedScrollY = position;
    if (scrollLocked) return;

    scrollLocked = true;
    dispatchScrollLockChange({ locked: true, direction });
    window.addEventListener("wheel", preventTransitionScroll, {
        passive: false,
        capture: true,
    });
    window.addEventListener("touchmove", preventTransitionScroll, {
        passive: false,
        capture: true,
    });
    window.addEventListener("keydown", preventTransitionScrollKey, true);
    window.addEventListener("scroll", clampTransitionScroll, {
        passive: true,
    });
}

function moveTransitionScroll(position: number) {
    const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        0,
    );
    const clampedPosition = gsap.utils.clamp(0, maxScroll, position);

    lockedScrollY = clampedPosition;
    window.scrollTo(0, clampedPosition);
    ScrollTrigger.update();
}

function unlockTransitionScroll() {
    if (!scrollLocked) return;

    scrollLocked = false;
    dispatchScrollLockChange({ locked: false });
    window.removeEventListener("wheel", preventTransitionScroll, true);
    window.removeEventListener("touchmove", preventTransitionScroll, true);
    window.removeEventListener("keydown", preventTransitionScrollKey, true);
    window.removeEventListener("scroll", clampTransitionScroll);
}

function resetHomeFooter() {
    if (!homeFooter) return;

    gsap.set(homeFooter, {
        clearProps: "transform,opacity,visibility,willChange",
    });
    homeFooter = undefined;
    homeFooterWave = undefined;
}

function homeFooterRevealOffset() {
    if (!homeFooter || !homeFooterWave) return 0;

    const renderedY = Number(gsap.getProperty(homeFooter, "y")) || 0;
    const naturalTop = homeFooter.getBoundingClientRect().top - renderedY;
    const revealTop = window.innerHeight - homeFooterWave.offsetHeight;

    return Math.min(0, revealTop - naturalTop);
}

function positionHomeFooterForReveal() {
    if (!homeFooter) return;

    gsap.set(homeFooter, { autoAlpha: 1, y: 0 });
    gsap.set(homeFooter, { y: homeFooterRevealOffset() });
}

function handoffHomeFooterToDocument() {
    if (!homeFooter || !homeFooterWave) return false;

    gsap.set(homeFooter, { autoAlpha: 1, y: 0 });
    const naturalTop = homeFooter.getBoundingClientRect().top;
    const revealTop = window.innerHeight - homeFooterWave.offsetHeight;
    const footerDocumentTop = window.scrollY + naturalTop;

    moveTransitionScroll(footerDocumentTop - revealTop);
    return true;
}

function syncTransitionToRestoredScroll() {
    if (!master || !automaticSolutionMore) return;

    const threshold = master.labels.solutionSmokeThreshold;
    const revealed =
        typeof threshold === "number" && master.time() >= threshold;

    automaticSolutionMore
        .pause()
        .invalidate()
        .progress(revealed ? 1 : 0, true)
        .pause();
    if (revealed) positionHomeFooterForReveal();
    transitionRevealed = revealed;
    unlockTransitionScroll();
}

function handleScrollRestoreEnd() {
    cancelAnimationFrame(restoreResumeFrame);
    restoreResumeFrame = requestAnimationFrame(() => {
        if (isHomeScrollRestoring() || interruptedTransition) return;
        syncTransitionToRestoredScroll();
    });
}

function handleLayoutRefreshStart() {
    isLayoutRefreshing = true;
    cancelAnimationFrame(resizeResumeFrame);

    if (scrollLocked && automaticSolutionMore) {
        interruptedTransition = {
            progress: automaticSolutionMore.progress(),
            reversed: automaticSolutionMore.reversed(),
            revealed: transitionRevealed,
        };
        automaticSolutionMore.pause();
        unlockTransitionScroll();
    }
}

function handleLayoutRefreshEnd() {
    cancelAnimationFrame(resizeResumeFrame);
    resizeResumeFrame = requestAnimationFrame(() => {
        resizeResumeFrame = requestAnimationFrame(() => {
            const transition = interruptedTransition;
            interruptedTransition = undefined;
            isLayoutRefreshing = false;

            if (!transition || !automaticSolutionMore) return;

            if (transition.reversed) {
                automaticSolutionMore
                    .progress(transition.progress, true)
                    .pause();
            } else {
                automaticSolutionMore
                    .invalidate()
                    .progress(transition.progress, true)
                    .pause();
            }
            transitionRevealed = transition.revealed;
            lockTransitionScroll(
                window.scrollY,
                transition.reversed ? "up" : "down",
            );
            if (transition.reversed) {
                automaticSolutionMore
                    .timeScale(SOLUTION_MORE_REVERSE_SPEED_MULTIPLIER)
                    .reverse();
            } else {
                automaticSolutionMore.timeScale(1).play();
            }
        });
    });
}

function buildSequence() {
    if (
        !sequence.value ||
        !productIntroLayer.value ||
        !waveTransition.value ||
        !smokeTransition.value ||
        !productPayload ||
        !productIntroPayload ||
        !solutionPayload ||
        !moreAboutUsPayload
    ) {
        return;
    }

    const product = productPayload;
    const productIntro = productIntroPayload;
    const solution = solutionPayload;
    const moreAboutUs = moreAboutUsPayload;
    const footer = document.querySelector<HTMLElement>("[data-home-footer]");
    const footerWave = footer?.querySelector<HTMLElement>(
        "[data-home-footer-wave]",
    );
    const smokeClouds = Array.from(
        smokeTransition.value.querySelectorAll<SVGGElement>(
            "[data-solution-smoke-cloud]",
        ),
    );
    const waveMasks = WAVE_REVEAL_LAYERS.map((layer) => {
        const exitLayer = WAVE_EXIT_LAYERS.find(({ id }) => id === layer.id)!;

        return {
            ...layer,
            ...exitLayer,
            solid: waveTransition.value!.querySelector<SVGRectElement>(
                `[data-product-wave-mask-solid="${layer.id}"]`,
            ),
            edge: waveTransition.value!.querySelector<SVGRectElement>(
                `[data-product-wave-mask-edge="${layer.id}"]`,
            ),
            exitEdge: waveTransition.value!.querySelector<SVGRectElement>(
                `[data-product-wave-mask-exit-edge="${layer.id}"]`,
            ),
        };
    });
    const productBackground = product.scene.querySelector<HTMLElement>(
        ".product-scene__background",
    );
    const solutionMarkers = Array.from(
        solution.scene.querySelectorAll<HTMLElement>(".solution-marker"),
    );
    const solutionLabels = Array.from(
        solution.scene.querySelectorAll<HTMLElement>(".solution-marker__label"),
    );
    const solutionPaintTargets = solutionMarkers.map((marker) =>
        Array.from(
            marker.querySelectorAll<HTMLElement>(
                ".solution-actor__visual, .solution-marker__label",
            ),
        ),
    );

    if (
        waveMasks.some(({ solid, edge, exitEdge }) =>
            [solid, edge, exitEdge].some((element) => !element),
        ) ||
        !productBackground ||
        !footer ||
        !footerWave ||
        smokeClouds.length !== 2 ||
        solutionMarkers.length !== 3 ||
        solutionLabels.length !== 3 ||
        solutionPaintTargets.some((targets) => targets.length !== 3)
    ) {
        scheduleBuild();
        return;
    }

    ScrollTrigger.getById("product-solution-story")?.kill(true);
    unlockTransitionScroll();
    automaticSolutionMore?.kill();
    resetHomeFooter();
    homeFooter = footer;
    homeFooterWave = footerWave;
    master?.kill();
    detachTimeline(productIntro.timeline);
    detachTimeline(product.timeline);
    detachTimeline(solution.timeline);
    detachTimeline(moreAboutUs.timeline);

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    const orbitDuration = reduceMotion ? 0.25 : 3.8;
    const orbitState = { angle: PAINT_PATH.startAngle };
    const modelStartScale = isPortrait
        ? PRODUCT_ENTRANCE.portraitStartScale
        : PRODUCT_ENTRANCE.landscapeStartScale;
    const productSpinEnd =
        product.timeline.labels.openLid ?? product.timeline.duration();
    const upwardExitDuration = reduceMotion
        ? 0.08
        : productSpinEnd / WAVE_EXIT.upwardMoveSpeed;

    const orbitRadius = () =>
        Math.min(
            sequence.value!.clientWidth * PAINT_PATH.radiusWidthRatio,
            sequence.value!.clientHeight * PAINT_PATH.radiusHeightRatio,
        ) * PAINT_PATH.radiusScale;
    const orbitPosition = (angle: number) => {
        const radians = (angle * Math.PI) / 180;
        const radius = orbitRadius();

        return {
            x:
                sequence.value!.clientWidth *
                    (PAINT_PATH.centerXOffsetPercent / 100) +
                Math.cos(radians) * radius,
            y:
                sequence.value!.clientHeight *
                    (PAINT_PATH.centerYOffsetPercent / 100) +
                Math.sin(radians) * radius,
        };
    };
    const renderOrbit = () => {
        const point = orbitPosition(orbitState.angle);
        gsap.set(product.productRig, {
            x: point.x,
            y: point.y,
        });
    };

    const paintOrigins = SOLUTION_MARKER_ANGLES.map((angle) => {
        const radians = (angle * Math.PI) / 180;
        return {
            x: 50 + Math.sin(radians) * 40,
            y: 50 - Math.cos(radians) * 40,
        };
    });
    const paintMasks = paintOrigins.map((origin) => ({
        start: `radial-gradient(circle at ${origin.x}% ${origin.y}%, #000 0%, #000 0%, transparent ${PAINT_REVEAL.edgeSoftnessPercent}%)`,
        end: `radial-gradient(circle at ${origin.x}% ${origin.y}%, #000 0%, #000 ${PAINT_REVEAL.radiusPercent - PAINT_REVEAL.edgeSoftnessPercent}%, transparent ${PAINT_REVEAL.radiusPercent}%)`,
    }));

    gsap.set(product.scene, { autoAlpha: 1, zIndex: 2 });
    gsap.set(moreAboutUs.scene, { autoAlpha: 1, zIndex: 0 });
    gsap.set(solution.scene, {
        autoAlpha: 1,
        zIndex: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        WebkitClipPath: "inset(0% 0% 0% 0%)",
    });
    gsap.set(productBackground, { autoAlpha: 1 });
    gsap.set(productIntroLayer.value, { autoAlpha: 1 });
    gsap.set(waveTransition.value, {
        autoAlpha: 1,
        xPercent: 0,
        yPercent: 0,
        zIndex: 4,
        force3D: true,
    });
    gsap.set(smokeTransition.value, {
        autoAlpha: 1,
        yPercent: 118,
        zIndex: 4,
        force3D: true,
    });
    gsap.set(smokeClouds, {
        x: 0,
        scale: reduceMotion ? 1 : 0.92,
        transformOrigin: "50% 100%",
        force3D: true,
    });
    gsap.set(homeFooter, {
        autoAlpha: 0,
        y: 0,
        force3D: true,
        willChange: "transform",
    });
    waveMasks.forEach(({ solid, edge, exitEdge }) => {
        gsap.set(solid!, {
            attr: { x: PRODUCT_ENTRANCE.maskStartX, width: 0 },
        });
        gsap.set(edge!, {
            attr: { x: PRODUCT_ENTRANCE.maskStartX },
        });
        gsap.set(exitEdge!, {
            attr: {
                x: PRODUCT_ENTRANCE.maskStartX - PRODUCT_ENTRANCE.maskEdgeWidth,
            },
        });
    });
    gsap.set(product.productRig, {
        autoAlpha: 0,
        x: 0,
        y: 0,
        scale: reduceMotion ? 1 : modelStartScale,
        transformOrigin: "50% 50%",
    });
    gsap.set(solution.scene, { autoAlpha: 0 });
    gsap.set(solutionMarkers, { autoAlpha: 1 });
    solutionPaintTargets.forEach((targets, index) => {
        const mask = paintMasks[index]!.start;

        gsap.set(targets, {
            autoAlpha: 0,
            maskImage: mask,
            WebkitMaskImage: mask,
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
        });
    });
    gsap.set(solutionLabels, { yPercent: 0 });

    productIntro.timeline.paused(false);
    product.timeline.paused(false);
    solution.timeline.paused(false);
    moreAboutUs.timeline.pause(0);

    let timeline: gsap.core.Timeline;
    const moveToLabel = (label: string) => {
        const trigger = timeline.scrollTrigger;
        const labelTime = timeline.labels[label];
        if (!trigger || typeof labelTime !== "number") return;

        const progress = labelTime / Math.max(timeline.duration(), 0.001);
        moveTransitionScroll(
            trigger.start + progress * (trigger.end - trigger.start),
        );
        timeline.time(labelTime, true);
    };
    const runAutomaticTransition = (
        self: ScrollTrigger,
        shouldReveal: boolean,
    ) => {
        if (
            isLayoutRefreshing ||
            isHomeScrollRestoring() ||
            !automaticSolutionMore ||
            shouldReveal === transitionRevealed
        ) {
            return;
        }

        const threshold = timeline.labels.solutionSmokeThreshold;
        if (typeof threshold !== "number") return;

        transitionRevealed = shouldReveal;
        const thresholdProgress =
            threshold / Math.max(timeline.duration(), 0.001);
        const thresholdScroll =
            self.start + thresholdProgress * (self.end - self.start);
        const anchoredScroll = thresholdScroll + (shouldReveal ? 1 : -1);
        lockTransitionScroll(anchoredScroll, shouldReveal ? "down" : "up");
        moveTransitionScroll(anchoredScroll);
        if (shouldReveal) {
            automaticSolutionMore.timeScale(1).invalidate().play();
        } else {
            automaticSolutionMore
                .progress(1, true)
                .pause()
                .timeScale(SOLUTION_MORE_REVERSE_SPEED_MULTIPLIER)
                .reverse();
        }
    };

    timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
            id: "product-solution-story",
            trigger: sequence.value,
            start: "top top",
            end: () =>
                `+=${window.innerHeight * (reduceMotion ? 12 : isPortrait ? 25 : 27)}`,
            scrub: reduceMotion ? true : 0.7,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                const threshold = timeline.labels.solutionSmokeThreshold;
                const thresholdProgress =
                    typeof threshold === "number"
                        ? threshold / Math.max(timeline.duration(), 0.001)
                        : undefined;
                const shouldReveal =
                    typeof thresholdProgress === "number" &&
                    self.progress >= thresholdProgress;
                runAutomaticTransition(self, shouldReveal);
            },
            onLeave: (self) => runAutomaticTransition(self, true),
            onLeaveBack: (self) => runAutomaticTransition(self, false),
        },
    });
    master = timeline;

    master
        .addLabel("productIntroStory", 0)
        .add(productIntro.timeline, "productIntroStory")
        .addLabel("waveRush");

    promoteChapterLabels(master, productIntro.timeline, "productIntroStory");

    waveMasks.forEach(({ solid, edge, delay, duration, ease }) => {
        const revealAt = reduceMotion ? "waveRush" : `waveRush+=${delay}`;
        const revealDuration = reduceMotion ? 0.08 : duration;
        const revealEase = reduceMotion ? "none" : ease;

        master!
            .to(
                solid!,
                {
                    attr: { width: PRODUCT_ENTRANCE.maskEndWidth },
                    duration: revealDuration,
                    ease: revealEase,
                },
                revealAt,
            )
            .to(
                edge!,
                {
                    attr: { x: PRODUCT_ENTRANCE.maskEndX },
                    duration: revealDuration,
                    ease: revealEase,
                },
                revealAt,
            );
    });

    const waveRevealDuration = reduceMotion
        ? 0.08
        : Math.max(
              ...WAVE_REVEAL_LAYERS.map(
                  ({ delay, duration }) => delay + duration,
              ),
          );

    master
        .addLabel("waveRevealComplete", `waveRush+=${waveRevealDuration}`)
        .set(productIntroLayer.value, { autoAlpha: 0 }, "waveRevealComplete")
        .set(product.scene, { zIndex: 5 }, "waveRevealComplete")
        .set(productBackground, { autoAlpha: 0 }, "waveRevealComplete")
        .addLabel("productReveal", "waveRevealComplete")
        .to(
            product.productRig,
            {
                duration: reduceMotion
                    ? 0.08
                    : PRODUCT_ENTRANCE.modelRevealDuration,
                autoAlpha: 1,
                scale: 1,
                ease: reduceMotion ? "none" : "back.out(1.35)",
            },
            `productReveal+=${reduceMotion ? 0 : 0.08}`,
        )
        .addLabel("productStory", ">-0.04")
        .add(product.timeline, "productStory");

    promoteChapterLabels(master, product.timeline, "productStory");

    master.to(
        waveTransition.value,
        {
            yPercent: WAVE_EXIT.upwardExitYPercent,
            duration: upwardExitDuration,
            ease: "none",
        },
        "productStory",
    );

    waveMasks.forEach(({ solid, exitEdge, durationRatio, ease }) => {
        const exitDuration = reduceMotion
            ? 0.08
            : upwardExitDuration * durationRatio;

        master!
            .to(
                solid!,
                {
                    attr: {
                        x: PRODUCT_ENTRANCE.maskEndX,
                        width: 0,
                    },
                    duration: exitDuration,
                    ease,
                },
                "productStory",
            )
            .to(
                exitEdge!,
                {
                    attr: {
                        x:
                            PRODUCT_ENTRANCE.maskEndX -
                            PRODUCT_ENTRANCE.maskEdgeWidth,
                    },
                    duration: exitDuration,
                    ease,
                },
                "productStory",
            );
    });

    master
        .addLabel("solutionHandoff")
        .set(product.scene, { overflow: "visible" }, "solutionHandoff")
        .set(solution.scene, { autoAlpha: 1 }, "solutionHandoff")
        .to(
            product.featureLayer,
            {
                autoAlpha: 0,
                scale: 0.96,
                duration: reduceMotion ? 0.05 : 0.5,
            },
            "solutionHandoff",
        )
        .to(
            product.modelOrientation,
            {
                roll: PAINT_PATH.screenRoll,
                pitch: (reduceMotion ? 0 : 360) + PAINT_PATH.forwardPitch,
                yaw: PAINT_PATH.sideYaw,
                parallaxStrength: 0,
                duration: reduceMotion ? 0.08 : 0.9,
                ease: "power3.inOut",
                onUpdate: product.applyModelOrientation,
            },
            "solutionHandoff",
        )
        .to(
            product.productRig,
            {
                x: () => orbitPosition(PAINT_PATH.startAngle).x,
                y: () => orbitPosition(PAINT_PATH.startAngle).y,
                duration: reduceMotion ? 0.08 : PRODUCT_HANDOFF.moveDuration,
                ease: reduceMotion ? "none" : "power4.out",
            },
            "solutionHandoff",
        )
        .to(
            product.productRig,
            {
                scale: isPortrait
                    ? PAINT_PATH.portraitScale
                    : PAINT_PATH.landscapeScale,
                duration: reduceMotion ? 0.08 : PRODUCT_HANDOFF.scaleDuration,
                ease: reduceMotion ? "none" : "power3.out",
            },
            "solutionHandoff",
        )
        .addLabel("paintSolutions")
        .to(
            orbitState,
            {
                angle: PAINT_PATH.endAngle,
                duration: orbitDuration,
                onUpdate: renderOrbit,
            },
            "paintSolutions",
        )
        .to(
            product.modelOrientation,
            {
                yaw: reduceMotion
                    ? PAINT_PATH.sideYaw
                    : PAINT_PATH.sideYaw + PAINT_PATH.sideYawPeakOffset,
                duration: reduceMotion
                    ? orbitDuration
                    : orbitDuration * PAINT_PATH.sideYawPeakProgress,
                ease: reduceMotion ? "none" : "sine.inOut",
                onUpdate: product.applyModelOrientation,
            },
            "paintSolutions",
        )
        .to(
            product.modelOrientation,
            {
                yaw: reduceMotion
                    ? PAINT_PATH.sideYaw
                    : PAINT_PATH.sideYaw + PAINT_PATH.sideYawEndOffset,
                duration: reduceMotion
                    ? 0
                    : orbitDuration * (1 - PAINT_PATH.sideYawPeakProgress),
                ease: reduceMotion ? "none" : "sine.inOut",
                onUpdate: product.applyModelOrientation,
            },
            `paintSolutions+=${
                reduceMotion
                    ? orbitDuration
                    : orbitDuration * PAINT_PATH.sideYawPeakProgress
            }`,
        );

    solutionPaintTargets.forEach((targets, index) => {
        const markerProgress =
            (SOLUTION_MARKER_ANGLES[index]! - PAINT_PATH.startAngle) /
            (PAINT_PATH.endAngle - PAINT_PATH.startAngle);
        const revealAt = orbitDuration * markerProgress;
        const mask = paintMasks[index]!.end;
        master!.to(
            targets,
            {
                autoAlpha: 1,
                maskImage: mask,
                WebkitMaskImage: mask,
                duration: reduceMotion ? 0.04 : PAINT_REVEAL.duration,
                ease: reduceMotion ? "none" : "sine.out",
            },
            `paintSolutions+=${revealAt}`,
        );
    });

    master
        .set(solutionPaintTargets.flat(), {
            clearProps: "maskImage,webkitMaskImage,maskRepeat,webkitMaskRepeat",
        })
        .to(
            product.productRig,
            {
                autoAlpha: 0,
                scale: isPortrait ? 0.24 : 0.31,
                duration: reduceMotion ? 0.05 : 0.4,
                ease: "power2.out",
            },
            ">-0.05",
        )
        .set(product.scene, { autoAlpha: 0 })
        .addLabel("solutionStory")
        .add(solution.timeline, "solutionStory");

    promoteChapterLabels(master, solution.timeline, "solutionStory");

    const smokeArrivalDuration = reduceMotion ? 0.04 : 0.58;
    const smokeWipeDuration = reduceMotion ? 0.08 : 1.16;
    const smokeSeparateDuration = reduceMotion ? 0.01 : 0.32;

    master
        .addLabel("solutionStoryComplete")
        .to(sequence.value, { duration: reduceMotion ? 0.02 : 0.18 })
        .addLabel("solutionSmokeThreshold")
        .to(sequence.value, { duration: reduceMotion ? 0.02 : 0.16 })
        .addLabel("moreAboutUsStory")
        .to(sequence.value, { duration: reduceMotion ? 0.08 : 0.5 });

    master.addLabel(HOME_CHAPTERS.moreAboutUs, master.labels.moreAboutUsStory);
    master.addLabel(
        homeChapterActivationLabel(HOME_CHAPTERS.moreAboutUs),
        master.labels.moreAboutUsStory,
    );

    automaticSolutionMore = gsap
        .timeline({ paused: true, defaults: { ease: "none" } })
        .set(homeFooter, { autoAlpha: 0, y: 0 }, 0)
        .set(smokeTransition.value, { autoAlpha: 1 }, 0)
        .to(
            smokeTransition.value,
            {
                yPercent: 78,
                duration: smokeArrivalDuration,
                ease: reduceMotion ? "none" : "back.out(1.08)",
            },
            0,
        )
        .to(
            smokeClouds,
            {
                scale: 1,
                duration: smokeArrivalDuration,
                ease: reduceMotion ? "none" : "back.out(1.2)",
            },
            0,
        )
        .addLabel("smokeWipe")
        .to(
            solution.scene,
            {
                clipPath: "inset(0% 0% 100% 0%)",
                WebkitClipPath: "inset(0% 0% 100% 0%)",
                duration: smokeWipeDuration,
                ease: reduceMotion ? "none" : "power2.inOut",
            },
            "smokeWipe",
        )
        .to(
            smokeTransition.value,
            {
                yPercent: -103,
                duration: smokeWipeDuration,
                ease: reduceMotion ? "none" : "power2.inOut",
            },
            "smokeWipe",
        )
        .to(
            smokeClouds,
            {
                x: (index) => (index === 0 ? -180 : 180),
                duration: smokeSeparateDuration,
                ease: reduceMotion ? "none" : "power2.out",
            },
            `smokeWipe+=${Math.max(
                smokeWipeDuration - smokeSeparateDuration,
                0,
            )}`,
        )
        .set(solution.scene, { autoAlpha: 0 })
        .set(moreAboutUs.scene, { zIndex: 5 })
        .addLabel("moreAboutUsIntro")
        .set(homeFooter, { autoAlpha: 1 }, "moreAboutUsIntro")
        .to(
            homeFooter,
            {
                y: homeFooterRevealOffset,
                duration: moreAboutUs.timeline.duration(),
                ease: reduceMotion ? "none" : "power2.out",
            },
            "moreAboutUsIntro",
        )
        .to(
            moreAboutUs.timeline,
            {
                progress: 1,
                duration: moreAboutUs.timeline.duration(),
                ease: "none",
            },
            "moreAboutUsIntro",
        )
        .to(sequence.value, { duration: reduceMotion ? 0.02 : 0.18 });

    automaticSolutionMore.duration(
        reduceMotion
            ? automaticSolutionMore.duration()
            : SOLUTION_MORE_AUTOMATIC_DURATION,
    );
    automaticSolutionMore.eventCallback("onComplete", () => {
        if (!handoffHomeFooterToDocument()) {
            moveToLabel("moreAboutUsStory");
        }
        unlockTransitionScroll();
    });
    automaticSolutionMore.eventCallback("onReverseComplete", () => {
        gsap.set(homeFooter, { autoAlpha: 0, y: 0 });
        moveToLabel("solutionStoryComplete");
        unlockTransitionScroll();
    });
    automaticSolutionMore.progress(0, true).pause();
    transitionRevealed = false;

    ScrollTrigger.refresh();
    requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        if (!isHomeScrollRestoring()) syncTransitionToRestoredScroll();
    });
}

onMounted(() => {
    window.addEventListener(
        HOME_SCROLL_REFRESH_START,
        handleLayoutRefreshStart,
    );
    window.addEventListener(HOME_SCROLL_REFRESH_END, handleLayoutRefreshEnd);
    window.addEventListener(HOME_SCROLL_RESTORE_END, handleScrollRestoreEnd);
});

onBeforeUnmount(() => {
    cancelAnimationFrame(buildFrame);
    cancelAnimationFrame(resizeResumeFrame);
    cancelAnimationFrame(restoreResumeFrame);
    window.removeEventListener(
        HOME_SCROLL_REFRESH_START,
        handleLayoutRefreshStart,
    );
    window.removeEventListener(HOME_SCROLL_REFRESH_END, handleLayoutRefreshEnd);
    window.removeEventListener(HOME_SCROLL_RESTORE_END, handleScrollRestoreEnd);
    unlockTransitionScroll();
    automaticSolutionMore?.kill();
    resetHomeFooter();
    master?.scrollTrigger?.kill(true);
    master?.kill();
    ScrollTrigger.getById("product-solution-story")?.kill(true);
});
</script>

<template>
    <section
        ref="sequence"
        class="product-solution-sequence relative h-svh min-h-screen overflow-hidden bg-[#07366f]"
        aria-label="Expelliodor product and solutions"
    >
        <MoreAboutUs embedded @timeline-ready="handleMoreAboutUsReady" />
        <Solution embedded @timeline-ready="handleSolutionReady" />
        <Product embedded @timeline-ready="handleProductReady" />
        <div ref="productIntroLayer" class="product-intro-layer">
            <ProductIntro @timeline-ready="handleProductIntroReady" />
        </div>
        <div
            ref="waveTransition"
            class="product-wave-layer pointer-events-none absolute inset-0"
        >
            <ProductWaveTransition />
        </div>
        <div
            ref="smokeTransition"
            class="solution-smoke-layer pointer-events-none absolute inset-0"
            aria-hidden="true"
        >
            <SolutionSmokeTransition />
        </div>
    </section>
</template>

<style scoped>
.product-solution-sequence {
    isolation: isolate;
}

.product-solution-sequence :deep(.solution-scene),
.product-solution-sequence :deep(.product-scene),
.product-solution-sequence :deep(.more-about-us) {
    position: absolute;
    inset: 0;
    width: 100%;
    min-height: 100%;
}

.product-solution-sequence :deep(.more-about-us) {
    z-index: 0;
    background: transparent;
}

.product-solution-sequence :deep(.solution-scene) {
    z-index: 1;
}

.product-solution-sequence :deep(.product-scene) {
    z-index: 2;
    background: transparent !important;
}

/*
 * The rig moves around the solution markers during the handoff. Keep the
 * model-viewer canvas wider than the viewport so a rotated bottle cannot run
 * into the WebGL canvas edge while the rig is translated. Its height stays
 * unchanged, so the model's framing and apparent size are unaffected.
 */
.product-solution-sequence :deep(.product-model) {
    right: auto;
    left: -50%;
    width: 200%;
    max-width: none;
}

.product-intro-layer {
    position: absolute;
    inset: 0;
    z-index: 3;
    width: 100%;
    min-height: 100%;
}

.product-intro-layer :deep(.product-intro) {
    width: 100%;
    min-height: 100%;
}

.product-wave-layer {
    z-index: 4;
    width: 100%;
    height: 100%;
    will-change: transform;
}
</style>
