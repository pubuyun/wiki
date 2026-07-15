<script setup lang="ts">
import { Icon } from "@iconify/vue";
import VueEasyLightbox from "vue-easy-lightbox";

type ToolbarMethods = {
    zoomIn: () => void;
    zoomOut: () => void;
    resize: () => void;
    rotateRight: () => void;
};

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

        <VueEasyLightbox
            :visible="visible"
            :imgs="src"
            :index="index"
            teleport="body"
            @hide="visible = false"
            @on-index-change="(_oldIndex, newIndex) => (index = newIndex)"
        >
            <template #toolbar="{ toolbarMethods }">
                <aside
                    class="lightbox-toolbar fixed right-4 bottom-4 z-9999"
                    aria-label="Image controls"
                >
                    <div class="grid grid-cols-2 gap-2">
                        <Transition appear name="lightbox-tool-top-left">
                            <button
                                type="button"
                                class="lightbox-tool-button"
                                style="grid-area: 1 / 1"
                                title="Zoom in"
                                aria-label="Zoom in"
                                @click="
                                    (toolbarMethods as ToolbarMethods).zoomIn
                                "
                            >
                                <Icon
                                    icon="lucide:zoom-in"
                                    class="size-6"
                                    aria-hidden="true"
                                />
                            </button>
                        </Transition>

                        <Transition appear name="lightbox-tool-top-right">
                            <button
                                type="button"
                                class="lightbox-tool-button"
                                style="grid-area: 1 / 2"
                                title="Reset zoom"
                                aria-label="Reset zoom"
                                @click="
                                    (toolbarMethods as ToolbarMethods).resize
                                "
                            >
                                <Icon
                                    icon="lucide:scan"
                                    class="size-6"
                                    aria-hidden="true"
                                />
                            </button>
                        </Transition>

                        <Transition appear name="lightbox-tool-bottom-left">
                            <button
                                type="button"
                                class="lightbox-tool-button"
                                style="grid-area: 2 / 1"
                                title="Zoom out"
                                aria-label="Zoom out"
                                @click="
                                    (toolbarMethods as ToolbarMethods).zoomOut
                                "
                            >
                                <Icon
                                    icon="lucide:zoom-out"
                                    class="size-6"
                                    aria-hidden="true"
                                />
                            </button>
                        </Transition>

                        <Transition appear name="lightbox-tool-bottom-right">
                            <button
                                type="button"
                                class="lightbox-tool-button"
                                style="grid-area: 2 / 2"
                                title="Rotate right 90 degrees"
                                aria-label="Rotate right 90 degrees"
                                @click="
                                    (toolbarMethods as ToolbarMethods)
                                        .rotateRight
                                "
                            >
                                <Icon
                                    icon="lucide:rotate-cw"
                                    class="size-6"
                                    aria-hidden="true"
                                />
                            </button>
                        </Transition>
                    </div>
                </aside>
            </template>
        </VueEasyLightbox>
    </div>
</template>

<style scoped>
.lightbox-tool-button {
    display: flex;
    width: 3rem;
    height: 3rem;
    align-items: center;
    justify-content: center;
    border: 3px solid transparent;
    border-radius: 9999px;
    background: var(--color-primary);
    color: var(--color-on-primary);
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.25);
    transition:
        transform 150ms ease,
        border-color 150ms ease;
}

.lightbox-tool-button:hover {
    transform: scale(1.05);
}

.lightbox-tool-button:focus-visible {
    outline: 2px solid var(--color-outline);
    outline-offset: 2px;
}

.lightbox-tool-top-left-enter-active,
.lightbox-tool-top-right-enter-active,
.lightbox-tool-bottom-left-enter-active,
.lightbox-tool-bottom-right-enter-active {
    transform-origin: center;
    will-change: transform, opacity;
    animation: lightbox-tool-in 260ms ease-out both;
}

.lightbox-tool-top-left-enter-active {
    --lightbox-tool-x: 3.5rem;
    --lightbox-tool-y: 3.5rem;
}

.lightbox-tool-top-right-enter-active {
    --lightbox-tool-x: 0;
    --lightbox-tool-y: 3.5rem;
    animation-duration: 180ms;
}

.lightbox-tool-bottom-left-enter-active {
    --lightbox-tool-x: 3.5rem;
    --lightbox-tool-y: 0;
    animation-duration: 360ms;
}

.lightbox-tool-bottom-right-enter-active {
    --lightbox-tool-x: 0;
    --lightbox-tool-y: 0;
    animation-duration: 120ms;
}

@keyframes lightbox-tool-in {
    from {
        opacity: 0;
        transform: translate(var(--lightbox-tool-x), var(--lightbox-tool-y))
            scale(0.9);
    }
    to {
        opacity: 1;
        transform: translate(0, 0) scale(1);
    }
}

@media (prefers-reduced-motion: reduce) {
    .lightbox-tool-top-left-enter-active,
    .lightbox-tool-top-right-enter-active,
    .lightbox-tool-bottom-left-enter-active,
    .lightbox-tool-bottom-right-enter-active {
        animation-duration: 1ms;
    }
}
</style>
