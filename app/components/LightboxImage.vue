<script setup lang="ts">
import LightboxImageOverlay from "./LightBox/LightboxImageOverlay.client.vue";
const props = defineProps<{
    src: string[];
    alt?: string | string[];
}>();

const visible = ref(false);
const index = ref(0);

const imageAlt = (imageIndex: number) =>
    Array.isArray(props.alt)
        ? (props.alt[imageIndex] ?? "")
        : (props.alt ?? "");

const open = (imageIndex = 0) => {
    if (!props.src.length) return;
    index.value = Math.min(Math.max(imageIndex, 0), props.src.length - 1);
    visible.value = true;
};

defineExpose({ open });
</script>

<template>
    <div class="contents">
        <slot :open="open">
            <button
                v-for="(imageSrc, imageIndex) in src"
                :key="`${imageSrc}-${imageIndex}`"
                type="button"
                class="block cursor-zoom-in"
                :aria-label="`Open image ${imageIndex + 1} of ${src.length}`"
                @click="open(imageIndex)"
            >
                <img :src="imageSrc" :alt="imageAlt(imageIndex)" />
            </button>
        </slot>

        <LightboxImageOverlay
            :visible="visible"
            :src="src"
            :index="index"
            @hide="visible = false"
            @update:index="index = $event"
        />
    </div>
</template>
