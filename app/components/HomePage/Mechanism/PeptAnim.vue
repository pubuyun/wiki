<script setup lang="ts">
import { gsap } from "gsap";
import { onMounted, onUnmounted, ref } from "vue";

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
                { rotation: 10 },
                { rotation: -10, duration: 1, ease: "none" },
                "closed",
            )
            .fromTo(
                rightShell.value,
                { rotation: -10 },
                { rotation: 10, duration: 1, ease: "none" },
                "closed",
            )
            .addLabel("open");

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            timeline.progress(1);
        } else {
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
        class="pept-anim"
        role="img"
        aria-label="Peptide transporter opening and closing"
    >
        <img
            class="pept-anim__layer pept-anim__middle"
            src="https://static.igem.wiki/teams/6133/wiki/homepage/peptshm.avif"
            alt=""
            draggable="false"
        />
        <img
            ref="leftShell"
            class="pept-anim__layer pept-anim__shell pept-anim__shell--left"
            src="https://static.igem.wiki/teams/6133/wiki/homepage/peptshl.avif"
            alt=""
            draggable="false"
        />
        <img
            ref="rightShell"
            class="pept-anim__layer pept-anim__shell pept-anim__shell--right"
            src="https://static.igem.wiki/teams/6133/wiki/homepage/peptshr.avif"
            alt=""
            draggable="false"
        />
    </div>
</template>

<style scoped>
.pept-anim {
    position: relative;
    width: min(100%, 60.25rem);
    aspect-ratio: 964 / 847;
    isolation: isolate;
}

.pept-anim__layer {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    user-select: none;
}

.pept-anim__middle {
    z-index: 1;
}

.pept-anim__shell {
    z-index: 2;
    will-change: transform;
}

.pept-anim__shell--left {
    transform-origin: 40% 50%;
}

.pept-anim__shell--right {
    transform-origin: 60% 50%;
}
</style>
