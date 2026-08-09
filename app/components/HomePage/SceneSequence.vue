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
    if (sceneIndex === nextSceneIndex.value) {
        nextSceneIndex.value += 1;
    }
    scrollToHashScene(sceneIndex);

    if (sceneIndex === restoreThroughIndex && savedScroll) {
        void restoreSavedScroll(savedScroll);
    }
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
});
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
                (immediateThroughIndex >= 0 &&
                    sceneIndex <= immediateThroughIndex))
        "
        :root-margin="scene.rootMargin"
        :min-height="scene.minHeight"
        @loaded="handleSceneLoaded(sceneIndex)"
    />
</template>
