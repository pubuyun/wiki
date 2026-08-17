<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onBeforeUnmount, onMounted, ref } from "vue";

import {
    HOME_CHAPTERS,
    homeChapterActivationLabel,
} from "~/utils/home-chapters";
import {
    HOME_SCROLL_LOCK_CHANGE,
    HOME_SCROLL_REFRESH_END,
    HOME_SCROLL_REFRESH_START,
    type HomeScrollLockChange,
} from "~/utils/home-scroll";

import CurrentSolution from "./CurrentSolution.vue";
import Mechanism from "./Mechanism.vue";
import SmokeTransition from "./Mechanism/SmokeTransition.vue";

gsap.registerPlugin(ScrollTrigger);

type MechanismPayload = {
    timeline: gsap.core.Timeline;
    scene: HTMLElement;
    molecule: HTMLElement;
    product: HTMLImageElement;
};

type CurrentSolutionPayload = {
    timeline: gsap.core.Timeline;
    scene: HTMLElement;
    showCurrentLimitsActiveFrame: () => void;
};

const SMOKE_TRANSITION_DURATION = 2.5;
const TRANSITION_SCROLL_KEYS = new Set([
    "ArrowDown",
    "ArrowUp",
    "End",
    "Home",
    "PageDown",
    "PageUp",
    " ",
]);

const sequence = ref<HTMLElement | null>(null);
const smokeLayer = ref<HTMLElement | null>(null);
const sweptMolecule = ref<HTMLImageElement | null>(null);

let mechanismPayload: MechanismPayload | undefined;
let currentSolutionPayload: CurrentSolutionPayload | undefined;
let master: gsap.core.Timeline | undefined;
let automaticSmoke: gsap.core.Timeline | undefined;
let buildFrame = 0;
let scrollLocked = false;
let lockedScrollY = 0;
let sweptMoleculeExitX = 0;
let settleAtCurrentLimitsPause = false;
let transitionRevealed = false;
let isLayoutRefreshing = false;
let resizeResumeFrame = 0;
let interruptedTransition:
    { progress: number; reversed: boolean; revealed: boolean } | undefined;

function handleMechanismReady(payload: MechanismPayload) {
    mechanismPayload = payload;
    scheduleBuild();
}

function handleCurrentSolutionReady(payload: CurrentSolutionPayload) {
    currentSolutionPayload = payload;
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

function preventTransitionScroll(event: Event) {
    event.preventDefault();
    event.stopImmediatePropagation();
}

function preventTransitionScrollKey(event: KeyboardEvent) {
    if (!TRANSITION_SCROLL_KEYS.has(event.key)) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("input, textarea, select, [contenteditable='true']")) {
        return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
}

function clampTransitionScroll() {
    if (scrollLocked && Math.abs(window.scrollY - lockedScrollY) > 1) {
        window.scrollTo(0, lockedScrollY);
    }
}

function dispatchScrollLockChange(detail: HomeScrollLockChange) {
    window.dispatchEvent(
        new CustomEvent<HomeScrollLockChange>(HOME_SCROLL_LOCK_CHANGE, {
            detail,
        }),
    );
}

function lockTransitionScroll(position: number, direction: "up" | "down") {
    lockedScrollY = position;
    if (scrollLocked) return;

    scrollLocked = true;
    dispatchScrollLockChange({ locked: true, direction });
    window.addEventListener("wheel", preventTransitionScroll, {
        passive: false,
        capture: true,
    });
    window.addEventListener("touchmove", preventTransitionScroll, {
        passive: false,
        capture: true,
    });
    window.addEventListener("keydown", preventTransitionScrollKey, true);
    window.addEventListener("scroll", clampTransitionScroll, {
        passive: true,
    });
}

function moveTransitionScroll(position: number) {
    lockedScrollY = position;
    window.scrollTo(0, position);
    ScrollTrigger.update();
}

function unlockTransitionScroll() {
    if (!scrollLocked) return;

    scrollLocked = false;
    dispatchScrollLockChange({ locked: false });
    window.removeEventListener("wheel", preventTransitionScroll, true);
    window.removeEventListener("touchmove", preventTransitionScroll, true);
    window.removeEventListener("keydown", preventTransitionScrollKey, true);
    window.removeEventListener("scroll", clampTransitionScroll);
}

function captureChapterNavigation(event: MouseEvent) {
    const button = (event.target as HTMLElement | null)?.closest("button");
    const navigation = button?.closest(
        'nav[aria-label="Homepage chapter navigation"]',
    );
    if (!button || !navigation) return;

    const buttons = Array.from(navigation.querySelectorAll("button"));
    if (button !== buttons.at(-1) || !master) return;

    const odorPause = master.labels[HOME_CHAPTERS.odorMolecule];
    const smokeThreshold = master.labels.smokeThreshold;
    const currentTime = master.time();
    if (
        typeof odorPause === "number" &&
        typeof smokeThreshold === "number" &&
        currentTime >= odorPause - 0.05 &&
        currentTime <= smokeThreshold + 0.05
    ) {
        settleAtCurrentLimitsPause = true;
    }
}

function prepareSweptMolecule(product: HTMLImageElement) {
    if (!sequence.value || !sweptMolecule.value) return;

    const sequenceRect = sequence.value.getBoundingClientRect();
    const productRect = product.getBoundingClientRect();
    const left = productRect.left - sequenceRect.left;

    sweptMoleculeExitX = -(left + productRect.width + 32);
    gsap.set(sweptMolecule.value, {
        autoAlpha: 0,
        left,
        top: productRect.top - sequenceRect.top,
        width: productRect.width,
        height: productRect.height,
        x: 0,
        y: 0,
        rotation: 0,
    });
}

function resetSmokeCloudsForViewport() {
    if (!smokeLayer.value) return;

    const smokeClouds = gsap.utils.toArray<SVGGElement>(
        "[data-mechanism-smoke-cloud]",
        smokeLayer.value,
    );
    gsap.set(smokeClouds, {
        x: window.innerWidth * 1.3,
        rotation: (index) => (index % 2 === 0 ? -5 : 5),
        transformOrigin: "50% 50%",
    });
}

function handleLayoutRefreshStart() {
    isLayoutRefreshing = true;
    cancelAnimationFrame(resizeResumeFrame);

    if (scrollLocked && automaticSmoke) {
        interruptedTransition = {
            progress: automaticSmoke.progress(),
            reversed: automaticSmoke.reversed(),
            revealed: transitionRevealed,
        };
        automaticSmoke.pause();
        unlockTransitionScroll();
    }
}

function handleLayoutRefreshEnd() {
    cancelAnimationFrame(resizeResumeFrame);
    resizeResumeFrame = requestAnimationFrame(() => {
        resizeResumeFrame = requestAnimationFrame(() => {
            const transition = interruptedTransition;
            interruptedTransition = undefined;

            if (
                transition &&
                automaticSmoke &&
                mechanismPayload &&
                currentSolutionPayload &&
                smokeLayer.value &&
                sweptMolecule.value
            ) {
                automaticSmoke.pause(0, true);
                gsap.set(mechanismPayload.scene, { autoAlpha: 1, zIndex: 2 });
                gsap.set(currentSolutionPayload.scene, {
                    autoAlpha: 0,
                    zIndex: 1,
                });
                gsap.set(mechanismPayload.molecule, { autoAlpha: 1 });
                gsap.set(smokeLayer.value, { autoAlpha: 0 });
                gsap.set(sweptMolecule.value, { autoAlpha: 0 });
                resetSmokeCloudsForViewport();
                prepareSweptMolecule(mechanismPayload.product);
                automaticSmoke
                    .invalidate()
                    .progress(transition.progress, true)
                    .pause();
                transitionRevealed = transition.revealed;
                lockTransitionScroll(
                    window.scrollY,
                    transition.reversed ? "up" : "down",
                );
                isLayoutRefreshing = false;
                if (transition.reversed) automaticSmoke.reverse();
                else automaticSmoke.play();
                return;
            }

            const threshold = master?.labels.smokeThreshold;
            transitionRevealed =
                typeof threshold === "number" &&
                (master?.time() ?? 0) >= threshold;
            isLayoutRefreshing = false;
        });
    });
}

function buildSequence() {
    if (
        !sequence.value ||
        !smokeLayer.value ||
        !sweptMolecule.value ||
        !mechanismPayload ||
        !currentSolutionPayload
    ) {
        return;
    }

    const mechanism = mechanismPayload;
    const currentSolution = currentSolutionPayload;
    const smokeClouds = gsap.utils.toArray<SVGGElement>(
        "[data-mechanism-smoke-cloud]",
        smokeLayer.value,
    );

    ScrollTrigger.getById("mechanism-story")?.kill(true);
    master?.kill();
    automaticSmoke?.kill();
    detachTimeline(mechanism.timeline);
    detachTimeline(currentSolution.timeline);

    gsap.set(mechanism.scene, { autoAlpha: 1, zIndex: 2 });
    gsap.set(currentSolution.scene, { autoAlpha: 0, zIndex: 1 });
    gsap.set(smokeLayer.value, { autoAlpha: 0 });
    gsap.set(sweptMolecule.value, { autoAlpha: 0 });
    gsap.set(smokeClouds, {
        x: () => window.innerWidth * 1.3,
        rotation: (index) => (index % 2 === 0 ? -5 : 5),
        transformOrigin: "50% 50%",
    });

    let timeline: gsap.core.Timeline;
    const moveToLabel = (label: string) => {
        const trigger = timeline.scrollTrigger;
        const labelTime = timeline.labels[label];
        if (!trigger || typeof labelTime !== "number") return;

        const progress = labelTime / Math.max(timeline.duration(), 0.001);
        moveTransitionScroll(
            trigger.start + progress * (trigger.end - trigger.start),
        );
        timeline.time(labelTime, true);
        if (label === homeChapterActivationLabel(HOME_CHAPTERS.currentLimits)) {
            currentSolution.showCurrentLimitsActiveFrame();
        }
    };

    const currentLimitsActiveLabel = homeChapterActivationLabel(
        HOME_CHAPTERS.currentLimits,
    );

    automaticSmoke = gsap
        .timeline({ defaults: { ease: "none" }, paused: true })
        .set(smokeLayer.value, { autoAlpha: 1 }, 0)
        .set(sweptMolecule.value, { autoAlpha: 1 }, 0)
        .set(mechanism.molecule, { autoAlpha: 0 }, 0)
        .to(
            sweptMolecule.value,
            {
                x: () => sweptMoleculeExitX,
                rotation: -18,
                duration: 1.14,
                ease: "power2.in",
            },
            0.08,
        )
        .to(
            smokeClouds,
            {
                x: 0,
                rotation: 0,
                duration: 0.92,
                stagger: { each: 0.025, from: "end" },
                ease: "power3.out",
            },
            0,
        )
        .set(currentSolution.scene, { autoAlpha: 1, zIndex: 2 }, 1.08)
        .set(mechanism.scene, { autoAlpha: 0, zIndex: 1 }, 1.08)
        .call(
            () => {
                moveToLabel(
                    automaticSmoke!.reversed()
                        ? HOME_CHAPTERS.odorMolecule
                        : currentLimitsActiveLabel,
                );
            },
            [],
            1.08,
        )
        .to(
            smokeClouds,
            {
                x: () => -window.innerWidth * 1.3,
                rotation: (index) => (index % 2 === 0 ? 6 : -6),
                duration: 0.88,
                stagger: { each: 0.025, from: "end" },
                ease: "power3.in",
            },
            1.34,
        )
        .to(smokeLayer.value, { autoAlpha: 0, duration: 0.05 }, ">");
    automaticSmoke.duration(SMOKE_TRANSITION_DURATION);
    automaticSmoke.eventCallback("onComplete", () => {
        moveToLabel(
            settleAtCurrentLimitsPause
                ? HOME_CHAPTERS.currentLimits
                : currentLimitsActiveLabel,
        );
        settleAtCurrentLimitsPause = false;
        unlockTransitionScroll();
    });
    automaticSmoke.eventCallback("onReverseComplete", () => {
        settleAtCurrentLimitsPause = false;
        moveToLabel(HOME_CHAPTERS.odorMolecule);
        unlockTransitionScroll();
    });

    transitionRevealed = false;
    timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
            id: "mechanism-story",
            trigger: sequence.value,
            start: "top top",
            end: () => `+=${window.innerHeight * 10}`,
            scrub: true,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                if (isLayoutRefreshing) return;

                const threshold = timeline.labels.smokeThreshold;
                const currentTime = timeline.time();
                const shouldReveal =
                    typeof threshold === "number" && currentTime >= threshold;

                if (shouldReveal !== transitionRevealed) {
                    transitionRevealed = shouldReveal;
                    lockTransitionScroll(
                        self.scroll(),
                        shouldReveal ? "down" : "up",
                    );
                    if (shouldReveal) {
                        prepareSweptMolecule(mechanism.product);
                        automaticSmoke?.invalidate().play();
                    } else {
                        automaticSmoke?.reverse();
                    }
                }
            },
        },
    });
    master = timeline;

    mechanism.timeline.paused(false);
    timeline.addLabel("mechanismStory", 0).add(mechanism.timeline, 0);
    promoteChapterLabels(timeline, mechanism.timeline, "mechanismStory");

    timeline
        .to(sequence.value, { duration: 0.18 })
        .addLabel("smokeThreshold")
        .to(sequence.value, { duration: 0.16 })
        .addLabel("currentSolutionStory")
        .to(sequence.value, { duration: 0.001 });

    currentSolution.timeline.paused(false);
    timeline
        .add(currentSolution.timeline, "currentSolutionStory")
        .to(sequence.value, { duration: 0.22 });

    promoteChapterLabels(
        timeline,
        currentSolution.timeline,
        "currentSolutionStory",
    );
    timeline.addLabel(
        homeChapterActivationLabel(HOME_CHAPTERS.currentLimits),
        timeline.labels.currentSolutionStory,
    );

    ScrollTrigger.refresh();
}

onMounted(() => {
    window.addEventListener("click", captureChapterNavigation, true);
    window.addEventListener(
        HOME_SCROLL_REFRESH_START,
        handleLayoutRefreshStart,
    );
    window.addEventListener(HOME_SCROLL_REFRESH_END, handleLayoutRefreshEnd);
});

onBeforeUnmount(() => {
    cancelAnimationFrame(buildFrame);
    cancelAnimationFrame(resizeResumeFrame);
    window.removeEventListener("click", captureChapterNavigation, true);
    window.removeEventListener(
        HOME_SCROLL_REFRESH_START,
        handleLayoutRefreshStart,
    );
    window.removeEventListener(HOME_SCROLL_REFRESH_END, handleLayoutRefreshEnd);
    unlockTransitionScroll();
    automaticSmoke?.kill();
    master?.scrollTrigger?.kill(true);
    master?.kill();
    ScrollTrigger.getById("mechanism-story")?.kill(true);
});
</script>

<template>
    <div
        ref="sequence"
        class="mechanism-current-solution relative h-svh min-h-screen overflow-hidden bg-[#073873]"
    >
        <CurrentSolution
            embedded
            @timeline-ready="handleCurrentSolutionReady"
        />
        <Mechanism embedded @timeline-ready="handleMechanismReady" />

        <div
            ref="smokeLayer"
            class="pointer-events-none absolute inset-0 z-20 overflow-hidden"
            aria-hidden="true"
        >
            <SmokeTransition />
        </div>

        <img
            ref="sweptMolecule"
            class="pointer-events-none invisible absolute z-30 block object-contain opacity-0 will-change-transform select-none"
            src="https://static.igem.wiki/teams/6133/wiki/homepage/3m3sh.avif"
            alt=""
            aria-hidden="true"
            draggable="false"
        />
    </div>
</template>

<style scoped>
.mechanism-current-solution {
    isolation: isolate;
}

.mechanism-current-solution :deep(.mechanism-scene),
.mechanism-current-solution :deep(.current-solution-scene) {
    position: absolute;
    inset: 0;
    width: 100%;
    min-height: 100%;
}
</style>
