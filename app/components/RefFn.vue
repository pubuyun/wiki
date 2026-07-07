<template>
    <span
        :id="`fnref-${id}`"
        tabindex="-1"
        class="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
    >
        <slot mdc-unwrap="p" />
    </span>

    <a
        :href="`#ref-${id}`"
        class="ml-2 inline-flex align-baseline rounded-sm font-bold text-surface-tint no-underline hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
        :aria-label="`Back to reference ${id} in the text`"
        @click="scrollToHash($event, `#ref-${id}`)"
    >
        <Icon icon="mingcute:back-fill" class="h-4 w-4 align-middle" />
    </a>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
defineProps({
    id: {
        type: String,
        required: true,
    },
});
const { scrollToHash } = useHashScroll();
</script>
