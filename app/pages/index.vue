<script setup lang="ts">
import Expelliodor from "../components/HomePage/Expelliodor.vue";
import SceneSequence from "../components/HomePage/SceneSequence.vue";

const lazyScenes = [
    {
        id: "abcc11",
        loader: () => import("../components/HomePage/ABCC11.vue"),
        minHeight: "100svh",
    },
    {
        id: "mechanism",
        loader: () => import("../components/HomePage/Mechanism.vue"),
    },
    {
        id: "solution",
        loader: () => import("../components/HomePage/Solution.vue"),
        minHeight: "100svh",
    },
] as const;

definePageMeta({
    layout: "static",
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
