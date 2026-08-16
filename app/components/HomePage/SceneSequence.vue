<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, type Component } from "vue";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import LazyScene from "./LazyScene.vue";
import {
    readHomeScroll,
    restoreHomeScroll,
    saveHomeScroll,
    type HomeScrollSnapshot,
} from "~/utils/home-scroll";

type SceneDefinition = {
    id: string;
    loader: () => Promise<{ default: Component }>;
    rootMargin?: string;
    minHeight?: string;
    loadImmediately?: boolean;
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
const savedSceneIndex = savedScroll?.sceneId
    ? props.scenes.findIndex((scene) => scene.id === savedScroll.sceneId)
    : -1;
const restoreThroughIndex =
    savedSceneIndex >= 0 && savedScroll?.sceneId === "abcc11"
        ? Math.min(savedSceneIndex + 1, props.scenes.length - 1)
        : savedSceneIndex;

const nextSceneIndex = ref(0);
const immediateThroughIndex = ref(restoreThroughIndex);
const forcedThroughIndex = ref(-1);
const sceneLoadWaiters = new Map<number, Array<(loaded: boolean) => void>>();
const failedSceneIndexes = new Set<number>();
let isRestoring = false;

function findHashSceneIndex() {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    return props.scenes.findIndex((scene) => scene.id === hash);
}

function scrollToHashScene(sceneIndex: number) {
    if (sceneIndex !== immediateThroughIndex.value) return;

    void nextTick(() => {
        document
            .getElementById(props.scenes[sceneIndex]?.id ?? "")
            ?.scrollIntoView();
    });
}

function handleSceneLoaded(sceneIndex: number) {
    failedSceneIndexes.delete(sceneIndex);
    if (sceneIndex === nextSceneIndex.value) {
        nextSceneIndex.value += 1;
    }
    scrollToHashScene(sceneIndex);

    if (sceneIndex === restoreThroughIndex && savedScroll) {
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

async function restoreSavedScroll(snapshot: HomeScrollSnapshot) {
    if (isRestoring) return;
    isRestoring = true;

    await nextTick();
    await nextFrame();
    await nextFrame();
    ScrollTrigger.refresh();

    // The cross-scene route is created after both scenes have mounted.
    for (let attempt = 0; attempt < 6; attempt += 1) {
        if (!snapshot.triggerId || ScrollTrigger.getById(snapshot.triggerId)) {
            break;
        }
        await nextFrame();
    }

    ScrollTrigger.refresh();
    restoreHomeScroll(snapshot, (position) => window.scrollTo(0, position));
}

function handleHashChange() {
    const targetIndex = findHashSceneIndex();
    if (targetIndex < 0) {
        if (!savedScroll) immediateThroughIndex.value = -1;
        return;
    }

    immediateThroughIndex.value = targetIndex;

    if (targetIndex < nextSceneIndex.value) {
        scrollToHashScene(targetIndex);
    }
}

onMounted(() => {
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
});

defineExpose({ ensureNextSceneLoaded });
</script>

<template>
    <LazyScene
        v-for="(scene, sceneIndex) in scenes"
        :key="scene.id"
        :loader="scene.loader"
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
