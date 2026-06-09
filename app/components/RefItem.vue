<template>
    <li :id="`fn-${id}`" class="pl-1 leading-7">
        <slot mdc-unwrap="p" />
        <NuxtLink
            :href="`#fnref-${id}`"
            class="ml-2 font-bold text-azure no-underline hover:text-vred"
            aria-label="Back to reference"
        >
            ↩
        </NuxtLink>
    </li>
</template>

<script setup lang="ts">
const props = defineProps({
    id: {
        type: String,
        required: true,
    },
});
</script>
