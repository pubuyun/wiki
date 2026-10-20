<script setup lang="ts">
import { provide, useId } from "vue";
import DocumentCaption from "./DocumentCaption.vue";
import type { MinimarkTree } from "minimark";

defineProps<{ caption: string; captionBody?: MinimarkTree }>();

const captionId = `table-caption-${useId()}`;
provide("wiki-table-caption-id", captionId);
</script>

<template>
    <div class="my-8 max-w-full min-w-0">
        <DocumentCaption
            :id="captionId"
            class="table-caption"
            as="div"
            :text="caption"
            :body="captionBody"
        />
        <slot />
    </div>
</template>

<style scoped>
.document-caption.table-caption {
    margin: 0 0 1rem;
}
</style>
