<template>
    <a
        :href="link"
        target="_blank"
        :id="`fnref-${id}`"
        class="font-bold text-azure no-underline hover:text-vred"
        aria-label="Reference link"
    >
        <slot mdc-unwrap="p" />
    </a>

    <a
        :href="`#ref-${id}`"
        class="ml-2 font-bold text-azure no-underline hover:text-vred"
        aria-label="Back to reference"
        @click="scrollToHash($event, `#ref-${id}`)"
    >
        ↩
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
