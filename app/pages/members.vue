<script setup lang="ts">
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import MembersForest from "~/components/MembersPage/MembersForest.vue";
import AdvisorsGallery from "~/components/MembersPage/AdvisorsGallery.vue";
import { MembersPageMembersArcade as MembersArcade } from "#components";

useSeoMeta({ title: "Members" });
definePageMeta({
    layout: "static",
});

let lenis: Lenis | undefined;

onMounted(() => {
    lenis = new Lenis({
        autoRaf: true,
        autoToggle: true,
        anchors: true,
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
        respectReducedMotion: true,
        allowNestedScroll: true,
        // The member collection has its own horizontal Lenis instance.
        prevent: (node) => node.classList.contains("gallery-track"),
    });
});

onBeforeUnmount(() => {
    lenis?.destroy();
    lenis = undefined;
});
</script>

<template>
    <section class="members-page" aria-label="Members">
        <MembersForest />
        <div class="members-content">
            <MembersArcade />
            <AdvisorsGallery />
        </div>
    </section>
</template>

<style scoped>
.members-page {
    position: relative;
    isolation: isolate;
    min-height: 100svh;
}

.members-content {
    position: relative;
    z-index: 1;
    min-height: 100svh;
}
</style>
