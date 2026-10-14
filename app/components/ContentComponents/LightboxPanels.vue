<script setup lang="ts">
import LightboxImage from "./LightboxImage.vue";
import ImagePanelLayout from "./ImagePanelLayout.vue";

withDefaults(
    defineProps<{
        src: string[];
        alt?: string | string[];
        caption?: string;
        label?: string;
        imageBackground?: string;
        autoLabels?: boolean;
        layout?: "grid" | "stack";
    }>(),
    { autoLabels: true },
);
</script>

<template>
    <LightboxImage
        :src="src"
        :alt="alt"
        :caption="caption"
        :image-background="imageBackground"
    >
        <template #default="{ open }">
            <ImagePanelLayout
                :src="src"
                :alt="alt"
                :image-background="imageBackground"
                :label="label ?? caption ?? 'Figure panels'"
                :auto-labels="autoLabels ?? true"
                :layout="layout"
                @open="open"
            />
        </template>
    </LightboxImage>
</template>
