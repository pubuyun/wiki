<script setup lang="ts">
import Mechanism from "../components/HomePage/Mechanism.vue";

definePageMeta({
    layout: "static",
});
useSeoMeta({
    title: "Expelliodor",
});
</script>

<template>
    <article class="flex-1 bg-surface">
        <Mechanism />
    </article>
</template>
