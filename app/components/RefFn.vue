<template>
    <span
        :id="`fnref-${id}`"
        tabindex="-1"
        class="scroll-mt-24 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
    >
        <slot mdc-unwrap="p" />
    </span>

    <NuxtLink
        :to="citationLink(id)"
        class="ml-2 inline-flex rounded-sm align-baseline font-bold text-surface-bright no-underline hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
        :aria-label="`Back to reference ${id} in the text`"
        @click="scrollToHash($event, citationLink(id))"
    >
        <Icon
            icon="mingcute:back-fill"
            class="h-4 w-4 align-middle"
            aria-hidden="true"
        />
    </NuxtLink>
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
const { citationLink } = await useCategoryReferences();
</script>
