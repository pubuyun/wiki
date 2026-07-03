<template>
    <a
        v-if="link"
        :id="`fnref-${id}`"
        :href="link"
        target="_blank"
        rel="noopener noreferrer"
        class="rounded-sm font-bold text-surface-tint no-underline hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
    >
        <slot mdc-unwrap="p" />
        <span class="sr-only">opens in a new tab</span>
    </a>
    <span
        v-else
        :id="`fnref-${id}`"
        tabindex="-1"
        class="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
    >
        <slot mdc-unwrap="p" />
    </span>

    <a
        :href="`#ref-${id}`"
        class="ml-2 rounded-sm font-bold text-surface-tint no-underline hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
        :aria-label="`Back to reference ${id} in the text`"
        @click="scrollToHash($event, `#ref-${id}`)"
    >
        <span aria-hidden="true">?</span>
    </a>
</template>

<script setup lang="ts">
const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        default: "",
    },
});
const { scrollToHash } = useHashScroll();
</script>
