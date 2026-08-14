<script setup lang="ts">
import SceneSequence from "./HomePage/SceneSequence.vue";

const lazyScenes = [
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
</script>

<template>
    <SceneSequence :scenes="lazyScenes" />
</template>
