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
        class="transporter-anim relative isolate aspect-[964/847] w-[min(100%,60.25rem)]"
        role="img"
        aria-label="Transporter opening and closing"
    >
        <img
            class="transporter-anim__layer transporter-anim__middle absolute inset-0 z-1 block size-full object-contain select-none"
            :src="middleSrc"
            alt=""
            loading="lazy"
            fetchpriority="low"
            decoding="async"
            draggable="false"
        />
        <img
            ref="leftShell"
            class="transporter-anim__layer transporter-anim__shell transporter-anim__shell--left absolute inset-0 z-2 block size-full origin-[40%_50%] object-contain will-change-transform select-none"
            :src="leftSrc"
            alt=""
            loading="lazy"
            fetchpriority="low"
            decoding="async"
            draggable="false"
        />
        <img
            ref="rightShell"
            class="transporter-anim__layer transporter-anim__shell transporter-anim__shell--right absolute inset-0 z-2 block size-full origin-[60%_50%] object-contain will-change-transform select-none"
            :src="rightSrc"
            alt=""
            loading="lazy"
            fetchpriority="low"
            decoding="async"
            draggable="false"
        />
    </div>
</template>
