<script setup lang="ts">
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { nextTick, onMounted, onUnmounted, ref } from "vue";

import Chromosome from "./ABCC11/Chromosome.vue";
import TransporterAnim from "./Mechanism/TransporterAnim.vue";
import {
    HOME_SCROLL_REFRESH_END,
    HOME_SCROLL_REFRESH_START,
} from "~/utils/home-scroll";

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

type TransporterAnimExpose = {
    getTimeline: () => gsap.core.Timeline | undefined;
};

// 汗腺右下角 ABCC11 转运蛋白的位置调节区。
const GLAND_TRANSPORTER_POSITION = {
    right: "-10%",
    bottom: "-10%",
    width: "77%",
    rotation: -36,
} as const;
const glandTransporterStyle = {
    right: GLAND_TRANSPORTER_POSITION.right,
    bottom: GLAND_TRANSPORTER_POSITION.bottom,
    width: GLAND_TRANSPORTER_POSITION.width,
    transform: `rotate(${GLAND_TRANSPORTER_POSITION.rotation}deg)`,
};

// 汗腺 PNG 的旋转角度调节区。
const GLAND_IMAGE_ROTATION = 20;
const GLAND_IMAGE_SCALE = 1.25;
const glandImageStyle = {
    transform: `rotate(${GLAND_IMAGE_ROTATION}deg) scale(${GLAND_IMAGE_SCALE})`,
};

// “Axillary area” 位置调节区。
const AXILLARY_LABEL_POSITION = {
    right: "-24%",
    bottom: "10%",
} as const;
const axillaryLabelStyle = {
    right: AXILLARY_LABEL_POSITION.right,
    bottom: AXILLARY_LABEL_POSITION.bottom,
};

// “Apocrine gland” 弧形标题的位置与旋转调节区。
const APOCRINE_GLAND_LABEL_POSITION = {
    top: "-9%",
    left: "-29%",
    rotation: -19,
} as const;
const apocrineGlandLabelStyle = {
    top: APOCRINE_GLAND_LABEL_POSITION.top,
    left: APOCRINE_GLAND_LABEL_POSITION.left,
    transform: `rotate(${APOCRINE_GLAND_LABEL_POSITION.rotation}deg)`,
};

// “Staphylococcus hominis” 弧形标题的位置与旋转调节区。
const STAPHYLOCOCCUS_LABEL_POSITION = {
    right: "40%",
    bottom: "-20%",
    rotation: 0,
} as const;
const staphylococcusLabelStyle = {
    right: STAPHYLOCOCCUS_LABEL_POSITION.right,
    bottom: STAPHYLOCOCCUS_LABEL_POSITION.bottom,
    transform: `rotate(${STAPHYLOCOCCUS_LABEL_POSITION.rotation}deg)`,
};

// 两个箭头的坐标、旋转与翻转缩放调节区。
const STORY_ARROW_TRANSFORMS = {
    first: { x: "8%", y: "0%", rotation: -20 },
    second: { x: "-10%", y: "-60%", rotation: 40 },
} as const;
const storyArrowFirstStyle = {
    "--arrow-x": STORY_ARROW_TRANSFORMS.first.x,
    "--arrow-y": STORY_ARROW_TRANSFORMS.first.y,
    "--arrow-rotation": `${STORY_ARROW_TRANSFORMS.first.rotation}deg`,
};
const storyArrowSecondStyle = {
    "--arrow-x": STORY_ARROW_TRANSFORMS.second.x,
    "--arrow-y": STORY_ARROW_TRANSFORMS.second.y,
    "--arrow-rotation": `${STORY_ARROW_TRANSFORMS.second.rotation}deg`,
};

const scene = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);
const odorGenotypes = ref<HTMLElement | null>(null);
const ttGenotype = ref<HTMLElement | null>(null);
const odorCopy = ref<HTMLElement | null>(null);
const variantCopy = ref<HTMLElement | null>(null);
const secondScene = ref<HTMLElement | null>(null);
const glandTransporter = ref<TransporterAnimExpose | null>(null);
const precursor = ref<HTMLElement | null>(null);
const precursorVisual = ref<HTMLElement | null>(null);
const precursorLabel = ref<HTMLElement | null>(null);

type PrecursorPathPoint = {
    x: number;
    y: number;
    rotation: number;
    scale: number;
    moveDuration: number;
    visualDuration: number;
    ease: string;
};

// Precursor 完整移动路径调节区：x / y 是相对整个 ABCC11 场景的百分比坐标。
const PRECURSOR_PATH = {
    start: {
        x: 70,
        y: 86,
        rotation: 15,
        scale: 2,
        moveDuration: 0,
        visualDuration: 0,
        ease: "none",
    },
    glandEntry: {
        x: 56,
        y: 68,
        rotation: 65,
        scale: 0.66,
        moveDuration: 0.72,
        visualDuration: 0.55,
        ease: "power2.inOut",
    },
    glandInside: {
        x: 50,
        y: 52,
        rotation: 8,
        scale: 0.88,
        moveDuration: 0.72,
        visualDuration: 0.55,
        ease: "power2.inOut",
    },
    bacteria: {
        x: 69,
        y: 30,
        rotation: 20,
        scale: 1.05,
        moveDuration: 0.65,
        visualDuration: 0.65,
        ease: "power2.inOut",
    },
    final: {
        x: 74,
        y: 45,
        rotation: 20,
        scale: 1,
        moveDuration: 1,
        visualDuration: 1,
        ease: "power2.inOut",
    },
} as const satisfies Record<string, PrecursorPathPoint>;

let media: gsap.MatchMedia | undefined;
const precursorTeleportDisabled = ref(true);
let motionPreference: MediaQueryList | undefined;
let precursorRouteTimeline: gsap.core.Timeline | undefined;
let storyTimeline: gsap.core.Timeline | undefined;
let precursorRouteObserver: MutationObserver | undefined;
let precursorRouteFrame = 0;
let precursorRouteState: "before" | "moving" | "after" | undefined;

function syncPrecursorTeleport() {
    precursorTeleportDisabled.value = motionPreference?.matches ?? true;
}

function precursorPointVars(point: PrecursorPathPoint) {
    return {
        x: () => scene.value!.clientWidth * (point.x / 100),
        y: () => scene.value!.clientHeight * (point.y / 100),
    };
}

function precursorCurvePath(points: readonly PrecursorPathPoint[]) {
    return points.map((point) => ({
        x: scene.value!.clientWidth * (point.x / 100),
        y: scene.value!.clientHeight * (point.y / 100),
    }));
}

function pointInPinnedScene(anchor: HTMLElement, pinnedScene: HTMLElement) {
    const anchorRect = anchor.getBoundingClientRect();
    const sceneRect = pinnedScene.getBoundingClientRect();

    return {
        x: anchorRect.left - sceneRect.left + anchorRect.width / 2,
        y: anchorRect.top - sceneRect.top + anchorRect.height / 2,
    };
}

function setActorVisibility(element: HTMLElement | null, visible: boolean) {
    if (!element) return;
    element.style.visibility = visible ? "inherit" : "hidden";
}

function destroyPrecursorRoute() {
    cancelAnimationFrame(precursorRouteFrame);
    precursorRouteObserver?.disconnect();
    precursorRouteObserver = undefined;
    precursorRouteTimeline?.scrollTrigger?.kill();
    precursorRouteTimeline?.kill();
    precursorRouteTimeline = undefined;
    precursorRouteState = undefined;
    precursor.value?.style.removeProperty("visibility");
    document
        .querySelector<HTMLElement>("#mechanism .mechanism-scene__molecule")
        ?.style.removeProperty("visibility");
}

function setupPrecursorRoute(
    storyTimeline: gsap.core.Timeline,
    path: typeof PRECURSOR_PATH,
    refreshAfterSetup = true,
) {
    if (
        precursorRouteTimeline ||
        !scene.value ||
        !precursor.value ||
        !precursorVisual.value
    ) {
        return false;
    }

    const storyTrigger = storyTimeline.scrollTrigger;
    const targetScene = document.querySelector<HTMLElement>("#mechanism");
    const target = targetScene?.querySelector<HTMLElement>(
        ".mechanism-scene__molecule",
    );
    const targetAnchor = targetScene?.querySelector<HTMLElement>(
        ".precursor-transition-target",
    );
    const mechanismTrigger = ScrollTrigger.getById("mechanism-story");

    if (
        !storyTrigger ||
        !targetScene ||
        !target ||
        !targetAnchor ||
        !mechanismTrigger
    ) {
        return false;
    }

    const source = precursor.value;
    const visual = precursorVisual.value;
    const routeStart = () => {
        const labelTime = storyTimeline.labels.odorRoute ?? 0;
        const timelineDuration = Math.max(storyTimeline.duration(), 0.001);
        return (
            storyTrigger.start +
            (labelTime / timelineDuration) *
                (storyTrigger.end - storyTrigger.start)
        );
    };
    const routePath = () => [
        ...precursorCurvePath([path.glandInside, path.bacteria]),
        pointInPinnedScene(targetAnchor, targetScene),
    ];
    const targetScale = () =>
        target.offsetWidth / Math.max(source.offsetWidth, 1);

    precursorRouteTimeline = gsap.timeline({
        defaults: { duration: 1 },
        scrollTrigger: {
            id: "abcc11-mechanism-precursor-route",
            trigger: scene.value,
            start: routeStart,
            end: () => mechanismTrigger.start,
            // The route and Mechanism must meet at the exact same scroll
            // position in both directions; eased scrub creates a reverse gap.
            scrub: true,
            invalidateOnRefresh: true,
            onRefresh: () => {
                if (precursorRouteTimeline) syncActors(true);
            },
        },
    });

    precursorRouteTimeline
        .to(
            source,
            {
                motionPath: {
                    path: routePath,
                    fromCurrent: false,
                    curviness: 1.35,
                },
                scale: targetScale,
                ease: "none",
            },
            0,
        )
        .fromTo(
            visual,
            {
                rotation: path.glandInside.rotation,
                scale: path.glandInside.scale,
                yPercent: 0,
            },
            {
                rotation: path.bacteria.rotation,
                scale: path.bacteria.scale,
                yPercent: -6,
                duration: 0.28,
                ease: "power1.inOut",
                immediateRender: false,
            },
            0,
        )
        .to(
            visual,
            {
                rotation: path.final.rotation,
                scale: path.final.scale,
                yPercent: 3,
                duration: 0.32,
                ease: "power1.inOut",
            },
            0.28,
        )
        .to(
            visual,
            {
                rotation: 10,
                scale: 1,
                yPercent: 0,
                duration: 0.4,
                ease: "power1.inOut",
            },
            0.6,
        );

    function syncActors(force = false) {
        const progress = precursorRouteTimeline?.progress() ?? 0;
        const nextState =
            progress <= 0.001
                ? "before"
                : progress >= 0.999
                  ? "after"
                  : "moving";

        if (!force && precursorRouteState === nextState) return;
        precursorRouteState = nextState;

        if (nextState === "after") {
            setActorVisibility(source, false);
            setActorVisibility(target, true);
            return;
        }

        setActorVisibility(source, true);
        setActorVisibility(target, nextState === "before");
    }

    precursorRouteTimeline.eventCallback("onUpdate", syncActors);
    syncActors();
    precursorRouteObserver?.disconnect();
    precursorRouteObserver = undefined;
    if (refreshAfterSetup) {
        void nextTick(() => ScrollTrigger.refresh());
    }
    return true;
}

function queuePrecursorRoute(
    storyTimeline: gsap.core.Timeline,
    path: typeof PRECURSOR_PATH,
) {
    cancelAnimationFrame(precursorRouteFrame);
    precursorRouteFrame = requestAnimationFrame(() => {
        precursorRouteFrame = requestAnimationFrame(() => {
            if (setupPrecursorRoute(storyTimeline, path)) return;

            if (!precursorRouteObserver) {
                precursorRouteObserver = new MutationObserver(() =>
                    queuePrecursorRoute(storyTimeline, path),
                );
                precursorRouteObserver.observe(document.body, {
                    childList: true,
                    subtree: true,
                });
            }
        });
    });
}

function rebuildPrecursorRoute() {
    destroyPrecursorRoute();
    if (!storyTimeline) return;

    if (!setupPrecursorRoute(storyTimeline, PRECURSOR_PATH, false)) {
        queuePrecursorRoute(storyTimeline, PRECURSOR_PATH);
    }
}

onMounted(async () => {
    window.addEventListener(HOME_SCROLL_REFRESH_START, destroyPrecursorRoute);
    window.addEventListener(HOME_SCROLL_REFRESH_END, rebuildPrecursorRoute);

    motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    syncPrecursorTeleport();
    motionPreference.addEventListener("change", syncPrecursorTeleport);
    await nextTick();

    if (
        !scene.value ||
        !stage.value ||
        !odorGenotypes.value ||
        !ttGenotype.value ||
        !odorCopy.value ||
        !variantCopy.value ||
        !secondScene.value ||
        !precursor.value ||
        !precursorVisual.value ||
        !precursorLabel.value
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
            const phenotypeTransporters = gsap.utils.toArray<HTMLElement>(
                ".genotype-result",
                scene.value!,
            );
            const arrowPaths = gsap.utils.toArray<SVGPathElement>(
                ".story-arrow__path",
                scene.value!,
            );
            const arrowHeads = gsap.utils.toArray<SVGPathElement>(
                ".story-arrow__head",
                scene.value!,
            );
            const storyItems = gsap.utils.toArray<HTMLElement>(
                ".abcc11-story__item, .abcc11-story__label, .abcc11-story__copy",
                secondScene.value!,
            );
            const transporterTimeline = glandTransporter.value?.getTimeline();
            const path = PRECURSOR_PATH;

            const topInset = () => {
                const value = getComputedStyle(scene.value!).getPropertyValue(
                    "--abcc11-top-space",
                );
                return Number.parseFloat(value) || 56;
            };
            const moveToTop = (element: HTMLElement) =>
                topInset() - element.offsetTop;

            transporterTimeline?.pause(0);
            gsap.set(secondScene.value, { autoAlpha: 0 });
            gsap.set(storyItems, { autoAlpha: 0, y: 24 });
            gsap.set(phenotypeTransporters, { autoAlpha: 0, y: 18 });
            gsap.set(precursor.value, {
                ...precursorPointVars(path.start),
                autoAlpha: 0,
                xPercent: -50,
                yPercent: -50,
            });
            gsap.set(precursorLabel.value, { autoAlpha: 1, y: 0 });
            gsap.set(precursorVisual.value, {
                rotation: path.start.rotation,
                scale: path.start.scale,
                transformOrigin: "50% 50%",
            });
            arrowPaths.forEach((path) => {
                const length = path.getTotalLength();
                gsap.set(path, {
                    strokeDasharray: length,
                    strokeDashoffset: length,
                });
            });
            gsap.set(arrowHeads, { autoAlpha: 0 });

            if (reduceMotion) {
                gsap.set([odorCopy.value, variantCopy.value], {
                    autoAlpha: 0,
                });
                gsap.set(odorGenotypes.value, {
                    y: moveToTop(odorGenotypes.value!),
                    scale: 0.78,
                    transformOrigin: "left top",
                });
                gsap.set(ttGenotype.value, {
                    y: moveToTop(ttGenotype.value!),
                    scale: 0.78,
                    transformOrigin: "right top",
                });
                gsap.set(
                    [
                        secondScene.value,
                        precursor.value,
                        ...storyItems,
                        ...phenotypeTransporters,
                    ],
                    { autoAlpha: 1, y: 0 },
                );
                gsap.set(arrowPaths, { strokeDashoffset: 0 });
                gsap.set(arrowHeads, { autoAlpha: 1 });
                gsap.set(precursor.value, {
                    ...precursorPointVars(path.final),
                    autoAlpha: 1,
                });
                gsap.set(precursorVisual.value, {
                    rotation: path.final.rotation,
                    scale: path.final.scale,
                });
                gsap.set(precursorLabel.value, { autoAlpha: 0 });
                return;
            }

            const timeline = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                    id: "abcc11-genotype-story",
                    trigger: scene.value,
                    start: "top top",
                    end: () => `+=${window.innerHeight * 4.8}`,
                    scrub: 0.65,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                },
            });
            storyTimeline = timeline;

            timeline
                .addLabel("firstScene", 0)
                .to(
                    [odorCopy.value, variantCopy.value],
                    {
                        autoAlpha: 0,
                        y: -24,
                        duration: 0.42,
                        stagger: 0.05,
                    },
                    "firstScene+=0.12",
                )
                .addLabel("moveGenotypes", 0.4)
                .to(
                    odorGenotypes.value,
                    {
                        y: () => moveToTop(odorGenotypes.value!),
                        scale: 0.78,
                        transformOrigin: "left top",
                        duration: 0.65,
                        ease: "power2.inOut",
                    },
                    "moveGenotypes",
                )
                .to(
                    ttGenotype.value,
                    {
                        y: () => moveToTop(ttGenotype.value!),
                        scale: 0.78,
                        transformOrigin: "right top",
                        duration: 0.65,
                        ease: "power2.inOut",
                    },
                    "moveGenotypes",
                )
                .to(
                    phenotypeTransporters,
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.35,
                        stagger: 0.08,
                        ease: "power2.out",
                    },
                    "moveGenotypes+=0.38",
                )
                .addLabel("story", ">-0.06")
                .to(secondScene.value, { autoAlpha: 1, duration: 0.2 }, "story")
                .to(
                    precursor.value,
                    { autoAlpha: 1, duration: 0.35 },
                    "story+=0.12",
                )
                .to(
                    storyItems,
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.45,
                        stagger: 0.08,
                        ease: "power2.out",
                    },
                    "story",
                )
                .to(
                    arrowPaths,
                    {
                        strokeDashoffset: 0,
                        duration: 0.62,
                        stagger: 0.12,
                        ease: "power1.inOut",
                    },
                    "story+=0.18",
                )
                .to(arrowHeads, { autoAlpha: 1, duration: 0.16 }, "story+=0.68")
                .addLabel("transport", ">+0.12")
                .to(
                    precursorLabel.value,
                    { autoAlpha: 0, y: -8, duration: 0.22 },
                    "transport",
                )
                .to(
                    precursor.value,
                    {
                        ...precursorPointVars(path.glandEntry),
                        duration: path.glandEntry.moveDuration,
                        ease: path.glandEntry.ease,
                    },
                    "transport",
                )
                .to(
                    precursorVisual.value,
                    {
                        rotation: path.glandEntry.rotation,
                        scale: path.glandEntry.scale,
                        duration: path.glandEntry.visualDuration,
                        ease: path.glandEntry.ease,
                    },
                    "transport",
                );

            timeline.addLabel("throughTransporter");

            if (transporterTimeline) {
                timeline.to(
                    transporterTimeline,
                    {
                        progress: 1,
                        duration: path.glandInside.moveDuration,
                        ease: "power2.inOut",
                    },
                    "throughTransporter",
                );
            }

            timeline
                .to(
                    precursor.value,
                    {
                        ...precursorPointVars(path.glandInside),
                        duration: path.glandInside.moveDuration,
                        ease: path.glandInside.ease,
                    },
                    "throughTransporter",
                )
                .to(
                    precursorVisual.value,
                    {
                        rotation: path.glandInside.rotation,
                        scale: path.glandInside.scale,
                        duration: path.glandInside.visualDuration,
                        ease: path.glandInside.ease,
                    },
                    "throughTransporter",
                );

            timeline.addLabel(
                "odorRoute",
                `throughTransporter+=${path.glandInside.moveDuration}`,
            );

            if (transporterTimeline) {
                timeline.to(
                    transporterTimeline,
                    {
                        progress: 0,
                        duration: path.bacteria.moveDuration,
                        ease: "power2.inOut",
                    },
                    "odorRoute",
                );
            }

            queuePrecursorRoute(timeline, path);
            return () => {
                storyTimeline = undefined;
                destroyPrecursorRoute();
            };
        },
        scene.value,
    );

    void nextTick(() => ScrollTrigger.refresh());
});

onUnmounted(() => {
    window.removeEventListener(
        HOME_SCROLL_REFRESH_START,
        destroyPrecursorRoute,
    );
    window.removeEventListener(HOME_SCROLL_REFRESH_END, rebuildPrecursorRoute);
    motionPreference?.removeEventListener("change", syncPrecursorTeleport);
    destroyPrecursorRoute();
    media?.revert();
});
</script>

<template>
    <section
        id="abcc11"
        ref="scene"
        class="abcc11-scene relative isolate h-svh min-h-144 w-full overflow-hidden bg-[#073873]"
        aria-labelledby="abcc11-title"
    >
        <h2 id="abcc11-title" class="sr-only">ABCC11 genotype</h2>
        <div
            ref="stage"
            class="abcc11-scene__stage relative mx-auto h-full w-full max-w-[120rem]"
        >
            <div
                ref="odorGenotypes"
                class="genotype-group genotype-group--odor absolute z-6 flex items-center will-change-transform"
                aria-label="CC and TC genotypes express the ABCC11 transporter"
            >
                <div
                    class="genotype-group__chromosomes flex min-w-0 flex-[0_0_auto] items-start"
                >
                    <Chromosome :genome="0" />
                    <Chromosome :genome="1" />
                </div>
                <div
                    class="genotype-result ml-[clamp(-3rem,-2vw,-1rem)] will-change-[transform,opacity]"
                    aria-hidden="true"
                >
                    <div
                        class="transporter-stack relative aspect-964/847 w-full"
                    >
                        <img
                            class="absolute inset-0 block size-full object-contain"
                            src="https://static.igem.wiki/teams/6133/wiki/homepage/abcc11m.avif"
                            alt=""
                        />
                        <img
                            class="absolute inset-0 block size-full object-contain"
                            src="https://static.igem.wiki/teams/6133/wiki/homepage/abcc11l.avif"
                            alt=""
                        />
                        <img
                            class="absolute inset-0 block size-full object-contain"
                            src="https://static.igem.wiki/teams/6133/wiki/homepage/abcc11r.avif"
                            alt=""
                        />
                    </div>
                </div>
            </div>

            <p
                ref="odorCopy"
                class="scene-copy scene-copy--odor absolute top-[clamp(5rem,16svh,10rem)] right-[clamp(1.5rem,5vw,6rem)] z-2 m-0 w-[min(45vw,54rem)] text-center text-[clamp(1.45rem,3.15vw,4rem)] leading-[1.48] text-balance text-white will-change-[transform,opacity] max-[52rem]:top-[33svh] max-[52rem]:right-[5vw] max-[52rem]:w-[72vw] max-[52rem]:text-[clamp(1.1rem,4.5vw,2.25rem)] max-[52rem]:leading-[1.32] [&_strong]:font-[inherit] [&_strong]:text-[#ff594e]"
            >
                Axillary odor production is influenced by genetic variations in
                the <strong>ABCC11 gene.</strong>
            </p>

            <p
                ref="variantCopy"
                class="scene-copy scene-copy--variant absolute bottom-[clamp(3.5rem,14svh,9rem)] left-[clamp(1.5rem,4vw,5rem)] z-2 m-0 w-[min(56vw,64rem)] text-center text-[clamp(1.45rem,3.15vw,4rem)] leading-[1.48] text-balance text-white will-change-[transform,opacity] max-[52rem]:bottom-[25svh] max-[52rem]:left-[5vw] max-[52rem]:w-[50vw] max-[52rem]:text-[clamp(1.1rem,4.5vw,2.25rem)] max-[52rem]:leading-[1.32] [&_strong]:font-[inherit] [&_strong]:text-[#64dbbb]"
            >
                <strong>Specific variants</strong> of this gene strongly
                correlate with the odor producing phenotype.
            </p>

            <div
                ref="ttGenotype"
                class="genotype-group genotype-group--tt absolute z-6 flex items-center will-change-transform"
                aria-label="TT genotype does not express the ABCC11 transporter"
            >
                <div
                    class="genotype-group__chromosomes flex min-w-0 flex-[0_0_auto] items-start"
                >
                    <Chromosome :genome="2" />
                </div>
                <div
                    class="genotype-result ml-[clamp(-3rem,-2vw,-1rem)] will-change-[transform,opacity]"
                    aria-hidden="true"
                >
                    <div
                        class="transporter-stack relative aspect-[964/847] w-full"
                    >
                        <img
                            class="absolute inset-0 block size-full object-contain"
                            src="https://static.igem.wiki/teams/6133/wiki/homepage/abcc11m.avif"
                            alt=""
                        />
                        <img
                            class="absolute inset-0 block size-full object-contain"
                            src="https://static.igem.wiki/teams/6133/wiki/homepage/abcc11l.avif"
                            alt=""
                        />
                        <img
                            class="absolute inset-0 block size-full object-contain"
                            src="https://static.igem.wiki/teams/6133/wiki/homepage/abcc11r.avif"
                            alt=""
                        />
                        <svg
                            class="transporter-stack__cross absolute inset-[14%] z-5 block size-[72%] overflow-visible [&_path]:fill-none [&_path]:stroke-white [&_path]:[stroke-width:10] [&_path]:[filter:drop-shadow(0_2px_2px_rgb(1_32_72_/_40%))] [&_path]:[stroke-linecap:round]"
                            viewBox="0 0 100 100"
                        >
                            <path d="M16 16 84 84M84 16 16 84" />
                        </svg>
                    </div>
                </div>
            </div>

            <div ref="secondScene" class="abcc11-story">
                <div class="abcc11-story__flow">
                    <figure class="abcc11-story__item abcc11-story__person">
                        <img
                            src="https://static.igem.wiki/teams/6133/wiki/homepage/wavehand.avif"
                            alt="A person raising an arm, showing the axillary area"
                            draggable="false"
                        />
                        <figcaption
                            class="abcc11-story__label abcc11-story__label--person"
                            :style="axillaryLabelStyle"
                        >
                            Axillary area
                        </figcaption>
                    </figure>

                    <svg
                        class="story-arrow story-arrow--first"
                        :style="storyArrowFirstStyle"
                        viewBox="0 -80 400 120"
                        aria-hidden="true"
                    >
                        <defs>
                            <mask
                                id="abcc11-arrow-mask-one"
                                maskUnits="userSpaceOnUse"
                                x="-8"
                                y="-8"
                                width="346.62"
                                height="71.251"
                            >
                                <path d="M-8-8H338.62V63.251H-8Z" fill="#fff" />
                                <path
                                    d="m306.518 5.054 18.739.662-5.883 17.803Z"
                                    fill="#000"
                                    stroke="#000"
                                    stroke-linejoin="round"
                                    stroke-width="7.5"
                                />
                            </mask>
                        </defs>
                        <g>
                            <path
                                class="story-arrow__path"
                                mask="url(#abcc11-arrow-mask-one)"
                                d="M5.424 5.383C128.762 66.396 235.309 66.54 325.067 5.816"
                            />
                            <path
                                class="story-arrow__head"
                                d="m305.064 5.152 19.988.707-6.275 18.99Z"
                            />
                        </g>
                    </svg>

                    <figure
                        class="abcc11-story__item abcc11-story__gland"
                        aria-label="Apocrine gland"
                    >
                        <img
                            class="abcc11-story__gland-image"
                            src="https://static.igem.wiki/teams/6133/wiki/homepage/gland.avif"
                            :style="glandImageStyle"
                            alt="Apocrine gland"
                            draggable="false"
                        />
                        <TransporterAnim
                            ref="glandTransporter"
                            class="abcc11-scene__transporter"
                            :style="glandTransporterStyle"
                            left-src="https://static.igem.wiki/teams/6133/wiki/homepage/abcc11l.avif"
                            middle-src="https://static.igem.wiki/teams/6133/wiki/homepage/abcc11m.avif"
                            right-src="https://static.igem.wiki/teams/6133/wiki/homepage/abcc11r.avif"
                            :open-angle="-5"
                            :closed-angle="12"
                            :autoplay="false"
                        />
                        <svg
                            class="abcc11-story__curve-label abcc11-story__curve-label--gland"
                            :style="apocrineGlandLabelStyle"
                            viewBox="0 0 500 240"
                            aria-hidden="true"
                        >
                            <path
                                id="abcc11-gland-label-curve"
                                d="M70 196Q310 6 550 196"
                            />
                            <text>
                                <textPath
                                    href="#abcc11-gland-label-curve"
                                    startOffset="50%"
                                    text-anchor="middle"
                                >
                                    Apocrine gland
                                </textPath>
                            </text>
                        </svg>
                    </figure>

                    <svg
                        class="story-arrow story-arrow--second"
                        :style="storyArrowSecondStyle"
                        viewBox="-8 -8 347 72"
                        aria-hidden="true"
                    >
                        <defs>
                            <mask
                                id="abcc11-arrow-mask-two"
                                maskUnits="userSpaceOnUse"
                                x="-8"
                                y="-8"
                                width="346.62"
                                height="71.251"
                            >
                                <path d="M-8-8H338.62V63.251H-8Z" fill="#fff" />
                                <path
                                    d="m306.518 5.054 18.739.662-5.883 17.803Z"
                                    fill="#000"
                                    stroke="#000"
                                    stroke-linejoin="round"
                                    stroke-width="7.5"
                                />
                            </mask>
                        </defs>
                        <g>
                            <path
                                class="story-arrow__path"
                                mask="url(#abcc11-arrow-mask-two)"
                                d="M5.424 5.383C128.762 66.396 235.309 66.54 325.067 5.816"
                            />
                            <path
                                class="story-arrow__head"
                                d="m305.064 5.152 19.988.707-6.275 18.99Z"
                            />
                        </g>
                    </svg>

                    <figure
                        class="abcc11-story__item abcc11-story__bacteria"
                        aria-label="Staphylococcus hominis"
                    >
                        <img
                            src="https://static.igem.wiki/teams/6133/wiki/homepage/shominis.avif"
                            alt="Staphylococcus hominis bacteria"
                            class="abcc11-story__bacteria-image translate-x-[-15%]"
                            draggable="false"
                        />
                        <svg
                            class="abcc11-story__curve-label abcc11-story__curve-label--bacteria"
                            :style="staphylococcusLabelStyle"
                            viewBox="0 0 540 160"
                            aria-hidden="true"
                        >
                            <path
                                id="abcc11-bacteria-label-curve"
                                d="M20 55Q400 255 780 55"
                            />
                            <text>
                                <textPath
                                    href="#abcc11-bacteria-label-curve"
                                    startOffset="50%"
                                    text-anchor="middle"
                                    textLength="700"
                                    lengthAdjust="spacingAndGlyphs"
                                >
                                    Staphylococcus hominis
                                </textPath>
                            </text>
                        </svg>
                    </figure>
                </div>

                <div class="abcc11-story__footer">
                    <p class="abcc11-story__copy">
                        <strong>People with </strong>
                        <span class="abcc11-story__gene">ABCC11 gene</span>
                        express a transporter that transports odor precursor out
                        to the apocrine gland in axilliary area.
                    </p>
                </div>
            </div>
        </div>

        <Teleport to="body" :disabled="precursorTeleportDisabled">
            <div
                ref="precursor"
                class="abcc11-precursor pointer-events-none invisible top-0 left-0 aspect-square w-[clamp(4rem,6.5vw,7.5rem)] will-change-[transform,opacity]"
                :class="
                    precursorTeleportDisabled
                        ? 'absolute z-30'
                        : 'fixed z-[100]'
                "
                aria-label="Odor precursor"
            >
                <div
                    ref="precursorVisual"
                    class="abcc11-precursor__visual absolute inset-0 size-full will-change-transform"
                >
                    <img
                        class="abcc11-precursor__layer absolute inset-0 block size-full scale-x-[-1] object-contain will-change-[transform,opacity] select-none"
                        src="https://static.igem.wiki/teams/6133/wiki/homepage/precursorcys3m3sh.avif"
                        alt=""
                        draggable="false"
                    />
                    <img
                        class="abcc11-precursor__layer absolute inset-0 block size-full scale-x-[-1] object-contain will-change-[transform,opacity] select-none"
                        src="https://static.igem.wiki/teams/6133/wiki/homepage/precursorgly.avif"
                        alt=""
                        draggable="false"
                    />
                </div>
                <span
                    ref="precursorLabel"
                    class="abcc11-precursor__label absolute top-[calc(100%+0.25rem)] left-1/2 -translate-x-1/2 text-[clamp(0.72rem,1.15vw,1.2rem)] leading-none whitespace-nowrap text-white will-change-[transform,opacity]"
                >
                    Cys-Gly-3M3SH
                </span>
            </div>
        </Teleport>
    </section>
</template>

<style scoped>
.abcc11-scene {
    --abcc11-top-space: calc(var(--spacing, 0.25rem) * 30);
}

.genotype-group {
    --chromosome-size: clamp(13.5rem, 21vw, 24rem);
    --transporter-size: clamp(9rem, 14vw, 16rem);
}

.genotype-group--odor .genotype-group__chromosomes {
    width: calc(var(--chromosome-size) * 2);
}

.genotype-group--tt .genotype-group__chromosomes {
    width: var(--chromosome-size);
}

.genotype-group--odor {
    top: var(--abcc11-top-space);
    left: clamp(1.5rem, 5vw, 6rem);
    width: calc(var(--chromosome-size) * 2 + var(--transporter-size) - 2rem);
}

.genotype-group--tt {
    top: auto;
    right: clamp(1.5rem, 5vw, 6rem);
    bottom: clamp(3.5rem, 14svh, 9rem);
    width: calc(var(--chromosome-size) + var(--transporter-size) - 2rem);
}

.genotype-group :deep(.chromosome-illustration) {
    width: 100%;
    min-width: 0;
}

.genotype-result {
    flex: 0 0 var(--transporter-size);
}

.abcc11-precursor__label,
.scene-copy,
.abcc11-story__label,
.abcc11-story__curve-label text,
.abcc11-story__copy {
    font-family: var(--font-righteous), sans-serif;
}

.abcc11-story {
    position: absolute;
    z-index: 3;
    inset: clamp(10.5rem, 24svh, 15rem) clamp(1rem, 4vw, 4rem) 0;
    display: grid;
    grid-template-rows: minmax(0, 1fr) minmax(5rem, auto);
    visibility: hidden;
    will-change: opacity;
}

.abcc11-story__flow {
    display: grid;
    grid-template-columns:
        minmax(10rem, 1fr) minmax(5rem, 0.58fr) minmax(12rem, 1.25fr)
        minmax(5rem, 0.58fr) minmax(11rem, 1fr);
    align-items: center;
    min-height: 0;
}

.abcc11-story__item {
    position: relative;
    align-self: center;
    min-width: 0;
    margin: 0;
    will-change: transform, opacity;
}

.abcc11-story__item > img,
.abcc11-story__item > :deep(svg) {
    display: block;
    width: 100%;
    height: auto;
    object-fit: contain;
}

.abcc11-story__person {
    align-self: center;
    width: min(100%, 22rem);
}

.abcc11-story__gland {
    width: min(75%, 20.25rem);
    justify-self: center;
}

.abcc11-story__gland-image {
    transform-origin: 50% 50%;
}

.abcc11-story__bacteria {
    width: min(75%, 18rem);
    justify-self: end;
}

.abcc11-story__bacteria-image {
    position: relative;
    z-index: 2;
}

.abcc11-story__extra-bacterium {
    position: absolute;
    z-index: 1;
    display: block;
    height: auto;
    overflow: visible;
    transform-origin: 50% 50%;
    pointer-events: none;
}

.abcc11-story__extra-bacterium path {
    fill: #ffe6a3;
    stroke: #bd6b00;
    stroke-width: 7;
    stroke-linejoin: round;
}

.abcc11-story__label {
    position: absolute;
    z-index: 5;
    color: #fff;
    font-size: clamp(1rem, 1.8vw, 2rem);
    line-height: 1;
    white-space: nowrap;
    text-shadow: 0 3px 2px rgb(0 30 67 / 45%);
    will-change: transform, opacity;
}

.abcc11-story__label--person {
    transform: none;
}

.abcc11-story__curve-label {
    position: absolute;
    z-index: 6;
    display: block;
    overflow: visible;
    pointer-events: none;
}

.abcc11-story__curve-label path {
    fill: none;
    stroke: none;
}

.abcc11-story__curve-label text {
    fill: #fff;
    font-size: clamp(2.2rem, 4.2vw, 4.6rem);
    text-shadow: 0 3px 2px rgb(0 30 67 / 45%);
}

.abcc11-story__curve-label--gland {
    width: 114%;
}

.abcc11-story__curve-label--bacteria {
    width: 116%;
}

.abcc11-story__curve-label--bacteria text {
    font-style: italic;
}

.story-arrow {
    --arrow-x: 0%;
    --arrow-y: 0%;
    --arrow-rotation: 0deg;

    display: block;
    width: 100%;
    overflow: visible;
    color: #fff;
    transform: translate(var(--arrow-x), var(--arrow-y))
        rotate(var(--arrow-rotation)) scale(1.5) scaleY(-1);
    transform-origin: 50% 50%;
}

.story-arrow--first {
    /* 将当前箭头上下镜像，使弧线向下弯。 */
    transform: translate(var(--arrow-x), var(--arrow-y))
        rotate(var(--arrow-rotation)) scale(1.5) scaleY(1);
}

.story-arrow__path {
    fill: none;
    stroke: currentcolor;
    stroke-linecap: round;
    stroke-width: 8;
    will-change: stroke-dashoffset;
}

.story-arrow__head {
    fill: currentcolor;
    stroke: currentcolor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 8;
}

.abcc11-scene__transporter {
    position: absolute;
    z-index: 5;
    transform-origin: 50% 50%;
}

.abcc11-story__footer {
    display: block;
    padding: 0 clamp(1rem, 3vw, 3rem) clamp(1rem, 2.5svh, 2.25rem);
}

.abcc11-story__copy {
    z-index: 5;
    width: min(100%, 72rem);
    max-width: 50%;
    margin: 0;
    color: #fff;
    font-size: clamp(1.05rem, 2.05vw, 2.35rem);
    line-height: 1.42;
    text-align: left;
    will-change: transform, opacity;
}

.abcc11-story__copy strong {
    font-weight: inherit;
}

.abcc11-story__gene {
    color: #ff6257;
}

@media (max-width: 52rem) {
    .genotype-group {
        --chromosome-size: clamp(9.75rem, 33vw, 13.5rem);
        --transporter-size: clamp(6.5rem, 22vw, 9rem);
    }

    .genotype-group--odor {
        top: 8svh;
        left: 3vw;
        width: 67vw;
    }

    .genotype-group--tt {
        top: auto;
        right: 3vw;
        bottom: 25svh;
    }

    .abcc11-story {
        inset: 20svh 2vw 0;
    }

    .abcc11-story__flow {
        grid-template-columns: 0.86fr 0.3fr 1fr 0.3fr 0.86fr;
    }

    .abcc11-story__label {
        font-size: clamp(0.65rem, 2.4vw, 1rem);
    }

    .abcc11-story__curve-label text {
        font-size: clamp(2.25rem, 6vw, 3.4rem);
    }

    .story-arrow__path {
        stroke-width: 10;
    }

    .abcc11-story__copy {
        font-size: clamp(0.82rem, 2.8vw, 1.1rem);
    }

    .abcc11-story__footer {
        grid-template-columns: minmax(0, 1fr) clamp(5.5rem, 18vw, 8rem);
        gap: 0.75rem;
    }
}

@media (orientation: portrait) and (max-width: 40rem) {
    .abcc11-story {
        top: 18svh;
    }

    .abcc11-story__flow {
        grid-template-columns: minmax(0, 1fr) 2.75rem minmax(0, 1.1fr);
        grid-template-rows: 1fr 1fr;
    }

    .abcc11-story__person {
        grid-column: 1;
        grid-row: 1;
    }

    .story-arrow--first {
        grid-column: 2;
        grid-row: 1;
    }

    .abcc11-story__gland {
        grid-column: 3;
        grid-row: 1;
    }

    .story-arrow--second {
        grid-column: 2;
        grid-row: 2;
    }

    .abcc11-story__bacteria {
        grid-column: 3;
        grid-row: 2;
        width: 80%;
    }
}

@media (prefers-reduced-motion: reduce) {
    .genotype-group,
    .genotype-result,
    .scene-copy,
    .abcc11-story__item,
    .abcc11-story__label,
    .abcc11-story__copy {
        animation: none !important;
        transition: none !important;
    }
}
</style>
