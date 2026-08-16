<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onBeforeUnmount, ref } from "vue";

import Product from "./Product.vue";
import ProductIntro from "./ProductIntro.vue";
import ProductWaveTransition from "./ProductWaveTransition.vue";
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

const PRODUCT_ENTRANCE = {
    maskStartX: -220,
    maskEndX: 1990,
    maskEndWidth: 2210,
    maskEdgeWidth: 150,
    modelRevealDuration: 0.72,
    landscapeStartScale: 0.16,
    portraitStartScale: 0.1,
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

const sequence = ref<HTMLElement | null>(null);
const productIntroLayer = ref<HTMLElement | null>(null);
const waveTransition = ref<HTMLElement | null>(null);

let productPayload: ProductTimelinePayload | undefined;
let productIntroPayload: ProductIntroTimelinePayload | undefined;
let solutionPayload: SolutionTimelinePayload | undefined;
let master: gsap.core.Timeline | undefined;
let buildFrame = 0;

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

function buildSequence() {
    if (
        !sequence.value ||
        !productIntroLayer.value ||
        !waveTransition.value ||
        !productPayload ||
        !productIntroPayload ||
        !solutionPayload
    ) {
        return;
    }

    const product = productPayload;
    const productIntro = productIntroPayload;
    const solution = solutionPayload;
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
        solutionMarkers.length !== 3 ||
        solutionLabels.length !== 3 ||
        solutionPaintTargets.some((targets) => targets.length !== 3)
    ) {
        scheduleBuild();
        return;
    }

    ScrollTrigger.getById("product-solution-story")?.kill(true);
    master?.kill();
    detachTimeline(productIntro.timeline);
    detachTimeline(product.timeline);
    detachTimeline(solution.timeline);

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
    gsap.set(productBackground, { autoAlpha: 1 });
    gsap.set(productIntroLayer.value, { autoAlpha: 1 });
    gsap.set(waveTransition.value, {
        autoAlpha: 1,
        xPercent: 0,
        yPercent: 0,
        zIndex: 4,
        force3D: true,
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

    master = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
            id: "product-solution-story",
            trigger: sequence.value,
            start: "top top",
            end: () =>
                `+=${window.innerHeight * (reduceMotion ? 10 : isPortrait ? 20 : 22)}`,
            scrub: reduceMotion ? true : 0.7,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
        },
    });

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

    promoteChapterLabels(master, solution.timeline, "solutionStory");

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
        <div ref="productIntroLayer" class="product-intro-layer">
            <ProductIntro @timeline-ready="handleProductIntroReady" />
        </div>
        <div
            ref="waveTransition"
            class="product-wave-layer pointer-events-none absolute inset-0"
        >
            <ProductWaveTransition />
        </div>
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
