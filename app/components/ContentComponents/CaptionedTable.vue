<script setup lang="ts">
import { provide, useId } from "vue";
import DocumentCaption from "./DocumentCaption.vue";

defineProps<{ caption: string }>();

const captionId = `table-caption-${useId()}`;
provide("wiki-table-caption-id", captionId);
</script>

<template>
    <div class="my-8 max-w-full min-w-0">
        <slot />
        <DocumentCaption :id="captionId" as="p" :text="caption" />
    </div>
</template>
