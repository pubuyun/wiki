<template>
    <Reference
        :id="`ref-${id}`"
        :destination="`#fnref-${id}`"
        :label="label || id"
    />
</template>

<script setup lang="ts">
import Reference from "./Reference.vue";

defineProps<{
    id: string;
    label?: string;
}>();
</script>
