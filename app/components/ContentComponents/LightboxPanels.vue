<script setup lang="ts">
import LightboxImage from "./LightboxImage.vue";
import PanelLayout from "./PanelLayout.vue";

const props = defineProps<{
    src: string[];
    alt?: string | string[];
    caption?: string;
    label?: string;
    panelHeight?: string;
}>();

const panelSlots = ["left", "right", "left-bottom", "right-bottom"];
const imageAlt = (imageIndex: number) =>
    Array.isArray(props.alt)
        ? (props.alt[imageIndex] ?? "")
        : (props.alt ?? "");
</script>

<template>
    <LightboxImage :src="src" :alt="alt" :caption="caption">
        <template #default="{ open }">
            <PanelLayout
                :height="panelHeight ?? '32rem'"
                :label="label ?? caption ?? 'Figure panels'"
                :auto-labels="true"
            >
                <template
                    v-for="(imageSrc, imageIndex) in src"
                    :key="imageSrc"
                    #[panelSlots[imageIndex]]
                >
                    <button
                        type="button"
                        class="block max-w-full cursor-zoom-in rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
                        :aria-label="`Open image ${imageIndex + 1} of ${src.length}${imageAlt(imageIndex) ? `: ${imageAlt(imageIndex)}` : ''}`"
                        @click="open(imageIndex)"
                    >
                        <img
                            :src="imageSrc"
                            :alt="imageAlt(imageIndex)"
                            class="h-auto max-w-full rounded-2xl"
                            loading="lazy"
                            decoding="async"
                        />
                    </button>
                </template>
            </PanelLayout>
        </template>
    </LightboxImage>
</template>
