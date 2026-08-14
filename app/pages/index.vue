<script setup lang="ts">
import Expelliodor from "../components/HomePage/Expelliodor.vue";

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
        <ClientOnly>
            <HomePageScenes />

            <template #fallback>
                <div aria-hidden="true">
                    <div class="min-h-svh" />
                    <div class="min-h-svh" />
                    <div class="min-h-svh" />
                    <div class="min-h-svh" />
                    <div class="min-h-svh" />
                </div>
            </template>
        </ClientOnly>
    </article>
</template>
