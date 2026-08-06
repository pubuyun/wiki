<script setup lang="ts">
import { gsap } from "gsap";
import { onMounted, onUnmounted, ref } from "vue";

const props = withDefaults(
    defineProps<{
        leftSrc: string;
        middleSrc: string;
        rightSrc: string;
        openAngle: number;
        closedAngle: number;
        autoplay?: boolean;
    }>(),
    {
        autoplay: true,
    },
);

const root = ref<HTMLElement | null>(null);
const leftShell = ref<HTMLImageElement | null>(null);
const rightShell = ref<HTMLImageElement | null>(null);

let context: gsap.Context | undefined;
let timeline: gsap.core.Timeline | undefined;
let controller: gsap.core.Tween | undefined;

function stopController() {
    controller?.kill();
    controller = undefined;
}

function open() {
    stopController();
    controller = timeline?.tweenTo("open", {
        duration: 0.8,
        ease: "power2.inOut",
    });
}

function close() {
    stopController();
    controller = timeline?.tweenTo("closed", {
        duration: 0.8,
        ease: "power2.inOut",
    });
}

function playLoop() {
    if (!timeline) return;

    stopController();
    timeline.progress(0).pause();
    controller = gsap.to(timeline, {
        progress: 1,
        duration: 1.2,
        ease: "power2.inOut",
        repeat: -1,
        repeatDelay: 0.35,
        yoyo: true,
    });
}

function getTimeline() {
    return timeline;
}

onMounted(() => {
    if (!root.value || !leftShell.value || !rightShell.value) return;

    context = gsap.context(() => {
        timeline = gsap
            .timeline({ paused: true })
            .addLabel("closed", 0)
            .fromTo(
                leftShell.value,
                { rotation: props.closedAngle },
                { rotation: props.openAngle, duration: 1, ease: "none" },
                "closed",
            )
            .fromTo(
                rightShell.value,
                { rotation: -props.closedAngle },
                { rotation: -props.openAngle, duration: 1, ease: "none" },
                "closed",
            )
            .addLabel("open");

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            timeline.progress(1);
        } else if (props.autoplay) {
            playLoop();
        }
    }, root.value);
});

onUnmounted(() => {
    stopController();
    context?.revert();
});

defineExpose({ close, getTimeline, open, playLoop });
</script>

<template>
    <div
        ref="root"
        class="transporter-anim"
        role="img"
        aria-label="Transporter opening and closing"
    >
        <img
            class="transporter-anim__layer transporter-anim__middle"
            :src="middleSrc"
            alt=""
            loading="lazy"
            fetchpriority="low"
            decoding="async"
            draggable="false"
        />
        <img
            ref="leftShell"
            class="transporter-anim__layer transporter-anim__shell transporter-anim__shell--left"
            :src="leftSrc"
            alt=""
            loading="lazy"
            fetchpriority="low"
            decoding="async"
            draggable="false"
        />
        <img
            ref="rightShell"
            class="transporter-anim__layer transporter-anim__shell transporter-anim__shell--right"
            :src="rightSrc"
            alt=""
            loading="lazy"
            fetchpriority="low"
            decoding="async"
            draggable="false"
        />
    </div>
</template>

<style scoped>
.transporter-anim {
    position: relative;
    width: min(100%, 60.25rem);
    aspect-ratio: 964 / 847;
    isolation: isolate;
}

.transporter-anim__layer {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    user-select: none;
}

.transporter-anim__middle {
    z-index: 1;
}

.transporter-anim__shell {
    z-index: 2;
    will-change: transform;
}

.transporter-anim__shell--left {
    transform-origin: 40% 50%;
}

.transporter-anim__shell--right {
    transform-origin: 60% 50%;
}
</style>
