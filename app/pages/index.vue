<script setup lang="ts">
import Expelliodor from "../components/HomePage/Expelliodor.vue";
import SceneSequence from "../components/HomePage/SceneSequence.vue";

const lazyScenes = [
    {
        id: "mechanism",
        loader: () => import("../components/HomePage/Mechanism.vue"),
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
    <article class="flex-1 bg-[#03316d]">
        <Expelliodor />
        <SceneSequence :scenes="lazyScenes" />
    </article>
</template>
