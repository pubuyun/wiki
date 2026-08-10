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
        loader: () => import("../components/HomePage/ProductSolution.vue"),
        minHeight: "100svh",
        // Product and Solution share one pinned master timeline so the bottle
        // paints the real Solution overview without a duplicate scene.
        loadImmediately: true,
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
