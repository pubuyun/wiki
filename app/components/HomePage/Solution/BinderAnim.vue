<script setup lang="ts">
import { gsap } from "gsap";
import { onUnmounted, ref } from "vue";

import PrecursorSprite from "./PrecursorSprite.vue";

type PercentPoint = { x: number; y: number };
type HandoffLayout = {
    point: PercentPoint;
    width: number;
    scale: number;
    rotation: number;
    precursorScale: number;
    iconWidth: number;
    flip?: boolean;
};

const props = defineProps<{ handoff: HandoffLayout }>();

const LAYOUT = {
    precursorBoundOffset: { x: -55, y: -2 } satisfies PercentPoint,
    collisionOffset: { x: 7, y: -12 } satisfies PercentPoint,
    collisionCompressionOffset: { x: 2, y: 0 } satisfies PercentPoint,
    reboundDestination: { x: 53, y: -24 } satisfies PercentPoint,
} as const;

const root = ref<HTMLElement | null>(null);
const collisionGroup = ref<HTMLElement | null>(null);
const binder = ref<HTMLImageElement | null>(null);
const precursor = ref<HTMLElement | null>(null);

let context: gsap.Context | undefined;
let timeline: gsap.core.Timeline | undefined;

function deltaTo(target: HTMLElement, actor: HTMLElement) {
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

function buildTimeline(target: HTMLElement) {
    if (
        !root.value ||
        !collisionGroup.value ||
        !binder.value ||
        !precursor.value
    ) {
        return undefined;
    }

    context?.revert();
    context = gsap.context(() => {
        gsap.set(root.value, { autoAlpha: 0 });
        gsap.set(collisionGroup.value, {
            x: 0,
            y: 0,
            rotation: props.handoff.rotation,
            scale: props.handoff.scale,
            transformOrigin: "50% 50%",
        });
        gsap.set(binder.value, {
            scale: 1,
            rotation: 0,
            transformOrigin: "50% 50%",
        });
        gsap.set(precursor.value, {
            x: 0,
            y: 0,
            scale: props.handoff.precursorScale,
            rotation: 0,
            transformOrigin: "50% 50%",
        });

        timeline = gsap.timeline({
            paused: true,
            defaults: { ease: "power2.inOut" },
        });

        timeline
            .addLabel("enter")
            .set(root.value, { autoAlpha: 1 })
            .addLabel("capture")
            .to(
                precursor.value,
                {
                    x: () =>
                        collisionGroup.value!.clientWidth *
                        (LAYOUT.precursorBoundOffset.x / 100),
                    y: () =>
                        collisionGroup.value!.clientHeight *
                        (LAYOUT.precursorBoundOffset.y / 100),
                    rotation: -7,
                    duration: 0.9,
                },
                "capture",
            )
            .to(
                binder.value,
                { scale: 0.9, rotation: 2, duration: 0.26 },
                ">-0.08",
            )
            .to(binder.value, {
                scale: 1,
                rotation: -1,
                duration: 0.34,
                ease: "back.out(1.8)",
            })
            .addLabel("bound")
            .to(collisionGroup.value, {
                x: () =>
                    deltaTo(target, collisionGroup.value!).x +
                    root.value!.clientWidth * (LAYOUT.collisionOffset.x / 100),
                y: () =>
                    deltaTo(target, collisionGroup.value!).y +
                    root.value!.clientHeight * (LAYOUT.collisionOffset.y / 100),
                rotation: 13,
                scale: 0.78,
                duration: 1,
                ease: "power3.in",
            })
            .to(collisionGroup.value, {
                x: () =>
                    Number(gsap.getProperty(collisionGroup.value!, "x")) +
                    root.value!.clientWidth *
                        (LAYOUT.collisionCompressionOffset.x / 100),
                y: () =>
                    Number(gsap.getProperty(collisionGroup.value!, "y")) +
                    root.value!.clientHeight *
                        (LAYOUT.collisionCompressionOffset.y / 100),
                scaleX: 0.68,
                scaleY: 0.9,
                duration: 0.14,
                ease: "power2.out",
            })
            .to(collisionGroup.value, {
                x: () =>
                    Number(gsap.getProperty(collisionGroup.value!, "x")) +
                    root.value!.clientWidth *
                        (LAYOUT.reboundDestination.x / 100),
                y: () =>
                    Number(gsap.getProperty(collisionGroup.value!, "y")) +
                    root.value!.clientHeight *
                        (LAYOUT.reboundDestination.y / 100),
                rotation: 78,
                scaleX: 0.9,
                scaleY: 0.9,
                duration: 0.82,
                ease: "power3.out",
            })
            .to(root.value, { autoAlpha: 0, duration: 0.18 }, ">-0.18");
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
                ref="collisionGroup"
                class="grid w-full grid-cols-[1.45fr_0.72fr] items-center gap-[3%] will-change-transform"
            >
                <div class="grid place-items-center">
                    <img
                        ref="binder"
                        class="block h-auto max-h-full object-contain will-change-transform select-none"
                        :style="{ width: `${props.handoff.iconWidth}%` }"
                        src="/bindernoeyes.png"
                        alt=""
                        loading="lazy"
                        fetchpriority="low"
                        decoding="async"
                        draggable="false"
                    />
                </div>
                <div ref="precursor" class="will-change-transform">
                    <PrecursorSprite class="w-full" alt="" />
                </div>
            </div>
        </div>
    </div>
</template>
