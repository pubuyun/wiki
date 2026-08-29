<template>
    <div
        v-if="viewer.status === 'loading'"
        class="grid h-full min-h-64 place-items-center bg-secondary p-6 text-lg text-on-secondary/70 dark:bg-zinc-900 dark:text-zinc-300"
        role="status"
    >
        Loading plasmid map...
    </div>
    <div
        v-else-if="viewer.errorMessage"
        class="grid h-full min-h-64 place-items-center bg-secondary p-6 text-center text-lg text-red-600 dark:bg-zinc-900 dark:text-red-400"
        role="alert"
    >
        {{ viewer.errorMessage }}
    </div>
    <div
        v-else-if="viewer.svg"
        ref="mapElement"
        class="plasmid-map h-full min-h-64 w-full overflow-hidden"
        @click="handleClick"
        @keydown="handleKeydown"
        v-html="viewer.svg"
    />
    <div
        v-else
        class="grid h-full min-h-64 place-items-center bg-secondary p-6 text-lg text-on-secondary/70 dark:bg-zinc-900 dark:text-zinc-300"
    >
        No plasmid data available.
    </div>
</template>

<script setup lang="ts">
import type { PlasmidViewerState } from "~/composables/usePlasmidViewer";

const props = defineProps<{
    viewer: PlasmidViewerState;
}>();

const mapElement = ref<HTMLElement | null>(null);

function featureIndexFromTarget(target: EventTarget | null) {
    if (!(target instanceof Element)) return undefined;
    const feature = target.closest<SVGElement>("path.feature[data-fi]");
    const index = Number(feature?.dataset.fi);
    return Number.isInteger(index) ? index : undefined;
}

function handleClick(event: MouseEvent) {
    const index = featureIndexFromTarget(event.target);
    if (index !== undefined) props.viewer.selectFeature(index);
}

function handleKeydown(event: KeyboardEvent) {
    if (event.key !== "Enter" && event.key !== " ") return;
    const index = featureIndexFromTarget(event.target);
    if (index === undefined) return;
    event.preventDefault();
    props.viewer.selectFeature(index);
}

async function decorateFeatures() {
    await nextTick();
    if (!mapElement.value) return;

    for (const feature of mapElement.value.querySelectorAll<SVGElement>(
        "path.feature[data-fi]",
    )) {
        const index = Number(feature.dataset.fi);
        const name = feature.dataset.name || "Feature";
        const start = feature.dataset.start || "";
        const end = feature.dataset.end || "";
        feature.setAttribute("role", "button");
        feature.setAttribute("tabindex", "0");
        feature.setAttribute("aria-label", `${name}, ${start} to ${end}`);
        feature.toggleAttribute(
            "data-selected",
            index === props.viewer.selectedIndex,
        );
    }
}

watch(
    () => [props.viewer.svg, props.viewer.selectedIndex],
    () => void decorateFeatures(),
    { immediate: true },
);
</script>

<style scoped>
.plasmid-map {
    --plasmid-background: var(--secondary);
    --plasmid-ink: var(--on-secondary);
    --plasmid-muted: color-mix(
        in srgb,
        var(--on-secondary) 62%,
        var(--secondary)
    );
    --plasmid-soft: color-mix(
        in srgb,
        var(--on-secondary) 30%,
        var(--secondary)
    );
    background: var(--plasmid-background);
    color: var(--plasmid-ink);
}

.plasmid-map :deep(svg) {
    display: block;
    width: 100%;
    height: 100%;
    transform: scale(1.07);
    transform-origin: center;
}

.plasmid-map :deep(svg > rect:first-of-type) {
    fill: var(--plasmid-background);
}

.plasmid-map :deep(svg > circle) {
    stroke: var(--plasmid-ink);
}

.plasmid-map :deep(svg > line) {
    stroke: var(--plasmid-muted);
}

.plasmid-map :deep(svg > polyline) {
    stroke: var(--plasmid-soft);
}

.plasmid-map :deep(svg > text) {
    pointer-events: none;
    paint-order: stroke fill;
    stroke: var(--plasmid-background);
    stroke-width: 1px;
    stroke-linejoin: round;
}

.plasmid-map :deep(svg > text[font-size="10"]) {
    font-size: 14px;
}

.plasmid-map :deep(svg > text[font-size="11"]) {
    font-size: 16px;
}

.plasmid-map :deep(svg > text[font-size="14.00"]) {
    font-size: 18px;
}

.plasmid-map :deep(svg > text[font-size="20.00"]) {
    font-size: 28px;
}

/* Curved feature names already sit on solid feature arcs; a halo obscures them. */
.plasmid-map :deep(svg > text:has(textPath)) {
    paint-order: normal;
    stroke: none;
}

.plasmid-map :deep(svg > text[fill="#202124"]) {
    fill: var(--plasmid-ink);
}

.plasmid-map :deep(svg > text[fill="#5f6368"]),
.plasmid-map :deep(svg > text[fill="#9aa0a6"]),
.plasmid-map :deep(svg > text[fill="#3c4043"]) {
    fill: var(--plasmid-muted);
}

.plasmid-map :deep(path.feature) {
    transition:
        filter 150ms ease,
        opacity 150ms ease,
        stroke-width 150ms ease;
}

.plasmid-map :deep(path.feature:hover),
.plasmid-map :deep(path.feature:focus-visible),
.plasmid-map :deep(path.feature[data-selected]) {
    filter: drop-shadow(
        0 0 5px color-mix(in srgb, var(--color-primary) 75%, transparent)
    );
    opacity: 1;
    stroke-width: 4;
    outline: none;
}
</style>

<style>
body.dark .plasmid-map {
    --plasmid-background: #18181b;
    --plasmid-ink: #f4f4f5;
    --plasmid-muted: #a1a1aa;
    --plasmid-soft: #52525b;
}
</style>
