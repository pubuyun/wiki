<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import DocumentCaption from "./DocumentCaption.vue";

const LightboxImageOverlay = defineAsyncComponent(
    () => import("./LightBox/LightboxImageOverlay.client.vue"),
);
const props = withDefaults(
    defineProps<{
        src: string[];
        alt?: string | string[];
        caption?: string | string[];
        imageBackground?: string;
        width?: number | string;
        height?: number | string;
    }>(),
    { imageBackground: "#fff" },
);

const visible = ref(false);
const hasOpened = ref(false);
const index = ref(0);

const imageAlt = (imageIndex: number) =>
    Array.isArray(props.alt)
        ? (props.alt[imageIndex] ?? "")
        : (props.alt ?? "");

const imageCaption = (imageIndex: number) =>
    Array.isArray(props.caption)
        ? (props.caption[imageIndex] ?? "")
        : (props.caption ?? "");

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
        <span
            v-if="$slots.default && imageCaption(0)"
            role="figure"
            :aria-label="
                imageCaption(0)
                    .replace(/<[^>]+>/g, '')
                    .replace(/\*/g, '')
            "
            class="my-8 block max-w-full min-w-0"
        >
            <slot :open="open" />
            <DocumentCaption :text="imageCaption(0)" />
        </span>
        <slot v-else :open="open">
            <figure
                v-for="(imageSrc, imageIndex) in src"
                :key="`${imageSrc}-${imageIndex}`"
                class="m-0 max-w-full min-w-0"
                :class="{
                    'mb-6':
                        imageCaption(imageIndex) && imageIndex < src.length - 1,
                }"
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
                        :width="width"
                        :height="height"
                        :style="{ backgroundColor: imageBackground }"
                        class="h-auto max-w-full rounded-2xl"
                        decoding="async"
                        loading="lazy"
                    />
                </button>
                <DocumentCaption
                    v-if="imageCaption(imageIndex)"
                    as="figcaption"
                    :text="imageCaption(imageIndex)"
                />
            </figure>
        </slot>

        <LightboxImageOverlay
            v-if="hasOpened"
            :visible="visible"
            :src="src"
            :alt="alt"
            :index="index"
            :image-background="imageBackground"
            @hide="visible = false"
            @update:index="index = $event"
        />
    </span>
</template>
