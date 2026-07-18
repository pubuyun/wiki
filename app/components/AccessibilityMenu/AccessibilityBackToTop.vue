<script setup lang="ts">
import { Icon } from "@iconify/vue";

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
        class="flex size-12 shrink-0 items-center justify-center rounded-xl border-[3px] border-transparent bg-surface-elevated text-on-primary shadow-lg transition-[transform,border-color] hover:scale-105 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
        aria-label="Back to top"
        title="Back to top"
        @click="scrollToTop"
    >
        <Icon icon="lucide:arrow-up" class="size-5" aria-hidden="true" />
    </button>
</template>
