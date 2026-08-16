<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onMounted, onUnmounted, ref } from "vue";

import {
    HOME_CHAPTERS,
    homeChapterActivationLabel,
} from "~/utils/home-chapters";
import { HOME_SCROLL_REFRESH_END } from "~/utils/home-scroll";

import TransporterAnim from "./Mechanism/TransporterAnim.vue";
import BinderAnim from "./Solution/BinderAnim.vue";
import CGTaseAnim from "./Solution/CGTaseAnim.vue";
import PrecursorSprite from "./Solution/PrecursorSprite.vue";
import TransporterBinderAnim from "./Solution/TransporterBinderAnim.vue";

gsap.registerPlugin(ScrollTrigger);

const props = withDefaults(defineProps<{ embedded?: boolean }>(), {
    embedded: false,
});

const emit = defineEmits<{
    timelineReady: [
        payload: {
            timeline: gsap.core.Timeline;
            scene: HTMLElement;
        },
    ];
}>();

type PercentPoint = { x: number; y: number };

type ActorArc = {
    start: PercentPoint;
    control: PercentPoint;
    end: PercentPoint;
    startWidth: number;
    endWidth: number;
    startScale: number;
    endScale: number;
    startRotation: number;
    endRotation: number;
};

type TransporterAnimExpose = {
    getTimeline: () => gsap.core.Timeline | undefined;
};

type BinderAnimExpose = {
    buildTimeline: (target: HTMLElement) => gsap.core.Timeline | undefined;
    getRoot: () => HTMLElement | null;
};

type TransporterBinderAnimExpose = {
    buildTimeline: (
        target: HTMLElement,
        attachedPlug: HTMLElement,
        transporterTimeline?: gsap.core.Timeline,
    ) => gsap.core.Timeline | undefined;
    getRoot: () => HTMLElement | null;
    invalidateLayout: () => void;
};

type CGTaseAnimExpose = {
    buildTimeline: (
        target: HTMLElement,
        transporterTimeline?: gsap.core.Timeline,
    ) => gsap.core.Timeline | undefined;
    getRoot: () => HTMLElement | null;
};

const ASSETS = {
    transporterLeft:
        "https://static.igem.wiki/teams/6133/wiki/homepage/peptshl.avif",
    transporterMiddle:
        "https://static.igem.wiki/teams/6133/wiki/homepage/peptshm.avif",
    transporterRight:
        "https://static.igem.wiki/teams/6133/wiki/homepage/peptshr.avif",
} as const;

const SCENE_LAYOUT = {
    wheelSize: 35,
    overviewCenter: { x: 50, y: 60 } satisfies PercentPoint,
    overviewScale: 0.78,
    activeCenter: { x: 50, y: 130 } satisfies PercentPoint,
    portraitActiveCenter: { x: 50, y: 116 } satisfies PercentPoint,
    activeScale: 2,
    transporterRadius: 38,
    transporterSize: 28,
    markerRadius: 77,
    markerSize: 45,
    copy: { x: 4, y: 10, width: 52 },
    portraitCopy: { x: 7, y: 8, width: 86 },
    copyEnterYOffset: 12,
    copyExitYOffset: -10,
    portraitWheelSize: 74,
    attachedPlug: {
        x: 48,
        y: 20,
        width: 31,
        rotation: 0,
    },
    scrollScreens: 11,
} as const;

const TRANSITION_LAYOUT = {
    firstArcControl: { x: 64, y: 5 } satisfies PercentPoint,
    entryArcs: [
        null,
        {
            start: { x: 108, y: 112 },
            control: { x: 102, y: 58 },
        },
        {
            start: { x: 108, y: 112 },
            control: { x: 96, y: 58 },
        },
    ],
    targets: [
        {
            point: { x: 78, y: 35 },
            width: 22,
            scale: 1.5,
            rotation: 0,
            precursorScale: 0.75,
            precursorFlip: false,
        },
        {
            point: { x: 78, y: 35 },
            width: 23,
            scale: 1.4,
            rotation: 0,
            precursorScale: 1,
            precursorFlip: false,
        },
        {
            point: { x: 72, y: 35 },
            width: 28,
            scale: 1.1,
            rotation: 0,
            precursorScale: 1,
            precursorFlip: true,
        },
    ],
    firstArcRotation: -8,
    entryRotation: 14,
    entryStartWidthScale: 0.72,
    labelHiddenYOffset: 18,
    labelExitYOffset: -12,
    arcDuration: 0.95,
    firstArcDuration: 1.15,
    labelRevealDuration: 0.2,
    labelExitDuration: 0.22,
    labelHoldDuration: 0.32,
} as const;

const ROTATION_STOPS = {
    overview: 0,
    solution1: -330,
    solution2: -450,
    solution3: -570,
} as const;

// Each transporter lands at 300 degrees with a 30-degree local orientation
// after its counter-clockwise rotation stop.
const TRANSPORTER_ANGLES = [270, 30, 150] as const;

const SOLUTIONS = [
    {
        id: "precursor-binder",
        title: "Precursor Binder",
        description:
            'Design <span class="text-[#ffd55e]">protein binders</span> that capture the <span class="text-[#8ed0ff]">Cys-Gly-3M3SH</span> before it is taken up by <span class="text-[#de8949]">Staphylococcus hominis</span>.',
        color: "#ffd55e",
        image: "https://static.igem.wiki/teams/6133/wiki/homepage/bindernoeyes.avif",
        angle: -90,
        iconWidth: 88,
        flip: false,
    },
    {
        id: "transporter-binder",
        title: "Transporter Binder",
        description:
            'Design <span class="text-[#8ed0ff]">PepTsh</span> plugs that bind to the <span class="text-[#8ed0ff]">PepTsh</span> transporters, reducing the uptake efficiency of <span class="text-[#8ed0ff]">Cys-Gly-3M3SH</span>.',
        color: "#ffae37",
        image: "https://static.igem.wiki/teams/6133/wiki/homepage/plugoutlined.avif",
        angle: 30,
        iconWidth: 78,
        flip: false,
    },
    {
        id: "cgtase",
        title: "CGTase",
        description:
            'Engineer <span class="text-[#52dfc5]">CGTase</span> to transfer glucosyl groups to the hydroxyl of <span class="text-[#8ed0ff]">Cys-Gly-3M3SH</span>, reducing its affinity to the <span class="text-[#8ed0ff]">PepTsh</span> transporter.',
        color: "#52dfc5",
        image: "https://static.igem.wiki/teams/6133/wiki/homepage/cgtasseoutlined.avif",
        angle: 150,
        iconWidth: 88,
        flip: true,
    },
] as const;

const scene = ref<HTMLElement | null>(null);
const wheelAnchor = ref<HTMLElement | null>(null);
const wheelScaler = ref<HTMLElement | null>(null);
const wheelRotor = ref<HTMLElement | null>(null);
const attachedPlug = ref<HTMLElement | null>(null);
const copyOne = ref<HTMLElement | null>(null);
const copyTwo = ref<HTMLElement | null>(null);
const copyThree = ref<HTMLElement | null>(null);
const binderAnim = ref<BinderAnimExpose | null>(null);
const transporterBinderAnim = ref<TransporterBinderAnimExpose | null>(null);
const cgtaseAnim = ref<CGTaseAnimExpose | null>(null);
const transporterRefs = ref<Array<TransporterAnimExpose | null>>([]);

const sceneCssVariables = {
    "--copy-left": `${SCENE_LAYOUT.copy.x}%`,
    "--copy-top": `${SCENE_LAYOUT.copy.y}%`,
    "--copy-width": `${SCENE_LAYOUT.copy.width}%`,
    "--portrait-copy-left": `${SCENE_LAYOUT.portraitCopy.x}%`,
    "--portrait-copy-top": `${SCENE_LAYOUT.portraitCopy.y}%`,
    "--portrait-copy-width": `${SCENE_LAYOUT.portraitCopy.width}%`,
    "--portrait-wheel-size": `${SCENE_LAYOUT.portraitWheelSize}%`,
} as Record<string, string>;

let matchMedia: gsap.MatchMedia | undefined;
let storyTimeline: gsap.core.Timeline | undefined;

function refreshStoryGeometry() {
    if (!storyTimeline) return;

    const progress = storyTimeline.progress();
    storyTimeline.revert({ kill: false });
    transporterBinderAnim.value?.invalidateLayout();
    storyTimeline.invalidate().progress(progress, true);
}

function setTransporterRef(index: number, instance: unknown) {
    transporterRefs.value[index] = instance as TransporterAnimExpose | null;
}

function setCopyRef(index: number, element: unknown) {
    const copyRefs = [copyOne, copyTwo, copyThree];
    copyRefs[index]!.value = element as HTMLElement | null;
}

function setAttachedPlugRef(element: unknown) {
    attachedPlug.value = element as HTMLElement | null;
}

function pointVars(point: PercentPoint) {
    return {
        left: `${point.x}%`,
        top: `${point.y}%`,
    };
}

function polarStyle(angle: number, radius: number, width: number) {
    const radians = (angle * Math.PI) / 180;

    return {
        left: `${50 + Math.cos(radians) * radius}%`,
        top: `${50 + Math.sin(radians) * radius}%`,
        width: `${width}%`,
    };
}

function transporterStyle(angle: number) {
    return {
        ...polarStyle(
            angle,
            SCENE_LAYOUT.transporterRadius,
            SCENE_LAYOUT.transporterSize,
        ),
        transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
    };
}

function overviewMarkerLayout(angle: number, wheelSize: number) {
    if (!scene.value) {
        return {
            point: SCENE_LAYOUT.overviewCenter,
            width: 0,
        };
    }

    const radians = (angle * Math.PI) / 180;
    const radius =
        scene.value.clientWidth *
        (wheelSize / 100) *
        SCENE_LAYOUT.overviewScale *
        (SCENE_LAYOUT.markerRadius / 100);

    return {
        point: {
            x:
                SCENE_LAYOUT.overviewCenter.x +
                (Math.cos(radians) * radius * 100) / scene.value.clientWidth,
            y:
                SCENE_LAYOUT.overviewCenter.y +
                (Math.sin(radians) * radius * 100) / scene.value.clientHeight,
        },
        width:
            wheelSize *
            SCENE_LAYOUT.overviewScale *
            (SCENE_LAYOUT.markerSize / 100),
    };
}

function setActorAt(actor: HTMLElement, point: PercentPoint, width: number) {
    gsap.set(actor, {
        left: `${point.x}%`,
        top: `${point.y}%`,
        width: `${width}%`,
        xPercent: -50,
        yPercent: -50,
    });
}

function addArcMotion(
    master: gsap.core.Timeline,
    actor: HTMLElement,
    arc: ActorArc,
    duration: number,
    position: string,
) {
    const travel = { progress: 0 };
    const setLeft = gsap.quickSetter(actor, "left", "%");
    const setTop = gsap.quickSetter(actor, "top", "%");

    master
        .to(
            travel,
            {
                progress: 1,
                duration,
                ease: "none",
                onUpdate: () => {
                    const progress = travel.progress;
                    const inverse = 1 - progress;
                    setLeft(
                        inverse * inverse * arc.start.x +
                            2 * inverse * progress * arc.control.x +
                            progress * progress * arc.end.x,
                    );
                    setTop(
                        inverse * inverse * arc.start.y +
                            2 * inverse * progress * arc.control.y +
                            progress * progress * arc.end.y,
                    );
                },
            },
            position,
        )
        .to(
            actor,
            {
                width: `${arc.endWidth}%`,
                scale: arc.endScale,
                rotation: arc.endRotation,
                duration,
                ease: "power2.inOut",
            },
            position,
        );
}

function addChildTimeline(
    master: gsap.core.Timeline,
    child: gsap.core.Timeline | undefined,
    position: string,
) {
    if (!child) return;
    child.paused(false);
    master.add(child, position);
}

onMounted(() => {
    window.addEventListener(HOME_SCROLL_REFRESH_END, refreshStoryGeometry);

    if (
        !scene.value ||
        !wheelAnchor.value ||
        !wheelScaler.value ||
        !wheelRotor.value ||
        !attachedPlug.value ||
        !copyOne.value ||
        !copyTwo.value ||
        !copyThree.value
    ) {
        return;
    }

    const transporterElements = Array.from(
        scene.value.querySelectorAll<HTMLElement>(
            ".solution-wheel__transporter",
        ),
    );
    const markerElements = Array.from(
        scene.value.querySelectorAll<HTMLElement>(".solution-marker"),
    );
    const markerLabels = Array.from(
        scene.value.querySelectorAll<HTMLElement>(".solution-marker__label"),
    );
    const entryActors = Array.from(
        scene.value.querySelectorAll<HTMLElement>(".solution-entry-actor"),
    );
    const entryLabels = Array.from(
        scene.value.querySelectorAll<HTMLElement>(
            ".solution-entry-actor__label",
        ),
    );
    const markerVisuals = markerElements.map((actor) =>
        Array.from(
            actor.querySelectorAll<HTMLElement>(".solution-actor__visual"),
        ),
    );
    const entryVisuals = entryActors.map((actor) =>
        Array.from(
            actor.querySelectorAll<HTMLElement>(".solution-actor__visual"),
        ),
    );
    const copyPanels = [copyOne.value, copyTwo.value, copyThree.value];

    if (
        transporterElements.length !== 3 ||
        markerElements.length !== 3 ||
        markerLabels.length !== 3 ||
        entryActors.length !== 2 ||
        entryLabels.length !== 2
    ) {
        return;
    }

    ScrollTrigger.getById("solution-story")?.kill(true);
    matchMedia = gsap.matchMedia();
    matchMedia.add(
        {
            isLandscape: "(orientation: landscape)",
            isPortrait: "(orientation: portrait)",
            reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (mediaContext) => {
            const { isPortrait, reduceMotion } = mediaContext.conditions as {
                isLandscape: boolean;
                isPortrait: boolean;
                reduceMotion: boolean;
            };
            const activeCenter = isPortrait
                ? SCENE_LAYOUT.portraitActiveCenter
                : SCENE_LAYOUT.activeCenter;
            const activeScale = isPortrait ? 2.15 : SCENE_LAYOUT.activeScale;
            const overviewWheelSize = isPortrait
                ? SCENE_LAYOUT.portraitWheelSize
                : SCENE_LAYOUT.wheelSize;
            const overviewActorLayouts = SOLUTIONS.map((solution) =>
                overviewMarkerLayout(solution.angle, overviewWheelSize),
            );
            const firstTarget = TRANSITION_LAYOUT.targets[0];
            const firstArc: ActorArc = {
                start: overviewActorLayouts[0]!.point,
                control: TRANSITION_LAYOUT.firstArcControl,
                end: firstTarget.point,
                startWidth: overviewActorLayouts[0]!.width,
                endWidth: firstTarget.width,
                startScale: 1,
                endScale: firstTarget.scale,
                startRotation: 0,
                endRotation: TRANSITION_LAYOUT.firstArcRotation,
            };
            const secondEntry = TRANSITION_LAYOUT.entryArcs[1]!;
            const thirdEntry = TRANSITION_LAYOUT.entryArcs[2]!;
            const secondTarget = TRANSITION_LAYOUT.targets[1];
            const thirdTarget = TRANSITION_LAYOUT.targets[2];
            const secondArc: ActorArc = {
                start: secondEntry.start,
                control: secondEntry.control,
                end: secondTarget.point,
                startWidth:
                    secondTarget.width * TRANSITION_LAYOUT.entryStartWidthScale,
                endWidth: secondTarget.width,
                startScale: 1,
                endScale: secondTarget.scale,
                startRotation: TRANSITION_LAYOUT.entryRotation,
                endRotation: secondTarget.rotation,
            };
            const thirdArc: ActorArc = {
                start: thirdEntry.start,
                control: thirdEntry.control,
                end: thirdTarget.point,
                startWidth:
                    thirdTarget.width * TRANSITION_LAYOUT.entryStartWidthScale,
                endWidth: thirdTarget.width,
                startScale: 1,
                endScale: thirdTarget.scale,
                startRotation: TRANSITION_LAYOUT.entryRotation,
                endRotation: thirdTarget.rotation,
            };

            gsap.set(wheelAnchor.value, {
                ...pointVars(SCENE_LAYOUT.overviewCenter),
                xPercent: -50,
                yPercent: -50,
            });
            gsap.set(wheelScaler.value, {
                scale: SCENE_LAYOUT.overviewScale,
                transformOrigin: "50% 50%",
            });
            gsap.set(wheelRotor.value, {
                rotation: ROTATION_STOPS.overview,
                transformOrigin: "50% 50%",
            });
            gsap.set(copyPanels, {
                autoAlpha: 0,
                yPercent: SCENE_LAYOUT.copyEnterYOffset,
            });
            markerElements.forEach((marker, index) => {
                const layout = overviewActorLayouts[index]!;
                setActorAt(marker, layout.point, layout.width);
                gsap.set(marker, {
                    autoAlpha: 1,
                    rotation: 0,
                    scale: 1,
                    transformOrigin: "50% 50%",
                });
            });
            gsap.set(markerLabels, { autoAlpha: 1, yPercent: 0 });
            gsap.set(markerVisuals.flat(), { autoAlpha: 1 });
            gsap.set(
                markerVisuals.map((visuals) => visuals[1]!),
                {
                    scale: 1,
                    transformOrigin: "50% 50%",
                },
            );
            [secondArc, thirdArc].forEach((arc, index) => {
                setActorAt(entryActors[index]!, arc.start, arc.startWidth);
                gsap.set(entryActors[index], {
                    autoAlpha: 0,
                    rotation: arc.startRotation,
                    scale: arc.startScale,
                    transformOrigin: "50% 50%",
                });
                gsap.set(entryLabels[index], {
                    autoAlpha: 0,
                    yPercent: TRANSITION_LAYOUT.labelHiddenYOffset,
                });
            });
            gsap.set(entryVisuals.flat(), { autoAlpha: 1 });
            gsap.set(
                entryVisuals.map((visuals) => visuals[1]!),
                {
                    scale: 1,
                    transformOrigin: "50% 50%",
                },
            );
            gsap.set(attachedPlug.value, { autoAlpha: 0 });

            transporterRefs.value.forEach((transporter) => {
                transporter?.getTimeline()?.pause(0);
            });

            const firstArcDuration = reduceMotion
                ? 0.01
                : TRANSITION_LAYOUT.firstArcDuration;
            const entryArcDuration = reduceMotion
                ? 0.01
                : TRANSITION_LAYOUT.arcDuration;
            const labelRevealDuration = reduceMotion
                ? 0.01
                : TRANSITION_LAYOUT.labelRevealDuration;
            const labelHoldDuration = reduceMotion
                ? 0.05
                : TRANSITION_LAYOUT.labelHoldDuration;
            const labelExitDuration = reduceMotion
                ? 0.01
                : TRANSITION_LAYOUT.labelExitDuration;
            const master = props.embedded
                ? gsap.timeline({
                      defaults: { ease: "none" },
                      paused: true,
                  })
                : gsap.timeline({
                      defaults: { ease: "none" },
                      scrollTrigger: {
                          id: "solution-story",
                          trigger: scene.value,
                          start: "top top",
                          end: () =>
                              `+=${window.innerHeight * (reduceMotion ? 5 : SCENE_LAYOUT.scrollScreens)}`,
                          scrub: reduceMotion ? true : 0.7,
                          pin: true,
                          anticipatePin: 1,
                          invalidateOnRefresh: true,
                      },
                  });
            storyTimeline = master;

            master
                .addLabel("overview", 0)
                .addLabel(
                    homeChapterActivationLabel(HOME_CHAPTERS.solutionOverview),
                    0,
                )
                .to(scene.value, {
                    duration: props.embedded ? 0.01 : reduceMotion ? 0.35 : 0.9,
                })
                .addLabel(HOME_CHAPTERS.solutionOverview)
                .addLabel("solution1Transition")
                .to(
                    markerElements.slice(1),
                    {
                        autoAlpha: 0,
                        duration: reduceMotion ? 0.01 : 0.22,
                    },
                    "solution1Transition",
                )
                .to(
                    wheelAnchor.value,
                    {
                        ...pointVars(activeCenter),
                        duration: firstArcDuration,
                        ease: reduceMotion ? "none" : "power3.inOut",
                    },
                    "solution1Transition",
                )
                .to(
                    wheelScaler.value,
                    {
                        scale: activeScale,
                        duration: firstArcDuration,
                        ease: reduceMotion ? "none" : "power3.inOut",
                    },
                    "solution1Transition",
                )
                .to(
                    wheelRotor.value,
                    {
                        rotation: ROTATION_STOPS.solution1,
                        duration: firstArcDuration,
                        ease: reduceMotion ? "none" : "power3.inOut",
                    },
                    "solution1Transition",
                );

            addArcMotion(
                master,
                markerElements[0]!,
                firstArc,
                firstArcDuration,
                "solution1Transition",
            );
            master.to(
                markerVisuals[0]![1]!,
                {
                    scale: firstTarget.precursorScale,
                    duration: firstArcDuration,
                    ease: "power2.inOut",
                },
                "solution1Transition",
            );

            master
                .to(
                    markerElements[0],
                    {
                        rotation: firstTarget.rotation,
                        duration: labelRevealDuration,
                        ease: "power2.out",
                    },
                    `solution1Transition+=${firstArcDuration}`,
                )
                .to(scene.value, { duration: labelHoldDuration })
                .addLabel("solution1Handoff");

            if (!reduceMotion) {
                addChildTimeline(
                    master,
                    binderAnim.value?.buildTimeline(transporterElements[0]!),
                    "solution1Handoff",
                );
            }

            master
                .set(markerVisuals[0]!, { autoAlpha: 0 }, "solution1Handoff")
                .to(
                    markerLabels[0],
                    {
                        autoAlpha: 0,
                        yPercent: TRANSITION_LAYOUT.labelExitYOffset,
                        duration: labelExitDuration,
                        ease: "power2.in",
                    },
                    "solution1Handoff",
                )
                .set(
                    markerElements[0],
                    { autoAlpha: 0 },
                    `solution1Handoff+=${labelExitDuration}`,
                )
                .to(
                    copyOne.value,
                    {
                        autoAlpha: 1,
                        yPercent: 0,
                        duration: 0.35,
                        ease: "power2.out",
                    },
                    "solution1Handoff",
                );

            master
                .addLabel(
                    homeChapterActivationLabel(HOME_CHAPTERS.precursorBinder),
                    "solution1Handoff",
                )
                .addLabel("solution1", "solution1Handoff+=0.35")
                .addLabel(HOME_CHAPTERS.precursorBinder, "solution1");

            if (reduceMotion) {
                master.to(scene.value, { duration: 0.8 }, "solution1");
            }

            master
                .addLabel("solution2Transition")
                .to(copyOne.value, {
                    autoAlpha: 0,
                    yPercent: SCENE_LAYOUT.copyExitYOffset,
                    duration: 0.3,
                    ease: "power2.in",
                })
                .addLabel("solution2Motion", ">-0.05")
                .to(
                    entryActors[0],
                    {
                        autoAlpha: 1,
                        duration: reduceMotion ? 0.001 : 0.08,
                    },
                    "solution2Motion",
                )
                .to(
                    wheelRotor.value,
                    {
                        rotation: ROTATION_STOPS.solution2,
                        duration: entryArcDuration,
                        ease: reduceMotion ? "none" : "power3.inOut",
                    },
                    "solution2Motion",
                );

            addArcMotion(
                master,
                entryActors[0]!,
                secondArc,
                entryArcDuration,
                "solution2Motion",
            );
            master.to(
                entryVisuals[0]![1]!,
                {
                    scale: secondTarget.precursorScale,
                    duration: entryArcDuration,
                    ease: "power2.inOut",
                },
                "solution2Motion",
            );

            master
                .to(
                    entryLabels[0],
                    {
                        autoAlpha: 1,
                        yPercent: 0,
                        duration: labelRevealDuration,
                        ease: "power2.out",
                    },
                    `solution2Motion+=${entryArcDuration}`,
                )
                .to(scene.value, { duration: labelHoldDuration })
                .addLabel("solution2Handoff");

            if (!reduceMotion) {
                addChildTimeline(
                    master,
                    transporterBinderAnim.value?.buildTimeline(
                        transporterElements[1]!,
                        attachedPlug.value,
                        transporterRefs.value[1]?.getTimeline(),
                    ),
                    "solution2Handoff",
                );
            }

            master
                .set(entryVisuals[0]!, { autoAlpha: 0 }, "solution2Handoff")
                .to(
                    entryLabels[0],
                    {
                        autoAlpha: 0,
                        yPercent: TRANSITION_LAYOUT.labelExitYOffset,
                        duration: labelExitDuration,
                        ease: "power2.in",
                    },
                    "solution2Handoff",
                )
                .set(
                    entryActors[0],
                    { autoAlpha: 0 },
                    `solution2Handoff+=${labelExitDuration}`,
                )
                .to(
                    copyTwo.value,
                    {
                        autoAlpha: 1,
                        yPercent: 0,
                        duration: 0.35,
                        ease: "power2.out",
                    },
                    "solution2Handoff",
                );

            master
                .addLabel(
                    homeChapterActivationLabel(HOME_CHAPTERS.transporterBinder),
                    "solution2Handoff",
                )
                .addLabel("solution2", "solution2Handoff+=0.35")
                .addLabel(HOME_CHAPTERS.transporterBinder, "solution2");

            if (reduceMotion) {
                master.to(scene.value, { duration: 0.8 }, "solution2");
            }

            master
                .addLabel("solution3Transition")
                .to(copyTwo.value, {
                    autoAlpha: 0,
                    yPercent: SCENE_LAYOUT.copyExitYOffset,
                    duration: 0.3,
                    ease: "power2.in",
                })
                .addLabel("solution3Motion", ">-0.05")
                .to(
                    entryActors[1],
                    {
                        autoAlpha: 1,
                        duration: reduceMotion ? 0.001 : 0.08,
                    },
                    "solution3Motion",
                )
                .to(
                    wheelRotor.value,
                    {
                        rotation: ROTATION_STOPS.solution3,
                        duration: entryArcDuration,
                        ease: reduceMotion ? "none" : "power3.inOut",
                    },
                    "solution3Motion",
                );

            addArcMotion(
                master,
                entryActors[1]!,
                thirdArc,
                entryArcDuration,
                "solution3Motion",
            );
            master.to(
                entryVisuals[1]![1]!,
                {
                    scale: thirdTarget.precursorScale,
                    duration: entryArcDuration,
                    ease: "power2.inOut",
                },
                "solution3Motion",
            );

            master
                .to(
                    entryLabels[1],
                    {
                        autoAlpha: 1,
                        yPercent: 0,
                        duration: labelRevealDuration,
                        ease: "power2.out",
                    },
                    `solution3Motion+=${entryArcDuration}`,
                )
                .to(scene.value, { duration: labelHoldDuration })
                .addLabel("solution3Handoff");

            if (!reduceMotion) {
                addChildTimeline(
                    master,
                    cgtaseAnim.value?.buildTimeline(
                        transporterElements[2]!,
                        transporterRefs.value[2]?.getTimeline(),
                    ),
                    "solution3Handoff",
                );
            }

            master
                .set(entryVisuals[1]!, { autoAlpha: 0 }, "solution3Handoff")
                .to(
                    entryLabels[1],
                    {
                        autoAlpha: 0,
                        yPercent: TRANSITION_LAYOUT.labelExitYOffset,
                        duration: labelExitDuration,
                        ease: "power2.in",
                    },
                    "solution3Handoff",
                )
                .set(
                    entryActors[1],
                    { autoAlpha: 0 },
                    `solution3Handoff+=${labelExitDuration}`,
                )
                .to(
                    copyThree.value,
                    {
                        autoAlpha: 1,
                        yPercent: 0,
                        duration: 0.35,
                        ease: "power2.out",
                    },
                    "solution3Handoff",
                )
                .addLabel(
                    homeChapterActivationLabel(HOME_CHAPTERS.cgtase),
                    "solution3Handoff",
                )
                .addLabel("solution3", "solution3Handoff+=0.35")
                .addLabel(HOME_CHAPTERS.cgtase, "solution3");

            master.to(scene.value, { duration: reduceMotion ? 0.8 : 0.7 });

            if (props.embedded) {
                emit("timelineReady", {
                    timeline: master,
                    scene: scene.value,
                });
            }

            return () => {
                if (storyTimeline === master) storyTimeline = undefined;
                master.scrollTrigger?.kill(true);
                master.kill();
            };
        },
        scene.value,
    );

    ScrollTrigger.refresh();
});

onUnmounted(() => {
    window.removeEventListener(HOME_SCROLL_REFRESH_END, refreshStoryGeometry);
    storyTimeline = undefined;
    matchMedia?.revert();
    ScrollTrigger.getById("solution-story")?.kill(true);
});
</script>

<template>
    <section
        id="solution"
        ref="scene"
        class="solution-scene relative h-svh min-h-screen overflow-hidden bg-[#07366f] text-white"
        :style="sceneCssVariables"
        aria-label="Expelliodor solutions"
    >
        <div class="solution-scene__glow absolute inset-0" aria-hidden="true" />

        <div
            ref="wheelAnchor"
            class="solution-wheel absolute top-0 left-0 z-5 aspect-square will-change-transform"
            :style="{ width: `${SCENE_LAYOUT.wheelSize}%` }"
            aria-hidden="true"
        >
            <div
                ref="wheelScaler"
                class="absolute inset-0 will-change-transform"
            >
                <div
                    ref="wheelRotor"
                    class="absolute inset-0 will-change-transform"
                >
                    <img
                        class="pointer-events-none absolute inset-0 block size-full object-contain select-none"
                        src="https://static.igem.wiki/teams/6133/wiki/homepage/ringmem.avif"
                        alt=""
                        loading="eager"
                        fetchpriority="high"
                        decoding="async"
                        draggable="false"
                    />

                    <div
                        v-for="(angle, index) in TRANSPORTER_ANGLES"
                        :key="angle"
                        class="solution-wheel__transporter absolute aspect-[964/847] will-change-transform"
                        :style="transporterStyle(angle)"
                    >
                        <TransporterAnim
                            :ref="
                                (instance) => setTransporterRef(index, instance)
                            "
                            :left-src="ASSETS.transporterLeft"
                            :middle-src="ASSETS.transporterMiddle"
                            :right-src="ASSETS.transporterRight"
                            :open-angle="-10"
                            :closed-angle="10"
                            :autoplay="false"
                        />
                        <span
                            v-if="index === 1"
                            :ref="setAttachedPlugRef"
                            class="pointer-events-none invisible absolute z-5 block aspect-[645/723] opacity-0 will-change-[transform,opacity]"
                            :style="{
                                left: `${SCENE_LAYOUT.attachedPlug.x}%`,
                                top: `${SCENE_LAYOUT.attachedPlug.y}%`,
                                width: `${SCENE_LAYOUT.attachedPlug.width}%`,
                            }"
                        >
                            <img
                                class="block size-full object-contain select-none"
                                src="https://static.igem.wiki/teams/6133/wiki/homepage/plugoutlined.avif"
                                alt=""
                                loading="eager"
                                fetchpriority="high"
                                decoding="async"
                                draggable="false"
                            />
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div
            class="pointer-events-none absolute inset-0 z-[15]"
            aria-hidden="true"
        >
            <div
                v-for="(solution, index) in SOLUTIONS"
                :key="solution.id"
                class="solution-marker invisible absolute grid grid-cols-[1.45fr_0.72fr] items-center gap-[3%] opacity-0 will-change-[top,left,width,transform,opacity]"
            >
                <div class="solution-actor__visual grid place-items-center">
                    <img
                        class="block h-auto max-h-full object-contain select-none"
                        :class="{ 'scale-x-[-1]': solution.flip }"
                        :style="{ width: `${solution.iconWidth}%` }"
                        :src="solution.image"
                        alt=""
                        loading="lazy"
                        fetchpriority="low"
                        decoding="async"
                        draggable="false"
                    />
                </div>
                <div class="solution-actor__visual aspect-square">
                    <PrecursorSprite
                        class="w-full"
                        :class="{
                            'scale-x-[-1]':
                                TRANSITION_LAYOUT.targets[index].precursorFlip,
                        }"
                        alt=""
                    />
                </div>
                <p
                    class="solution-marker__label pointer-events-none absolute top-[104%] left-1/2 m-0 -translate-x-1/2 text-center text-[clamp(0.72rem,1.7vw,1.65rem)] leading-none font-extrabold whitespace-nowrap text-white [text-shadow:0_2px_5px_rgb(2_30_71_/_85%)]"
                    :style="{ color: solution.color }"
                >
                    {{ solution.title }}
                </p>
            </div>

            <div
                v-for="(solution, index) in SOLUTIONS.slice(1)"
                :key="`${solution.id}-entry`"
                class="solution-entry-actor invisible absolute grid grid-cols-[1.45fr_0.72fr] items-center gap-[3%] opacity-0 will-change-[top,left,width,transform,opacity]"
            >
                <div class="solution-actor__visual grid place-items-center">
                    <img
                        class="block h-auto max-h-full object-contain select-none"
                        :class="{ 'scale-x-[-1]': solution.flip }"
                        :style="{ width: `${solution.iconWidth}%` }"
                        :src="solution.image"
                        alt=""
                        loading="lazy"
                        fetchpriority="low"
                        decoding="async"
                        draggable="false"
                    />
                </div>
                <div class="solution-actor__visual aspect-square">
                    <PrecursorSprite
                        class="w-full"
                        :class="{
                            'scale-x-[-1]':
                                TRANSITION_LAYOUT.targets[index + 1]
                                    .precursorFlip,
                        }"
                        alt=""
                    />
                </div>
                <p
                    class="solution-entry-actor__label pointer-events-none absolute top-[104%] left-1/2 m-0 -translate-x-1/2 text-center text-[clamp(0.72rem,1.7vw,1.65rem)] leading-none font-extrabold whitespace-nowrap text-white [text-shadow:0_2px_5px_rgb(2_30_71_/_85%)]"
                    :style="{ color: solution.color }"
                >
                    {{ solution.title }}
                </p>
            </div>
        </div>

        <div class="solution-copy absolute z-30 max-w-[62rem]">
            <article
                v-for="(solution, index) in SOLUTIONS"
                :key="solution.id"
                :ref="(element) => setCopyRef(index, element)"
                class="solution-copy__panel invisible absolute top-0 left-0 w-full opacity-0 will-change-[transform,opacity]"
            >
                <h2
                    class="m-0 text-[clamp(2rem,4vw,4.8rem)] leading-none font-extrabold tracking-[-0.02em]"
                    :style="{ color: solution.color }"
                >
                    {{ solution.title }}
                </h2>
                <p
                    class="mt-[5%] mb-0 max-w-[32ch] text-[clamp(1.15rem,2.3vw,2.75rem)] leading-[1.45] font-semibold text-[#f8fbff]"
                    v-html="solution.description"
                ></p>
            </article>
        </div>

        <BinderAnim
            ref="binderAnim"
            :handoff="{
                ...TRANSITION_LAYOUT.targets[0],
                iconWidth: SOLUTIONS[0].iconWidth,
                flip: SOLUTIONS[0].flip,
            }"
        />
        <TransporterBinderAnim
            ref="transporterBinderAnim"
            :handoff="{
                ...TRANSITION_LAYOUT.targets[1],
                iconWidth: SOLUTIONS[1].iconWidth,
                flip: SOLUTIONS[1].flip,
            }"
        />
        <CGTaseAnim
            ref="cgtaseAnim"
            :handoff="{
                ...TRANSITION_LAYOUT.targets[2],
                iconWidth: SOLUTIONS[2].iconWidth,
                flip: SOLUTIONS[2].flip,
            }"
        />

        <p class="sr-only">
            Three approaches prevent the odor precursor from entering the
            bacterial transporter: capturing it with a precursor binder,
            blocking PepTsh with a transporter binder, or modifying the
            precursor with CGTase.
        </p>
    </section>
</template>

<style scoped>
.solution-scene__glow {
    background:
        radial-gradient(
            circle at 75% 24%,
            rgb(48 116 190 / 34%),
            transparent 28%
        ),
        linear-gradient(180deg, #07366f 0%, #06326b 100%);
}

.solution-wheel__ring {
    border: clamp(0.55rem, 1.1vw, 1.25rem) solid rgb(48 125 193 / 76%);
    background:
        radial-gradient(
            circle,
            transparent 0 55%,
            rgb(24 96 164 / 88%) 55.5% 66%,
            transparent 66.5%
        ),
        conic-gradient(
            from -30deg,
            rgb(80 191 218 / 42%),
            rgb(27 99 170 / 16%) 30%,
            rgb(80 191 218 / 42%) 60%,
            rgb(27 99 170 / 16%) 88%,
            rgb(80 191 218 / 42%)
        );
    box-shadow:
        inset 0 0 0 clamp(0.25rem, 0.5vw, 0.65rem) rgb(4 45 99 / 68%),
        0 0 2.2rem rgb(69 184 220 / 24%);
}

.solution-copy {
    top: var(--copy-top);
    left: var(--copy-left);
    width: var(--copy-width);
}

@media (orientation: portrait) {
    .solution-wheel {
        width: var(--portrait-wheel-size) !important;
    }

    .solution-copy {
        top: var(--portrait-copy-top);
        left: var(--portrait-copy-left);
        width: var(--portrait-copy-width);
    }

    .solution-copy__panel h2 {
        font-size: clamp(1.7rem, 8vw, 3.2rem);
    }

    .solution-copy__panel p {
        margin-top: 4%;
        max-width: 30ch;
        font-size: clamp(0.95rem, 4.2vw, 1.35rem);
        line-height: 1.35;
    }

    .solution-marker p,
    .solution-entry-actor p {
        font-size: clamp(0.58rem, 2.6vw, 1rem);
    }
}
</style>
