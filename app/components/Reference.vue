<template>
    <a
        :href="`#fnref-${id}`"
        :id="`ref-${id}`"
        class="mx-0.5 scroll-mt-24 rounded-sm align-super text-xs font-bold text-surface-tint no-underline hover:text-on-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
        :aria-label="`Go to reference ${label || id}`"
        @click="scrollToHash($event, `fnref-${id}`)"
    >
        <span>{{ label || id }}</span>
    </a>
</template>

<script setup lang="ts">
const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        default: "",
    },
});
const { scrollToHash } = useHashScroll();
</script>
