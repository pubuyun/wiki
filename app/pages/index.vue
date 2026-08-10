<script setup lang="ts">
import Expelliodor from "../components/HomePage/Expelliodor.vue";
import SceneSequence from "../components/HomePage/SceneSequence.vue";

const lazyScenes = [
    {
        id: "world-stat",
        loader: () => import("../components/HomePage/WorldStat.vue"),
        minHeight: "100svh",
    },
    {
        id: "abcc11",
        loader: () => import("../components/HomePage/ABCC11.vue"),
        minHeight: "100svh",
    },
    {
        id: "mechanism",
        loader: () => import("../components/HomePage/Mechanism.vue"),
        // The cross-scene precursor path needs Mechanism's anchor and
        // ScrollTrigger before ABCC11 reaches glandInside for the first time.
        loadImmediately: true,
    },
    {
        id: "product",
        loader: () => import("../components/HomePage/Product.vue"),
        minHeight: "100svh",
        // model-viewer is large; mount Product early so its ScrollTrigger pin
        // already exists before the visitor reaches this scene.
        loadImmediately: true,
    },
    {
        id: "solution",
        loader: () => import("../components/HomePage/Solution.vue"),
        minHeight: "100svh",
    },
] as const;

definePageMeta({
    layout: "home",
});
useSeoMeta({
    title: "Expelliodor",
});
</script>

<template>
    <article class="w-full flex-1 overflow-hidden bg-[#03316d]">
        <Expelliodor />
        <SceneSequence :scenes="lazyScenes" />
    </article>
</template>
