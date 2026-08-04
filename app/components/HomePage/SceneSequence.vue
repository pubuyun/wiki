<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, type Component } from "vue";

import LazyScene from "./LazyScene.vue";

type SceneDefinition = {
    id: string;
    loader: () => Promise<{ default: Component }>;
    rootMargin?: string;
    minHeight?: string;
};

const props = defineProps<{
    scenes: readonly SceneDefinition[];
}>();

const nextSceneIndex = ref(0);
const immediateThroughIndex = ref(-1);

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
}

function handleHashChange() {
    const targetIndex = findHashSceneIndex();
    immediateThroughIndex.value = targetIndex;

    if (targetIndex >= 0 && targetIndex < nextSceneIndex.value) {
        scrollToHashScene(targetIndex);
    }
}

onMounted(() => {
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
});

onBeforeUnmount(() => {
    window.removeEventListener("hashchange", handleHashChange);
});
</script>

<template>
    <LazyScene
        v-for="(scene, sceneIndex) in scenes"
        :key="scene.id"
        :loader="scene.loader"
        :enabled="sceneIndex === nextSceneIndex"
        :load-immediately="
            immediateThroughIndex >= 0 &&
            sceneIndex <= immediateThroughIndex &&
            sceneIndex === nextSceneIndex
        "
        :root-margin="scene.rootMargin"
        :min-height="scene.minHeight"
        @loaded="handleSceneLoaded(sceneIndex)"
    />
</template>
