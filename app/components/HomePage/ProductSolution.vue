<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onBeforeUnmount, ref } from "vue";

import Product from "./Product.vue";
import Solution from "./Solution.vue";

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

const sequence = ref<HTMLElement | null>(null);

let productPayload: ProductTimelinePayload | undefined;
let solutionPayload: SolutionTimelinePayload | undefined;
let master: gsap.core.Timeline | undefined;
let buildFrame = 0;

function handleProductReady(payload: ProductTimelinePayload) {
    productPayload = payload;
    scheduleBuild();
}

function handleSolutionReady(payload: SolutionTimelinePayload) {
    solutionPayload = payload;
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

function buildSequence() {
    if (!sequence.value || !productPayload || !solutionPayload) return;

    const product = productPayload;
    const solution = solutionPayload;
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
        !productBackground ||
        solutionMarkers.length !== 3 ||
        solutionLabels.length !== 3 ||
        solutionPaintTargets.some((targets) => targets.length !== 3)
    ) {
        scheduleBuild();
        return;
    }

    ScrollTrigger.getById("product-solution-story")?.kill(true);
    master?.kill();
    detachTimeline(product.timeline);
    detachTimeline(solution.timeline);

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    const orbitDuration = reduceMotion ? 0.25 : 3.8;
    const orbitState = { angle: PAINT_PATH.startAngle };

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

    gsap.set(product.scene, { autoAlpha: 1 });
    gsap.set(productBackground, { autoAlpha: 1 });
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

    product.timeline.paused(false);
    solution.timeline.paused(false);

    master = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
            id: "product-solution-story",
            trigger: sequence.value,
            start: "top top",
            end: () =>
                `+=${window.innerHeight * (reduceMotion ? 9 : isPortrait ? 18 : 20)}`,
            scrub: reduceMotion ? true : 0.7,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
        },
    });

    master
        .add(product.timeline, 0)
        .addLabel("solutionHandoff")
        .set(solution.scene, { autoAlpha: 1 }, "solutionHandoff")
        .to(
            productBackground,
            {
                autoAlpha: 0,
                duration: reduceMotion ? 0.05 : 0.45,
            },
            "solutionHandoff",
        )
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
                scale: isPortrait
                    ? PAINT_PATH.portraitScale
                    : PAINT_PATH.landscapeScale,
                duration: reduceMotion ? 0.08 : 0.9,
                ease: "power3.inOut",
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

    ScrollTrigger.refresh();
    requestAnimationFrame(() => ScrollTrigger.refresh());
}

onBeforeUnmount(() => {
    cancelAnimationFrame(buildFrame);
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
        <Solution embedded @timeline-ready="handleSolutionReady" />
        <Product embedded @timeline-ready="handleProductReady" />
    </section>
</template>

<style scoped>
.product-solution-sequence {
    isolation: isolate;
}

.product-solution-sequence :deep(.solution-scene),
.product-solution-sequence :deep(.product-scene) {
    position: absolute;
    inset: 0;
    width: 100%;
    min-height: 100%;
}

.product-solution-sequence :deep(.solution-scene) {
    z-index: 1;
}

.product-solution-sequence :deep(.product-scene) {
    z-index: 2;
    background: transparent !important;
}
</style>
