<script setup lang="ts">
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
    });
}
</script>

<template>
    <button
        type="button"
        class="flex size-12 shrink-0 items-center justify-center rounded-full bg-transparent transition-transform hover:scale-105 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
        aria-label="Back to top"
        title="Back to top"
        @click="scrollToTop"
    >
        <img
            src="https://static.igem.wiki/teams/6133/wiki/accessibility-menu-icons/back-to-top1.avif"
            alt=""
            class="size-full rounded-full object-contain"
            aria-hidden="true"
        />
    </button>
</template>
