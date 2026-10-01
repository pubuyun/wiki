<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const LightboxImageOverlay = defineAsyncComponent(
    () => import("./LightBox/LightboxImageOverlay.client.vue"),
);
const props = defineProps<{
    src: string[];
    alt?: string | string[];
    width?: number | string;
    height?: number | string;
}>();

const visible = ref(false);
const hasOpened = ref(false);
const index = ref(0);

const imageAlt = (imageIndex: number) =>
    Array.isArray(props.alt)
        ? (props.alt[imageIndex] ?? "")
        : (props.alt ?? "");

const open = (imageIndex = 0) => {
    if (!props.src.length) return;
    hasOpened.value = true;
    index.value = Math.min(Math.max(imageIndex, 0), props.src.length - 1);
    visible.value = true;
};

defineExpose({ open });
</script>

<template>
    <span class="contents">
        <slot :open="open">
            <button
                v-for="(imageSrc, imageIndex) in src"
                :key="`${imageSrc}-${imageIndex}`"
                type="button"
                class="block cursor-zoom-in"
                :aria-label="`Open image ${imageIndex + 1} of ${src.length}`"
                @click="open(imageIndex)"
            >
                <img
                    :src="imageSrc"
                    :alt="imageAlt(imageIndex)"
                    :width="width"
                    :height="height"
                    class="h-auto max-w-full"
                    decoding="async"
                />
            </button>
        </slot>

        <LightboxImageOverlay
            v-if="hasOpened"
            :visible="visible"
            :src="src"
            :index="index"
            @hide="visible = false"
            @update:index="index = $event"
        />
    </span>
</template>
