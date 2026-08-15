<script setup lang="ts">
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { onUnmounted, ref } from "vue";

import PrecursorSprite from "./PrecursorSprite.vue";

gsap.registerPlugin(Flip);

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
type PlugFitVars = {
    x: number;
    y: number;
    rotation: number;
    skewX?: number;
    scaleX?: number;
    scaleY?: number;
};

const props = defineProps<{ handoff: HandoffLayout }>();

const LAYOUT = {
    collisionOffset: { x: 10, y: -24 } satisfies PercentPoint,
    collisionCompressionOffset: { x: 0, y: 0 } satisfies PercentPoint,
    reboundDestination: { x: 42, y: -30 } satisfies PercentPoint,
} as const;

const root = ref<HTMLElement | null>(null);
const handoffGroup = ref<HTMLElement | null>(null);
const plug = ref<HTMLImageElement | null>(null);
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

function buildTimeline(
    target: HTMLElement,
    attachedPlug: HTMLElement,
    transporterTimeline?: gsap.core.Timeline,
) {
    if (!root.value || !handoffGroup.value || !plug.value || !precursor.value)
        return undefined;

    context?.revert();
    context = gsap.context(() => {
        let plugFitCache: { signature: string; vars: PlugFitVars } | undefined;
        const getPlugFit = () => {
            const targetRect = attachedPlug.getBoundingClientRect();
            const source = plug.value!;
            const sourceParent = source.parentElement!;
            const sourceParentRect = sourceParent.getBoundingClientRect();
            const signature = [
                root.value!.clientWidth,
                root.value!.clientHeight,
                source.offsetLeft,
                source.offsetTop,
                source.offsetWidth,
                source.offsetHeight,
                sourceParentRect.left,
                sourceParentRect.top,
                targetRect.left,
                targetRect.top,
                targetRect.width,
                targetRect.height,
            ]
                .map((value) => value.toFixed(3))
                .join(":");

            if (plugFitCache?.signature === signature) {
                return plugFitCache.vars;
            }

            // Measure with an untransformed probe. During ScrollTrigger refresh
            // the real plug may be halfway through its tween, so using its
            // current bounding box would make the next fit depend on the old
            // viewport and progressively corrupt its starting size.
            const probe = source.cloneNode(false) as HTMLImageElement;
            Object.assign(probe.style, {
                position: "absolute",
                left: `${source.offsetLeft}px`,
                top: `${source.offsetTop}px`,
                width: `${source.offsetWidth}px`,
                height: `${source.offsetHeight}px`,
                maxHeight: "none",
                margin: "0",
                opacity: "0",
                visibility: "hidden",
                pointerEvents: "none",
                transform: "none",
            });
            sourceParent.appendChild(probe);

            let vars: PlugFitVars;
            try {
                vars = Flip.fit(probe, attachedPlug, {
                    absolute: true,
                    getVars: true,
                    scale: true,
                }) as PlugFitVars;
            } finally {
                probe.remove();
            }
            plugFitCache = { signature, vars };
            return vars;
        };

        gsap.set(root.value, { autoAlpha: 0 });
        gsap.set(handoffGroup.value, {
            x: 0,
            y: 0,
            rotation: props.handoff.rotation,
            scale: props.handoff.scale,
            transformOrigin: "50% 50%",
        });
        gsap.set(plug.value, {
            x: 0,
            y: 0,
            autoAlpha: 1,
            rotation: 0,
            scale: 1,
            transformOrigin: "50% 50%",
        });
        gsap.set(precursor.value, {
            x: 0,
            y: 0,
            rotation: 0,
            scale: props.handoff.precursorScale,
            transformOrigin: "50% 50%",
        });
        gsap.set(attachedPlug, {
            autoAlpha: 0,
            scale: 1,
            yPercent: 0,
            transformOrigin: "50% 65%",
        });
        transporterTimeline?.pause(0);

        timeline = gsap.timeline({
            paused: true,
            defaults: { ease: "power2.inOut" },
        });

        timeline
            .addLabel("enter")
            .set(root.value, { autoAlpha: 1 })
            .addLabel("plugApproach")
            .to(
                plug.value,
                {
                    x: () => getPlugFit().x,
                    y: () => getPlugFit().y,
                    rotation: () => getPlugFit().rotation,
                    skewX: () => getPlugFit().skewX ?? 0,
                    scaleX: () => getPlugFit().scaleX ?? 1,
                    scaleY: () => getPlugFit().scaleY ?? 1,
                    duration: 0.9,
                    ease: "power3.in",
                },
                "plugApproach",
            )
            .set(plug.value, { autoAlpha: 0 })
            .set(attachedPlug, { autoAlpha: 1 }, "<")
            .addLabel("blocked");

        if (transporterTimeline) {
            timeline
                .to(transporterTimeline, {
                    progress: 0.24,
                    duration: 0.22,
                    ease: "power2.out",
                })
                .to(transporterTimeline, {
                    progress: 0,
                    duration: 0.18,
                    ease: "power2.in",
                })
                .to(transporterTimeline, {
                    progress: 0.18,
                    duration: 0.18,
                    ease: "power2.out",
                })
                .to(transporterTimeline, {
                    progress: 0,
                    duration: 0.16,
                    ease: "power2.in",
                });
        }

        timeline
            .to(
                attachedPlug,
                {
                    rotation: "+=5",
                    scaleX: 0.9,
                    scaleY: 1.08,
                    duration: 0.14,
                    repeat: 3,
                    yoyo: true,
                    ease: "power1.inOut",
                },
                "blocked+=0.08",
            )
            .to(
                precursor.value,
                {
                    x: () =>
                        deltaTo(target, precursor.value!).x +
                        root.value!.clientWidth *
                            (LAYOUT.collisionOffset.x / 100),
                    y: () =>
                        deltaTo(target, precursor.value!).y +
                        root.value!.clientHeight *
                            (LAYOUT.collisionOffset.y / 100),
                    rotation: -8,
                    duration: 0.82,
                    ease: "power3.in",
                },
                ">-0.1",
            )
            .to(precursor.value, {
                x: () =>
                    `+=${root.value!.clientWidth * (LAYOUT.collisionCompressionOffset.x / 100)}`,
                y: () =>
                    `+=${root.value!.clientHeight * (LAYOUT.collisionCompressionOffset.y / 100)}`,
                scaleX: 0.68,
                scaleY: 1.08,
                duration: 0.13,
                ease: "power2.out",
            })
            .to(precursor.value, {
                x: () =>
                    `+=${root.value!.clientWidth * (LAYOUT.reboundDestination.x / 100)}`,
                y: () =>
                    `+=${root.value!.clientHeight * (LAYOUT.reboundDestination.y / 100)}`,
                scaleX: 1,
                scaleY: 1,
                rotation: 82,
                duration: 0.72,
                ease: "power3.out",
            })
            .to(root.value, { autoAlpha: 0, duration: 0.18 }, ">-0.15");
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
                ref="handoffGroup"
                class="grid w-full grid-cols-[1.45fr_0.72fr] items-center gap-[3%] will-change-transform"
            >
                <div class="relative grid place-items-center">
                    <img
                        ref="plug"
                        class="block aspect-[645/723] h-auto max-h-full object-contain will-change-[transform,opacity] select-none"
                        :style="{ width: `${props.handoff.iconWidth}%` }"
                        src="https://static.igem.wiki/teams/6133/wiki/homepage/plugoutlined.avif"
                        alt=""
                        loading="eager"
                        fetchpriority="high"
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
