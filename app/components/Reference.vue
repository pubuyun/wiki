<template>
    <a
        :href="`#fnref-${id}`"
        :id="`ref-${id}`"
        class="mx-0.5 scroll-mt-24 align-super text-xs font-bold text-vred no-underline hover:text-persimmon"
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
</script>
