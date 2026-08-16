<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
    computed,
    inject,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
} from "vue";

import SceneSequence from "./HomePage/SceneSequence.vue";
import {
    HOME_CHAPTER_LABELS,
    homeChapterActivationLabel,
    homeChapterTitle,
} from "~/utils/home-chapters";
import { HOME_SCROLL_CONTROLLER } from "~/utils/home-scroll-controller";

type SceneSequenceExpose = {
    ensureNextSceneLoaded: () => Promise<boolean>;
};

type ResolvedChapter = {
    index: number;
    label: string;
    position: number;
    activationPosition: number;
};

type ChapterDirection = -1 | 1;

// Chapter navigation tuning.
const CHAPTER_PROXIMITY_THRESHOLD_PX = 64;
const NEXT_SCROLL_DURATION_SECONDS = 1.1;
const PREVIOUS_SCROLL_DURATION_SECONDS = 1.1;
const SCROLL_KEYS = new Set([
    "ArrowDown",
    "ArrowUp",
    "End",
    "Home",
    "PageDown",
    "PageUp",
    " ",
]);

const lazyScenes = [
    {
        id: "smell",
        loader: () => import("./HomePage/Smell.vue"),
        minHeight: "100svh",
    },
    {
        id: "world-stat",
        loader: () => import("./HomePage/WorldStat.vue"),
        minHeight: "100svh",
    },
    {
        id: "abcc11",
        loader: () => import("./HomePage/ABCC11.vue"),
        minHeight: "100svh",
    },
    {
        id: "mechanism",
        loader: () => import("./HomePage/Mechanism.vue"),
        // The cross-scene precursor path needs Mechanism's anchor and
        // ScrollTrigger before ABCC11 reaches glandInside for the first time.
        loadImmediately: true,
    },
    {
        id: "current-solution",
        loader: () => import("./HomePage/CurrentSolution.vue"),
        minHeight: "100svh",
    },
    {
        id: "surgery",
        loader: () => import("./HomePage/Surgery.vue"),
        minHeight: "100svh",
    },
    {
        id: "product",
        loader: () => import("./HomePage/ProductSolution.vue"),
        minHeight: "100svh",
        // Product and Solution share one pinned master timeline so the bottle
        // paints the real Solution overview without a duplicate scene.
        loadImmediately: true,
    },
] as const;

const sceneSequence = ref<SceneSequenceExpose | null>(null);
const resolvedChapters = ref<ResolvedChapter[]>([]);
const currentChapterIndex = ref(0);
const previousChapterIndex = ref<number>();
const nextChapterIndex = ref<number>();
const isMoving = ref(false);
const scrollController = inject(HOME_SCROLL_CONTROLLER);

let scrollFrame = 0;
let moveToken = 0;

const chapterCount = HOME_CHAPTER_LABELS.length;
const chapterTitle = computed(() =>
    homeChapterTitle(HOME_CHAPTER_LABELS[currentChapterIndex.value]!),
);
const chapterNumber = computed(() =>
    String(currentChapterIndex.value + 1).padStart(2, "0"),
);
const totalChapters = String(chapterCount).padStart(2, "0");
const isNavigatorVisible = computed(() => resolvedChapters.value.length > 0);
const hasPreviousChapter = computed(
    () => previousChapterIndex.value !== undefined,
);
const hasNextChapter = computed(() => nextChapterIndex.value !== undefined);

const nextFrame = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

function resolveChapterPositions() {
    const triggers = ScrollTrigger.getAll();
    const staticChapterMarkers = Array.from(
        document.querySelectorAll<HTMLElement>("[data-home-chapter]"),
    );

    resolvedChapters.value = HOME_CHAPTER_LABELS.flatMap(
        (label, index): ResolvedChapter[] => {
            const activationLabel = homeChapterActivationLabel(label);
            const trigger = triggers.find((candidate) => {
                const timeline = candidate.animation as
                    gsap.core.Timeline | undefined;
                return typeof timeline?.labels?.[label] === "number";
            });

            if (trigger) {
                const activationTrigger = triggers.find((candidate) => {
                    const timeline = candidate.animation as
                        gsap.core.Timeline | undefined;
                    return (
                        typeof timeline?.labels?.[activationLabel] === "number"
                    );
                });

                return [
                    {
                        index,
                        label,
                        position: trigger.labelToScroll(label),
                        activationPosition: activationTrigger
                            ? activationTrigger.labelToScroll(activationLabel)
                            : trigger.labelToScroll(label),
                    },
                ];
            }

            const marker = staticChapterMarkers.find(
                (element) => element.dataset.homeChapter === label,
            );

            if (!marker) return [];

            return [
                {
                    index,
                    label,
                    position:
                        window.scrollY + marker.getBoundingClientRect().top,
                    activationPosition:
                        window.scrollY + marker.getBoundingClientRect().top,
                },
            ];
        },
    ).sort((first, second) => first.position - second.position);

    if (!isMoving.value) updateCurrentChapter();
}

function nearbyChapter(scrollPosition: number) {
    let nearest: ResolvedChapter | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const chapter of resolvedChapters.value) {
        const distance = Math.abs(chapter.position - scrollPosition);
        if (distance < nearestDistance) {
            nearest = chapter;
            nearestDistance = distance;
        }
    }

    return nearestDistance <= CHAPTER_PROXIMITY_THRESHOLD_PX
        ? nearest
        : undefined;
}

function targetChapterIndex(direction: ChapterDirection) {
    const scrollPosition = window.scrollY;
    const nearby = nearbyChapter(scrollPosition);

    if (nearby) {
        const targetIndex = nearby.index + direction;
        return targetIndex >= 0 && targetIndex < chapterCount
            ? targetIndex
            : undefined;
    }

    if (direction === 1) {
        const next = resolvedChapters.value.find(
            (chapter) => chapter.position > scrollPosition,
        );
        if (next) return next.index;

        const fallback = currentChapterIndex.value + 1;
        return fallback < chapterCount ? fallback : undefined;
    }

    return [...resolvedChapters.value]
        .reverse()
        .find((chapter) => chapter.position < scrollPosition)?.index;
}

function updateNavigationTargets() {
    previousChapterIndex.value = targetChapterIndex(-1);
    nextChapterIndex.value = targetChapterIndex(1);
}

function updateCurrentChapter() {
    const scrollPosition = window.scrollY;
    const nearby = nearbyChapter(scrollPosition);

    if (nearby) {
        currentChapterIndex.value = nearby.index;
        updateNavigationTargets();
        return;
    }

    let nextIndex = 0;

    const chaptersByActivation = [...resolvedChapters.value].sort(
        (first, second) => first.activationPosition - second.activationPosition,
    );

    for (const chapter of chaptersByActivation) {
        if (chapter.activationPosition > scrollPosition) break;
        nextIndex = chapter.index;
    }

    currentChapterIndex.value = nextIndex;
    updateNavigationTargets();
}

function handleScroll() {
    if (isMoving.value || scrollFrame) return;

    scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        updateCurrentChapter();
    });
}

async function prepareChapter(
    chapterIndex: number,
    direction: ChapterDirection,
) {
    let chapter = resolvedChapters.value.find(
        (candidate) => candidate.index === chapterIndex,
    );

    while (!chapter && direction === 1) {
        const loaded = await sceneSequence.value?.ensureNextSceneLoaded();
        if (!loaded) return;

        await nextTick();
        await nextFrame();
        ScrollTrigger.refresh();
        resolveChapterPositions();
        chapter = resolvedChapters.value.find(
            (candidate) => candidate.index === chapterIndex,
        );
    }

    return chapter;
}

async function scrollToChapter(direction: ChapterDirection) {
    if (isMoving.value) return;

    const targetIndex =
        direction === 1 ? nextChapterIndex.value : previousChapterIndex.value;
    if (targetIndex === undefined) return;

    const token = ++moveToken;
    isMoving.value = true;
    currentChapterIndex.value = targetIndex;

    const chapter = await prepareChapter(targetIndex, direction);
    if (token !== moveToken) return;
    if (!chapter) {
        isMoving.value = false;
        updateCurrentChapter();
        return;
    }

    const duration =
        direction === 1
            ? NEXT_SCROLL_DURATION_SECONDS
            : PREVIOUS_SCROLL_DURATION_SECONDS;

    const finish = () => {
        if (token !== moveToken) return;
        isMoving.value = false;
        updateCurrentChapter();
    };

    if (scrollController) {
        scrollController.scrollTo(chapter.position, {
            duration,
            onComplete: finish,
        });
        return;
    }

    window.scrollTo({
        top: chapter.position,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
    });
    window.setTimeout(finish, duration * 1000);
}

function scrollToPreviousChapter() {
    return scrollToChapter(-1);
}

function scrollToNextChapter() {
    return scrollToChapter(1);
}

function returnControlToUser() {
    if (!isMoving.value) return;

    moveToken += 1;
    isMoving.value = false;
    scrollController?.cancel();
    updateCurrentChapter();
}

function handleKeyIntent(event: KeyboardEvent) {
    if (!SCROLL_KEYS.has(event.key)) return;

    const target = event.target as HTMLElement | null;
    if (
        target?.isContentEditable ||
        target?.closest("button, input, select, textarea, [role='button']")
    ) {
        return;
    }

    returnControlToUser();
}

async function handleSceneLoaded() {
    await nextTick();
    await nextFrame();
    resolveChapterPositions();
}

onMounted(() => {
    resolveChapterPositions();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", returnControlToUser, {
        passive: true,
        capture: true,
    });
    window.addEventListener("touchstart", returnControlToUser, {
        passive: true,
        capture: true,
    });
    window.addEventListener("pointerdown", returnControlToUser, {
        passive: true,
        capture: true,
    });
    window.addEventListener("keydown", handleKeyIntent, { capture: true });
    ScrollTrigger.addEventListener("refresh", resolveChapterPositions);
});

onBeforeUnmount(() => {
    moveToken += 1;
    if (isMoving.value) scrollController?.cancel();
    cancelAnimationFrame(scrollFrame);
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("wheel", returnControlToUser, true);
    window.removeEventListener("touchstart", returnControlToUser, true);
    window.removeEventListener("pointerdown", returnControlToUser, true);
    window.removeEventListener("keydown", handleKeyIntent, true);
    ScrollTrigger.removeEventListener("refresh", resolveChapterPositions);
});
</script>

<template>
    <SceneSequence
        ref="sceneSequence"
        :scenes="lazyScenes"
        @scene-loaded="handleSceneLoaded"
    />

    <nav
        v-if="isNavigatorVisible"
        class="fixed bottom-[clamp(1rem,3svh,2rem)] left-1/2 z-90 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center overflow-hidden rounded-full border border-white/25 bg-[#032d65]/92 text-white shadow-[0_1rem_3rem_rgb(0_14_45_/_35%)] backdrop-blur-md"
        aria-label="Homepage chapter navigation"
    >
        <button
            type="button"
            class="group flex shrink-0 items-center gap-2 self-stretch border-0 border-r border-white/20 bg-white/10 px-5 text-sm font-bold tracking-wide text-white transition-colors hover:bg-white/20 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-[#61dfc7] disabled:cursor-default disabled:opacity-40"
            :disabled="isMoving || !hasPreviousChapter"
            :aria-busy="isMoving || undefined"
            @click="scrollToPreviousChapter"
        >
            <span
                aria-hidden="true"
                class="transition-transform group-hover:-translate-x-1 motion-reduce:transition-none"
                >←</span
            >
            Prev
        </button>

        <p
            class="m-0 flex min-w-0 items-center gap-2 px-5 py-3 text-[clamp(.82rem,1.25vw,1rem)] leading-none whitespace-nowrap"
            aria-live="polite"
        >
            <span class="font-mono tracking-[.08em] tabular-nums">
                {{ chapterNumber }} / {{ totalChapters }}
            </span>
            <span aria-hidden="true" class="text-white/55">·</span>
            <span class="truncate font-semibold">{{ chapterTitle }}</span>
        </p>

        <button
            type="button"
            class="group flex shrink-0 items-center gap-2 self-stretch border-0 border-l border-white/20 bg-white/10 px-5 text-sm font-bold tracking-wide text-white transition-colors hover:bg-white/20 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-[#61dfc7] disabled:cursor-default disabled:opacity-40"
            :disabled="isMoving || !hasNextChapter"
            :aria-busy="isMoving || undefined"
            @click="scrollToNextChapter"
        >
            Next
            <span
                aria-hidden="true"
                class="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                >→</span
            >
        </button>
    </nav>
</template>
