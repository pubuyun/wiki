<script setup lang="ts">
import { gsap } from "gsap";
import { onUnmounted, ref } from "vue";

import PrecursorSprite from "./PrecursorSprite.vue";

type PercentPoint = { x: number; y: number };
type SugarPose = PercentPoint & { rotation: number };
type HandoffLayout = {
    point: PercentPoint;
    width: number;
    scale: number;
    rotation: number;
    precursorScale: number;
    precursorFlip: boolean;
    iconWidth: number;
    flip?: boolean;
};

const props = defineProps<{ handoff: HandoffLayout }>();

const LAYOUT = {
    chain: { x: 67, y: 20 } satisfies PercentPoint,
    chainSize: 12,
    chainStartScale: 1.18,
    chainCurvedScale: 0.82,
    precursorReaction: { x: 78, y: 29 } satisfies PercentPoint,
    attachedGroupSlot: { x: 2, y: 82 } satisfies PercentPoint,
    remainingFlight: { x: 0, y: 0 } satisfies PercentPoint,
    collisionOffset: { x: 6, y: -6 } satisfies PercentPoint,
    collisionCompression: { x: 2, y: 0 } satisfies PercentPoint,
    collisionRecoil: { x: 42, y: -30 } satisfies PercentPoint,
} as const;

const TIMING = {
    chainRevealDelay: 0.2,
    shrinkAndBend: 0.72,
    precursorApproach: 0.72,
    enzymePulse: 0.24,
    split: 0.58,
    attach: 0.18,
    release: 0.72,
    transporterOpen: 0.42,
    collision: 0.88,
    compression: 0.15,
    recoil: 0.45,
} as const;

const STRAIGHT_CHAIN: readonly SugarPose[] = [
    { x: 10, y: 10, rotation: 0 },
    { x: 10, y: 20, rotation: 0 },
    { x: 10, y: 30, rotation: 0 },
    { x: 10, y: 40, rotation: 0 },
    { x: 10, y: 50, rotation: 0 },
    { x: 10, y: 60, rotation: 0 },
    { x: 10, y: 70, rotation: 0 },
    { x: 10, y: 80, rotation: 0 },
] as const;

const CURVED_CHAIN: readonly SugarPose[] = [
    { x: 47, y: 9, rotation: -22 },
    { x: 37, y: 17, rotation: -34 },
    { x: 30, y: 28, rotation: -44 },
    { x: 27, y: 41, rotation: -54 },
    { x: 30, y: 55, rotation: -64 },
    { x: 39, y: 68, rotation: -74 },
    { x: 52, y: 78, rotation: -84 },
    { x: 68, y: 83, rotation: -90 },
] as const;

const RELEASE_CHAIN: readonly SugarPose[] = [
    { x: 45, y: 25, rotation: 0 },
    { x: 45 + 11, y: 25 - 3, rotation: 0 },
    { x: 45 + 22, y: 25 - 6, rotation: 0 },
    { x: 45 + 33, y: 25 - 9, rotation: 0 },
    { x: 45 + 44, y: 25 - 12, rotation: 0 },
] as const;

const TRANSFER_CHAIN: readonly SugarPose[] = [
    { x: 52, y: 60, rotation: 0 },
    { x: 52 - 11, y: 60 + 3, rotation: 0 },
    { x: 52 - 22, y: 60 + 6, rotation: 0 },
] as const;

const PATHS = {
    straight: "M10 10 L10 80",
    curvedFirst: "M47 9 C29 18 20 42 30 55",
    middleBond: "M30 55 C33 61 35 65 39 68",
    curvedLast: "M39 68 C49 77 56 80 68 83",
    release: "M41 25 93 11",
    transfer: "M70 53 27 66",
} as const;

const HEXAGON_POINTS = "0,-5 4.4,-2.5 4.4,2.5 0,5 -4.4,2.5 -4.4,-2.5";

const root = ref<HTMLElement | null>(null);
const handoffGroup = ref<HTMLElement | null>(null);
const productGroup = ref<HTMLElement | null>(null);
const precursorHandoff = ref<HTMLElement | null>(null);
const enzyme = ref<HTMLElement | null>(null);
const chain = ref<SVGSVGElement | null>(null);
const productSugarLayer = ref<SVGSVGElement | null>(null);
const firstFiveGroup = ref<SVGGElement | null>(null);
const lastThreeGroup = ref<SVGGElement | null>(null);
const straightPath = ref<SVGPathElement | null>(null);
const curvedFirstPath = ref<SVGPathElement | null>(null);
const middleBondPath = ref<SVGPathElement | null>(null);
const curvedLastPath = ref<SVGPathElement | null>(null);
const releasePath = ref<SVGPathElement | null>(null);
const transferPath = ref<SVGPathElement | null>(null);
const sugarNodes = ref<SVGGElement[]>([]);
const modifiedPrecursor = ref<HTMLElement | null>(null);

let context: gsap.Context | undefined;
let timeline: gsap.core.Timeline | undefined;

function setSugarRef(element: unknown, index: number) {
    sugarNodes.value[index] = element as SVGGElement;
}

function deltaTo(target: Element, actor: Element) {
    const targetRect = target.getBoundingClientRect();
    const actorRect = actor.getBoundingClientRect();

    return {
        x:
            targetRect.left +
            targetRect.width / 2 -
            (actorRect.left + actorRect.width / 2),
        y:
            targetRect.top +
            targetRect.height / 2 -
            (actorRect.top + actorRect.height / 2),
    };
}

function deltaToPrecursorSlot(actor: Element, slot: PercentPoint) {
    const precursorRect = modifiedPrecursor.value!.getBoundingClientRect();
    const actorRect = actor.getBoundingClientRect();
    const targetX = precursorRect.left + precursorRect.width * (slot.x / 100);
    const targetY = precursorRect.top + precursorRect.height * (slot.y / 100);

    return {
        x: targetX - (actorRect.left + actorRect.width / 2),
        y: targetY - (actorRect.top + actorRect.height / 2),
    };
}

function deltaToPoint(actor: Element, point: PercentPoint) {
    const rootRect = root.value!.getBoundingClientRect();
    const actorRect = actor.getBoundingClientRect();

    return {
        x:
            rootRect.left +
            rootRect.width * (point.x / 100) -
            (actorRect.left + actorRect.width / 2),
        y:
            rootRect.top +
            rootRect.height * (point.y / 100) -
            (actorRect.top + actorRect.height / 2),
    };
}

function poseVars(pose: SugarPose) {
    return {
        x: pose.x,
        y: pose.y,
        rotation: pose.rotation,
    };
}

function buildTimeline(
    target: HTMLElement,
    transporterTimeline?: gsap.core.Timeline,
) {
    if (
        !root.value ||
        !handoffGroup.value ||
        !productGroup.value ||
        !precursorHandoff.value ||
        !enzyme.value ||
        !chain.value ||
        !productSugarLayer.value ||
        !firstFiveGroup.value ||
        !lastThreeGroup.value ||
        !straightPath.value ||
        !curvedFirstPath.value ||
        !middleBondPath.value ||
        !curvedLastPath.value ||
        !releasePath.value ||
        !transferPath.value ||
        !modifiedPrecursor.value ||
        sugarNodes.value.length !== STRAIGHT_CHAIN.length
    ) {
        return undefined;
    }

    context?.revert();
    context = gsap.context(() => {
        const firstFiveSugars = sugarNodes.value.slice(0, 5);
        const lastThreeSugars = sugarNodes.value.slice(5);
        const getProductTravel = () =>
            deltaTo(target, modifiedPrecursor.value!);

        gsap.set(root.value, { autoAlpha: 0 });
        gsap.set(handoffGroup.value, {
            x: 0,
            y: 0,
            rotation: props.handoff.rotation,
            scale: props.handoff.scale,
            transformOrigin: "50% 50%",
        });
        gsap.set(precursorHandoff.value, {
            rotation: props.handoff.rotation,
            scale: props.handoff.scale,
            transformOrigin: "50% 50%",
        });
        gsap.set(productGroup.value, {
            x: 0,
            y: 0,
            transformOrigin: "50% 50%",
        });
        gsap.set(enzyme.value, {
            rotation: 0,
            scale: 1,
            transformOrigin: "50% 50%",
        });
        gsap.set([chain.value, productSugarLayer.value], {
            x: 0,
            y: 0,
            rotation: 0,
            scale: LAYOUT.chainStartScale,
            autoAlpha: 0,
            transformOrigin: "50% 50%",
        });
        gsap.set(straightPath.value, { autoAlpha: 1 });
        gsap.set([firstFiveGroup.value, lastThreeGroup.value], {
            x: 0,
            y: 0,
            autoAlpha: 1,
        });
        gsap.set(
            [
                curvedFirstPath.value,
                middleBondPath.value,
                curvedLastPath.value,
                releasePath.value,
                transferPath.value,
            ],
            { autoAlpha: 0 },
        );
        sugarNodes.value.forEach((sugar, index) => {
            gsap.set(sugar, {
                ...poseVars(STRAIGHT_CHAIN[index]!),
                autoAlpha: 1,
                scale: 1,
                transformOrigin: "50% 50%",
            });
        });
        gsap.set(modifiedPrecursor.value, {
            x: 0,
            y: 0,
            rotation: 0,
            scale: props.handoff.precursorScale,
            transformOrigin: "50% 50%",
        });
        transporterTimeline?.pause(0);

        timeline = gsap.timeline({
            paused: true,
            defaults: { ease: "power2.inOut" },
        });

        timeline
            .addLabel("enter")
            .set(root.value, { autoAlpha: 1 })
            .to(root.value, { duration: TIMING.chainRevealDelay })
            .set([chain.value, productSugarLayer.value], { autoAlpha: 1 })
            .addLabel("bend")
            .to([chain.value, productSugarLayer.value], {
                scale: LAYOUT.chainCurvedScale,
                duration: TIMING.shrinkAndBend,
                ease: "power3.inOut",
            });

        sugarNodes.value.forEach((sugar, index) => {
            timeline!.to(
                sugar,
                {
                    ...poseVars(CURVED_CHAIN[index]!),
                    duration: TIMING.shrinkAndBend,
                    ease: "power3.inOut",
                },
                "bend",
            );
        });

        timeline
            .to(
                straightPath.value,
                { autoAlpha: 0, duration: TIMING.shrinkAndBend * 0.45 },
                "bend",
            )
            .to(
                [
                    curvedFirstPath.value,
                    middleBondPath.value,
                    curvedLastPath.value,
                ],
                { autoAlpha: 1, duration: TIMING.shrinkAndBend * 0.55 },
                `bend+=${TIMING.shrinkAndBend * 0.35}`,
            )
            .addLabel("precursorApproach")
            .to(modifiedPrecursor.value, {
                x: () =>
                    deltaToPoint(
                        modifiedPrecursor.value!,
                        LAYOUT.precursorReaction,
                    ).x,
                y: () =>
                    deltaToPoint(
                        modifiedPrecursor.value!,
                        LAYOUT.precursorReaction,
                    ).y,
                rotation: -4,
                duration: TIMING.precursorApproach,
                ease: "power3.inOut",
            })
            .to(
                enzyme.value,
                {
                    rotation: -6,
                    scale: 1.04,
                    duration: TIMING.enzymePulse,
                    repeat: 1,
                    yoyo: true,
                },
                ">-0.18",
            )
            .addLabel("split")
            .to(
                middleBondPath.value,
                { autoAlpha: 0, duration: TIMING.attach },
                "split",
            )
            .to(
                curvedFirstPath.value,
                { autoAlpha: 0, duration: TIMING.attach },
                "split",
            )
            .to(
                releasePath.value,
                { autoAlpha: 1, duration: TIMING.attach },
                "split",
            )
            .to(
                curvedLastPath.value,
                { autoAlpha: 0, duration: TIMING.attach },
                "split",
            )
            .to(
                transferPath.value,
                { autoAlpha: 1, duration: TIMING.attach },
                "split",
            );

        firstFiveSugars.forEach((sugar, index) => {
            timeline!.to(
                sugar,
                {
                    ...poseVars(RELEASE_CHAIN[index]!),
                    duration: TIMING.split,
                    ease: "power3.inOut",
                },
                "split",
            );
        });

        lastThreeSugars.forEach((sugar, index) => {
            timeline!.to(
                sugar,
                {
                    ...poseVars(TRANSFER_CHAIN[index]!),
                    duration: TIMING.split,
                    ease: "power3.inOut",
                },
                "split",
            );
        });

        timeline
            .addLabel("segmentsMove")
            .to(
                firstFiveGroup.value,
                {
                    x: () =>
                        root.value!.clientWidth *
                        (LAYOUT.remainingFlight.x / 100),
                    y: () =>
                        root.value!.clientHeight *
                        (LAYOUT.remainingFlight.y / 100),
                    autoAlpha: 0,
                    duration: TIMING.release,
                    ease: "power3.in",
                },
                "segmentsMove",
            )
            .to(
                lastThreeGroup.value,
                {
                    x: () =>
                        deltaToPrecursorSlot(
                            lastThreeGroup.value!,
                            LAYOUT.attachedGroupSlot,
                        ).x,
                    y: () =>
                        deltaToPrecursorSlot(
                            lastThreeGroup.value!,
                            LAYOUT.attachedGroupSlot,
                        ).y,
                    duration: TIMING.release,
                    ease: "power3.inOut",
                },
                "segmentsMove",
            )
            .addLabel("transport");

        if (transporterTimeline) {
            timeline.to(
                transporterTimeline,
                {
                    progress: 1,
                    duration: TIMING.transporterOpen,
                    ease: "power2.inOut",
                },
                "transport",
            );
        }

        timeline
            .to(
                productGroup.value,
                {
                    x: () =>
                        getProductTravel().x +
                        root.value!.clientWidth *
                            (LAYOUT.collisionOffset.x / 100),
                    y: () =>
                        getProductTravel().y +
                        root.value!.clientHeight *
                            (LAYOUT.collisionOffset.y / 100),
                    duration: TIMING.collision,
                    ease: "power3.in",
                },
                "transport+=0.08",
            )
            .to(
                modifiedPrecursor.value,
                {
                    rotation: 14,
                    scale: 0.9,
                    duration: TIMING.collision,
                    ease: "power3.in",
                },
                "transport+=0.08",
            )
            .addLabel("compress")
            .to(
                productGroup.value,
                {
                    x: () =>
                        `+=${root.value!.clientWidth * (LAYOUT.collisionCompression.x / 100)}`,
                    y: () =>
                        `+=${root.value!.clientHeight * (LAYOUT.collisionCompression.y / 100)}`,
                    duration: TIMING.compression,
                    ease: "power2.out",
                },
                "compress",
            )
            .to(
                modifiedPrecursor.value,
                {
                    scaleX: 0.72,
                    scaleY: 1.1,
                    duration: TIMING.compression,
                    ease: "power2.out",
                },
                "compress",
            )
            .addLabel("recoil")
            .to(
                productGroup.value,
                {
                    x: () =>
                        `+=${root.value!.clientWidth * (LAYOUT.collisionRecoil.x / 100)}`,
                    y: () =>
                        `+=${root.value!.clientHeight * (LAYOUT.collisionRecoil.y / 100)}`,
                    duration: TIMING.recoil,
                    ease: "back.out(1.7)",
                },
                "recoil",
            )
            .to(
                modifiedPrecursor.value,
                {
                    scaleX: 1,
                    scaleY: 1,
                    rotation: -10,
                    duration: TIMING.recoil,
                    ease: "back.out(1.7)",
                },
                "recoil",
            );
    }, root.value);

    return timeline;
}

function getRoot() {
    return root.value;
}

onUnmounted(() => {
    context?.revert();
});

defineExpose({ buildTimeline, getRoot });
</script>

<template>
    <div
        ref="root"
        class="solution-animation pointer-events-none invisible absolute inset-0 z-20 opacity-0"
        aria-hidden="true"
    >
        <svg
            ref="chain"
            class="absolute overflow-visible will-change-[transform,opacity]"
            :style="{
                left: `${LAYOUT.chain.x}%`,
                top: `${LAYOUT.chain.y}%`,
                width: `${LAYOUT.chainSize}%`,
                transform: 'translate(-50%, -50%)',
            }"
            viewBox="0 0 100 100"
            aria-hidden="true"
        >
            <path
                ref="straightPath"
                :d="PATHS.straight"
                class="will-change-opacity"
                fill="none"
                stroke="#ffd86b"
                stroke-width="2.2"
                stroke-linecap="round"
            />
            <g ref="firstFiveGroup" class="will-change-[transform,opacity]">
                <path
                    ref="curvedFirstPath"
                    :d="PATHS.curvedFirst"
                    class="will-change-opacity invisible opacity-0"
                    fill="none"
                    stroke="#ffd86b"
                    stroke-width="2.2"
                    stroke-linecap="round"
                />
                <path
                    ref="releasePath"
                    :d="PATHS.release"
                    class="will-change-opacity invisible opacity-0"
                    fill="none"
                    stroke="#ffd86b"
                    stroke-width="2.2"
                    stroke-linecap="round"
                />
                <g
                    v-for="(sugar, index) in STRAIGHT_CHAIN.slice(0, 5)"
                    :key="index"
                    :ref="(element) => setSugarRef(element, index)"
                    class="will-change-transform"
                >
                    <polygon
                        :points="HEXAGON_POINTS"
                        fill="#ffcf58"
                        stroke="#fff1a6"
                        stroke-width="1.4"
                    />
                </g>
            </g>
            <path
                ref="middleBondPath"
                :d="PATHS.middleBond"
                class="will-change-opacity invisible opacity-0"
                fill="none"
                stroke="#ffd86b"
                stroke-width="2.2"
                stroke-linecap="round"
            />
        </svg>

        <div ref="productGroup" class="absolute inset-0 will-change-transform">
            <svg
                ref="productSugarLayer"
                class="absolute overflow-visible will-change-[transform,opacity]"
                :style="{
                    left: `${LAYOUT.chain.x}%`,
                    top: `${LAYOUT.chain.y}%`,
                    width: `${LAYOUT.chainSize}%`,
                    transform: 'translate(-50%, -50%)',
                }"
                viewBox="0 0 100 100"
                aria-hidden="true"
            >
                <g ref="lastThreeGroup" class="will-change-[transform,opacity]">
                    <path
                        ref="curvedLastPath"
                        :d="PATHS.curvedLast"
                        class="will-change-opacity invisible opacity-0"
                        fill="none"
                        stroke="#ffd86b"
                        stroke-width="2.2"
                        stroke-linecap="round"
                    />
                    <path
                        ref="transferPath"
                        :d="PATHS.transfer"
                        class="will-change-opacity invisible opacity-0"
                        fill="none"
                        stroke="#ffd86b"
                        stroke-width="2.2"
                        stroke-linecap="round"
                    />
                    <g
                        v-for="(sugar, index) in STRAIGHT_CHAIN.slice(5)"
                        :key="index + 5"
                        :ref="(element) => setSugarRef(element, index + 5)"
                        class="will-change-transform"
                    >
                        <polygon
                            :points="HEXAGON_POINTS"
                            fill="#ffcf58"
                            stroke="#fff1a6"
                            stroke-width="1.4"
                        />
                    </g>
                </g>
            </svg>

            <div
                class="absolute"
                :style="{
                    left: `${props.handoff.point.x}%`,
                    top: `${props.handoff.point.y}%`,
                    width: `${props.handoff.width}%`,
                    transform: 'translate(-50%, -50%)',
                }"
            >
                <div
                    ref="precursorHandoff"
                    class="grid w-full grid-cols-[1.45fr_0.72fr] items-center gap-[3%] will-change-transform"
                >
                    <div />
                    <div ref="modifiedPrecursor" class="will-change-transform">
                        <PrecursorSprite
                            class="w-full"
                            :class="{
                                'scale-x-[-1]': props.handoff.precursorFlip,
                            }"
                            alt=""
                        />
                    </div>
                </div>
            </div>
        </div>

        <div
            class="absolute"
            :style="{
                left: `${props.handoff.point.x}%`,
                top: `${props.handoff.point.y}%`,
                width: `${props.handoff.width}%`,
                transform: 'translate(-50%, -50%)',
            }"
        >
            <div
                ref="handoffGroup"
                class="grid w-full grid-cols-[1.45fr_0.72fr] items-center gap-[3%] will-change-transform"
            >
                <div
                    ref="enzyme"
                    class="grid place-items-center will-change-transform"
                >
                    <img
                        class="block h-auto max-h-full object-contain select-none"
                        :class="{ 'scale-x-[-1]': props.handoff.flip }"
                        :style="{ width: `${props.handoff.iconWidth}%` }"
                        src="https://static.igem.wiki/teams/6133/wiki/homepage/cgtasseoutlined.avif"
                        alt=""
                        loading="lazy"
                        fetchpriority="low"
                        decoding="async"
                        draggable="false"
                    />
                </div>
                <div />
            </div>
        </div>
    </div>
</template>
