<template>
    <a
        :href="`#fnref-${id}`"
        :id="`ref-${id}`"
        class="hover:text-primary-deep mx-0.5 scroll-mt-24 align-super text-xs font-bold text-secondary no-underline"
        @click="scrollToHash($event, `fnref-${id}`)"
    >
        {{ label || id }}
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
