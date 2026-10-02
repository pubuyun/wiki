<template>
    <Reference
        :id="`ref-${id}`"
        :destination="referenceLink(id)"
        :label="label || id"
        @click="rememberCitation(id, $event)"
    />
</template>

<script setup lang="ts">
import Reference from "./Reference.vue";

defineProps<{
    id: string;
    label?: string;
}>();

const { referenceLink, rememberCitation } = await useCategoryReferences();
</script>
