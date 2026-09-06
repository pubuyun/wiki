<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, type Component } from "vue";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import LazyScene from "./LazyScene.vue";
import {
    beginHomeScrollRestore,
    cancelHomeScrollRestore,
    isHomeScrollRestoring,
    readHomeScroll,
    restoreHomeScroll,
    saveHomeScroll,
    type HomeScrollSnapshot,
} from "~/utils/home-scroll";

type SceneDefinition = {
    id: string;
    restoreIds?: readonly string[];
    loader: () => Promise<{ default: Component }>;
    rootMargin?: string;
    minHeight?: string;
    loadImmediately?: boolean;
};

type SceneModule = { default: Component };

type NavigatorWithConnection = Navigator & {
    connection?: {
        effectiveType?: string;
        saveData?: boolean;
    };
};

const props = defineProps<{
    scenes: readonly SceneDefinition[];
}>();

const emit = defineEmits<{
    sceneLoaded: [sceneIndex: number];
}>();

const navigation = import.meta.client
    ? (window.performance.getEntriesByType("navigation")[0] as
          PerformanceNavigationTiming | undefined)
    : undefined;
const savedScroll =
    import.meta.client && navigation?.type === "reload" && !window.location.hash
        ? readHomeScroll()
        : undefined;
const savedSceneId = savedScroll?.sceneId;
const savedSceneIndex = savedSceneId
    ? props.scenes.findIndex(
          (scene) =>
              scene.id === savedSceneId ||
              scene.restoreIds?.includes(savedSceneId),
      )
    : -1;
const restoreThroughIndex =
    savedSceneIndex >= 0 && savedScroll?.sceneId === "abcc11"
        ? Math.min(savedSceneIndex + 1, props.scenes.length - 1)
        : savedSceneIndex;
let restoreGeneration = savedScroll ? beginHomeScrollRestore() : undefined;

const nextSceneIndex = ref(0);
const immediateThroughIndex = ref(restoreThroughIndex);
const forcedThroughIndex = ref(-1);
const sceneLoadWaiters = new Map<number, Array<(loaded: boolean) => void>>();
const failedSceneIndexes = new Set<number>();
const sceneModulePromises = new Map<number, Promise<SceneModule>>();
let isRestoring = false;

const RESTORE_GEOMETRY_ATTEMPTS = 12;
const RESTORE_GEOMETRY_EPSILON = 0.5;

function loadSceneModule(sceneIndex: number) {
    const existing = sceneModulePromises.get(sceneIndex);
    if (existing) return existing;

    const scene = props.scenes[sceneIndex];
    if (!scene) return Promise.reject(new Error("Unknown homepage scene"));

    const promise: Promise<SceneModule> = scene
        .loader()
        .catch((error: unknown) => {
            if (sceneModulePromises.get(sceneIndex) === promise) {
                sceneModulePromises.delete(sceneIndex);
            }
            throw error;
        });
    sceneModulePromises.set(sceneIndex, promise);
    return promise;
}

const sceneLoaders = props.scenes.map(
    (_, sceneIndex) => () => loadSceneModule(sceneIndex),
);

function canPredictivelyPreload() {
    const connection = (navigator as NavigatorWithConnection).connection;
    return (
        !connection?.saveData &&
        connection?.effectiveType !== "slow-2g" &&
        connection?.effectiveType !== "2g"
    );
}

function preloadScene(sceneIndex: number) {
    if (sceneIndex < 0 || sceneIndex >= props.scenes.length) return;
    void loadSceneModule(sceneIndex).catch(() => {
        // LazyScene owns the visible retry state if mounting later also fails.
    });
}

function preloadThrough(sceneIndex: number) {
    for (let index = 0; index <= sceneIndex; index += 1) {
        preloadScene(index);
    }
}

function findHashSceneIndex() {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    return props.scenes.findIndex(
        (scene) => scene.id === hash || scene.restoreIds?.includes(hash),
    );
}

function scrollToHashScene(sceneIndex: number) {
    if (sceneIndex !== immediateThroughIndex.value) return;

    void nextTick(() => {
        const hash = decodeURIComponent(window.location.hash.slice(1));
        document
            .getElementById(hash || props.scenes[sceneIndex]?.id || "")
            ?.scrollIntoView();
    });
}

function handleSceneLoaded(sceneIndex: number) {
    failedSceneIndexes.delete(sceneIndex);
    if (sceneIndex === nextSceneIndex.value) {
        nextSceneIndex.value += 1;
    }
    if (canPredictivelyPreload()) preloadScene(nextSceneIndex.value);
    scrollToHashScene(sceneIndex);

    if (sceneIndex === restoreThroughIndex && savedScroll) {
        if (!isHomeScrollRestoring()) {
            restoreGeneration = beginHomeScrollRestore();
        }
        void restoreSavedScroll(savedScroll);
    }

    sceneLoadWaiters
        .get(sceneIndex)
        ?.splice(0)
        .forEach((resolve) => resolve(true));
    sceneLoadWaiters.delete(sceneIndex);
    emit("sceneLoaded", sceneIndex);
}

function handleSceneError(sceneIndex: number) {
    failedSceneIndexes.add(sceneIndex);
    if (sceneIndex === nextSceneIndex.value) {
        nextSceneIndex.value += 1;
        if (canPredictivelyPreload()) preloadScene(nextSceneIndex.value);
    }
    if (sceneIndex === restoreThroughIndex) {
        cancelHomeScrollRestore(restoreGeneration);
    }
    sceneLoadWaiters
        .get(sceneIndex)
        ?.splice(0)
        .forEach((resolve) => resolve(false));
    sceneLoadWaiters.delete(sceneIndex);
}

function ensureNextSceneLoaded() {
    const sceneIndex = nextSceneIndex.value;
    if (sceneIndex >= props.scenes.length) return Promise.resolve(false);
    if (failedSceneIndexes.has(sceneIndex)) return Promise.resolve(false);

    forcedThroughIndex.value = Math.max(forcedThroughIndex.value, sceneIndex);

    return new Promise<boolean>((resolve) => {
        const waiters = sceneLoadWaiters.get(sceneIndex) ?? [];
        waiters.push(resolve);
        sceneLoadWaiters.set(sceneIndex, waiters);
    });
}

const nextFrame = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

function sameTriggerGeometry(
    first: { start: number; end: number },
    second: { start: number; end: number },
) {
    return (
        Math.abs(first.start - second.start) <= RESTORE_GEOMETRY_EPSILON &&
        Math.abs(first.end - second.end) <= RESTORE_GEOMETRY_EPSILON
    );
}

async function settleScrollTriggerGeometry(triggerId?: string) {
    let previousGeometry: { start: number; end: number } | undefined;

    for (let attempt = 0; attempt < RESTORE_GEOMETRY_ATTEMPTS; attempt += 1) {
        await nextFrame();

        // Lazy scenes can finish mounting out of document order. Sorting first
        // makes earlier pin spacers participate before later scenes refresh.
        ScrollTrigger.sort();
        ScrollTrigger.refresh();

        const trigger = triggerId
            ? ScrollTrigger.getById(triggerId)
            : undefined;
        if (triggerId && !trigger) continue;

        const geometry = trigger
            ? { start: trigger.start, end: trigger.end }
            : { start: 0, end: document.documentElement.scrollHeight };
        if (
            previousGeometry &&
            sameTriggerGeometry(previousGeometry, geometry)
        ) {
            return;
        }
        previousGeometry = geometry;
    }
}

async function restoreSavedScroll(snapshot: HomeScrollSnapshot) {
    if (isRestoring) return;
    isRestoring = true;

    await nextTick();
    await settleScrollTriggerGeometry(snapshot.triggerId);
    restoreHomeScroll(
        snapshot,
        (position) => window.scrollTo(0, position),
        restoreGeneration,
    );
}

function handleHashChange() {
    const targetIndex = findHashSceneIndex();
    if (targetIndex < 0) {
        if (!savedScroll) immediateThroughIndex.value = -1;
        return;
    }

    immediateThroughIndex.value = targetIndex;
    preloadThrough(targetIndex);

    if (targetIndex < nextSceneIndex.value) {
        scrollToHashScene(targetIndex);
    }
}

onMounted(() => {
    if (restoreThroughIndex >= 0) preloadThrough(restoreThroughIndex);
    else if (canPredictivelyPreload()) preloadScene(0);

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("pagehide", saveHomeScroll);
    window.addEventListener("beforeunload", saveHomeScroll);

    // Expelliodor is outside SceneSequence and has no lazy scene index.
    if (savedScroll && restoreThroughIndex < 0) {
        void restoreSavedScroll(savedScroll);
    }
});

onBeforeUnmount(() => {
    window.removeEventListener("hashchange", handleHashChange);
    window.removeEventListener("pagehide", saveHomeScroll);
    window.removeEventListener("beforeunload", saveHomeScroll);
    sceneLoadWaiters.forEach((waiters) =>
        waiters.forEach((resolve) => resolve(false)),
    );
    sceneLoadWaiters.clear();
    failedSceneIndexes.clear();
    if (restoreGeneration !== undefined && isHomeScrollRestoring()) {
        cancelHomeScrollRestore(restoreGeneration);
    }
});

defineExpose({ ensureNextSceneLoaded });
</script>

<template>
    <LazyScene
        v-for="(scene, sceneIndex) in scenes"
        :key="scene.id"
        :loader="sceneLoaders[sceneIndex]!"
        :enabled="sceneIndex === nextSceneIndex"
        :load-immediately="
            sceneIndex === nextSceneIndex &&
            (scene.loadImmediately ||
                sceneIndex <= forcedThroughIndex ||
                (immediateThroughIndex >= 0 &&
                    sceneIndex <= immediateThroughIndex))
        "
        :root-margin="scene.rootMargin"
        :min-height="scene.minHeight"
        @loaded="handleSceneLoaded(sceneIndex)"
        @error="handleSceneError(sceneIndex)"
    />
</template>
