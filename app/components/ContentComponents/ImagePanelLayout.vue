<script setup lang="ts">
import { computed, ref } from "vue";

const props = withDefaults(
    defineProps<{
        src: string[];
        alt?: string | string[];
        label?: string;
        imageBackground?: string;
        autoLabels?: boolean;
        layout?: "grid" | "stack";
    }>(),
    { autoLabels: true, label: "Figure panels", layout: "grid" },
);

const emit = defineEmits<{ open: [index: number] }>();
const imageAlt = (index: number) =>
    Array.isArray(props.alt) ? (props.alt[index] ?? "") : (props.alt ?? "");

const aspectRatios = ref<Record<string, number>>({});
const rows = computed(() => {
    const rowSize = props.layout === "stack" ? 1 : 2;
    const panels = props.src.map((src, index) => ({ src, index }));
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
                :style="{
                    gridTemplateColumns: row
                        .map(
                            ({ src }) =>
                                `minmax(0, ${aspectRatios[src] ?? 1}fr)`,
                        )
                        .join(' '),
                }"
            >
                <button
                    v-for="{ src: imageSrc, index } in row"
                    :key="`${imageSrc}-${index}`"
                    type="button"
                    class="image-panels__panel cursor-zoom-in rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
                    :aria-label="`Open image ${index + 1} of ${src.length}${imageAlt(index) ? `: ${imageAlt(index)}` : ''}`"
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
                        :style="{ backgroundColor: imageBackground }"
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
    display: grid;
    align-items: start;
    gap: 0.75rem;
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
}
</style>
