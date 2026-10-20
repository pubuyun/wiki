<script setup lang="ts">
import DocumentCaption from "./DocumentCaption.vue";
import ImagePanelLayout from "./ImagePanelLayout.vue";
import type { MinimarkTree } from "minimark";

defineProps<{
    src: string[];
    titles: string[];
    caption: string;
    captionBody?: MinimarkTree;
    label?: string;
    portrait?: boolean;
}>();
</script>

<template>
    <figure class="my-8 max-w-full min-w-0">
        <ImagePanelLayout
            :class="{
                'video-panels__single-portrait': portrait && src.length === 1,
            }"
            :src="src"
            :alt="titles"
            :label="label ?? 'Simulation videos'"
            :auto-labels="src.length > 1"
            media-type="video"
            :video-aspect-ratio="portrait ? '4 / 5' : '16 / 9'"
        />
        <DocumentCaption as="figcaption" :text="caption" :body="captionBody" />
    </figure>
</template>

<style scoped>
.video-panels__single-portrait {
    max-width: 28rem;
    margin-inline: auto;
}
</style>
