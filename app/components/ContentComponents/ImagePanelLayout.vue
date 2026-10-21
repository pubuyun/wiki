<script setup lang="ts">
import { computed, ref } from "vue";
import panelImageDimensions from "~/data/panel-image-dimensions.json";
import VideoPanel from "./VideoPanel.vue";

const props = withDefaults(
    defineProps<{
        src: string[];
        alt?: string | string[];
        label?: string;
        imageBackground?: string;
        autoLabels?: boolean;
        layout?: "grid" | "stack" | "top" | "left" | "right";
        columns?: number | string;
        mediaType?: "image" | "video";
        videoAspectRatio?: "16 / 9" | "4 / 5";
    }>(),
    {
        autoLabels: true,
        label: "Figure panels",
        layout: "grid",
        columns: 2,
        mediaType: "image",
        videoAspectRatio: "16 / 9",
    },
);

const emit = defineEmits<{ open: [index: number] }>();
const imageAlt = (index: number) =>
    Array.isArray(props.alt) ? (props.alt[index] ?? "") : (props.alt ?? "");

const aspectRatios = ref<Record<string, number>>({});
const dimensions: Record<string, number[]> = panelImageDimensions;
const aspectRatio = (src: string) => {
    const size = dimensions[src];
    return size ? size[0] / size[1] : (aspectRatios.value[src] ?? 1);
};
const sideColumns = computed(() => {
    const singleIndex = props.layout === "right" ? 2 : 0;
    const singleRatio = aspectRatio(props.src[singleIndex]);
    const stackedHeight = props.src.reduce(
        (sum, src, index) =>
            index === singleIndex ? sum : sum + 1 / aspectRatio(src),
        0,
    );
    // Include the gap between stacked images when balancing column heights.
    const stackedWidth = `minmax(0, calc((100% - ${1 + singleRatio} * var(--panel-gap)) / ${1 + singleRatio * stackedHeight}))`;
    return props.layout === "right"
        ? `${stackedWidth} minmax(0, 1fr)`
        : `minmax(0, 1fr) ${stackedWidth}`;
});
const rows = computed(() => {
    const columns = Number(props.columns);
    const gridColumns = Number.isInteger(columns) && columns > 0 ? columns : 2;
    const rowSize = props.layout === "stack" ? 1 : gridColumns;
    const panels = props.src.map((src, index) => ({ src, index }));
    if (props.layout === "top" && panels.length === 3) {
        return [panels.slice(0, 1), panels.slice(1)];
    }
    if (["left", "right"].includes(props.layout) && panels.length === 3)
        return [panels];
    return Array.from(
        { length: Math.ceil(panels.length / rowSize) },
        (_, row) => panels.slice(row * rowSize, (row + 1) * rowSize),
    );
});

function recordAspectRatio(src: string, image: HTMLImageElement | null) {
    // Cached images can finish loading before hydration attaches the load handler.
    // The template ref also reads their dimensions when they mount or update.
    if (image?.naturalWidth && image.naturalHeight) {
        aspectRatios.value[src] = image.naturalWidth / image.naturalHeight;
    }
}
</script>

<template>
    <div class="image-panels" role="group" :aria-label="label">
        <div class="image-panels__grid">
            <div
                v-for="(row, rowIndex) in rows"
                :key="rowIndex"
                class="image-panels__row"
                :class="{
                    'image-panels__row--left':
                        layout === 'left' && src.length === 3,
                    'image-panels__row--right':
                        layout === 'right' && src.length === 3,
                }"
                :style="{
                    gridTemplateColumns:
                        (layout === 'left' || layout === 'right') && src.length === 3
                            ? sideColumns
                            : row
                                  .map(
                                      ({ src }) =>
                                          `minmax(0, ${aspectRatio(src)}fr)`,
                                  )
                                  .join(' '),
                }"
            >
                <template
                    v-for="{ src: imageSrc, index } in row"
                    :key="`${imageSrc}-${index}`"
                >
                    <VideoPanel
                        v-if="mediaType === 'video'"
                        :src="imageSrc"
                        :title="imageAlt(index) || `Video ${index + 1}`"
                        :aspect-ratio="videoAspectRatio"
                    >
                        <span
                            v-if="autoLabels"
                            class="image-panels__label"
                            aria-hidden="true"
                        >
                            ({{ String.fromCharCode(97 + index) }})
                        </span>
                    </VideoPanel>
                    <button
                        v-else
                        type="button"
                        class="image-panels__panel cursor-zoom-in rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
                        :aria-label="`${autoLabels ? `(${String.fromCharCode(97 + index)}) ` : ''}Open image ${index + 1} of ${src.length}${imageAlt(index) ? `: ${imageAlt(index)}` : ''}`"
                        @click="emit('open', index)"
                    >
                        <img
                            :ref="
                                (el) =>
                                    recordAspectRatio(
                                        imageSrc,
                                        el as HTMLImageElement | null,
                                    )
                            "
                            :src="imageSrc"
                            :alt="imageAlt(index)"
                            :width="dimensions[imageSrc]?.[0]"
                            :height="dimensions[imageSrc]?.[1]"
                            :style="{
                                backgroundColor: imageBackground,
                                aspectRatio: `auto ${aspectRatio(imageSrc)}`,
                            }"
                            class="rounded-2xl"
                            loading="lazy"
                            decoding="async"
                            @load="
                                recordAspectRatio(
                                    imageSrc,
                                    $event.currentTarget as HTMLImageElement,
                                )
                            "
                        />
                        <span
                            v-if="autoLabels"
                            class="image-panels__label"
                            aria-hidden="true"
                        >
                            ({{ String.fromCharCode(97 + index) }})
                        </span>
                    </button>
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped>
.image-panels {
    container-type: inline-size;
    min-width: 0;
    margin-block: 1rem;
}

.image-panels__grid {
    display: grid;
    gap: 0.75rem;
}

/* Proportional columns give each image in a row the same uncropped height. */
.image-panels__row {
    --panel-gap: 0.75rem;
    display: grid;
    align-items: start;
    gap: var(--panel-gap);
}

.image-panels__panel {
    position: relative;
    display: block;
    width: 100%;
    min-width: 0;
    margin: 0;
    padding: 0;
}

.image-panels__panel img {
    display: block;
    width: 100%;
    height: auto;
    margin: 0;
}

.image-panels__row--left > :first-child {
    grid-row: span 2;
}

.image-panels__row--left > :not(:first-child) {
    grid-column: 2;
}

.image-panels__row--right > :first-child {
    grid-area: 1 / 1;
}

.image-panels__row--right > :nth-child(2) {
    grid-area: 2 / 1;
}

.image-panels__row--right > :last-child {
    grid-area: 1 / 2 / span 2;
}

.image-panels__row--left,
.image-panels__row--right {
    align-items: stretch;
}

.image-panels__row--left > :first-child img,
.image-panels__row--right > :last-child img {
    position: absolute;
    inset: 0;
    height: 100%;
    object-fit: contain;
}

.image-panels__label {
    position: absolute;
    inset: 0.4rem auto auto 0.4rem;
    padding: 0.1rem 0.35rem;
    border-radius: 0.25rem;
    background: #fff;
    color: #111;
    font-family: "Times New Roman", serif;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.25;
    pointer-events: none;
}

@container (width < 24rem) {
    .image-panels__row {
        grid-template-columns: minmax(0, 1fr) !important;
    }
    .image-panels__row--left > *,
    .image-panels__row--right > * {
        grid-row: auto;
        grid-column: auto;
    }
    .image-panels__row--left > :first-child img,
    .image-panels__row--right > :last-child img {
        position: static;
        height: auto;
    }
}
</style>
