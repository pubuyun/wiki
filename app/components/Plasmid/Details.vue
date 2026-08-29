<template>
    <div
        class="h-full min-h-0 overflow-y-auto bg-secondary p-4 text-lg text-on-secondary dark:bg-zinc-900 dark:text-zinc-100"
    >
        <div
            v-if="viewer.status === 'loading'"
            class="grid h-full min-h-48 place-items-center text-lg text-on-secondary/70 dark:text-zinc-300"
            role="status"
        >
            Loading plasmid information...
        </div>
        <div
            v-else-if="viewer.errorMessage"
            class="grid h-full min-h-48 place-items-center p-4 text-center text-lg text-red-600 dark:text-red-400"
            role="alert"
        >
            {{ viewer.errorMessage }}
        </div>
        <div v-else-if="viewer.displayRecord" class="flex flex-col gap-3">
            <dl
                class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 rounded-lg border border-surface-bright/60 p-3 text-lg dark:border-zinc-700"
            >
                <dt class="text-on-secondary/65 dark:text-zinc-400">Length</dt>
                <dd class="text-right font-semibold">
                    {{ formatBasePairs(viewer.displayRecord.sequence.length) }}
                </dd>
                <dt class="text-on-secondary/65 dark:text-zinc-400">
                    Topology
                </dt>
                <dd class="text-right font-semibold">
                    {{ viewer.displayRecord.circular ? "Circular" : "Linear" }}
                </dd>
                <dt class="text-on-secondary/65 dark:text-zinc-400">
                    Features
                </dt>
                <dd class="text-right font-semibold">
                    {{ viewer.features.length }}
                </dd>
            </dl>

            <section
                v-if="viewer.selectedFeature"
                class="rounded-lg border-2 border-primary bg-primary/10 p-3 dark:bg-zinc-800"
                aria-live="polite"
            >
                <div class="mb-3 flex items-start gap-2">
                    <span
                        class="mt-1 size-3 shrink-0 rounded-sm border"
                        :style="selectedFeatureSwatchStyle"
                        aria-hidden="true"
                    />
                    <div class="min-w-0">
                        <h2 class="font-semibold break-words">
                            {{ viewer.selectedFeature.name }}
                        </h2>
                        <p
                            class="text-base text-on-secondary/65 dark:text-zinc-400"
                        >
                            {{ viewer.selectedFeature.type || "Feature" }}
                        </p>
                    </div>
                </div>
                <dl
                    class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 text-base"
                >
                    <dt class="text-on-secondary/65 dark:text-zinc-400">
                        Range
                    </dt>
                    <dd class="text-right font-medium">
                        {{ formatCoordinateRange(viewer.selectedFeature) }}
                    </dd>
                    <dt class="text-on-secondary/65 dark:text-zinc-400">
                        Length
                    </dt>
                    <dd class="text-right font-medium">
                        {{ formatBasePairs(viewer.selectedFeatureLength) }}
                    </dd>
                    <dt class="text-on-secondary/65 dark:text-zinc-400">
                        Strand
                    </dt>
                    <dd class="text-right font-medium">
                        {{ formatStrand(viewer.selectedFeature.strand) }}
                    </dd>
                    <template
                        v-for="[key, values] in viewer.selectedFeatureDetails"
                        :key="key"
                    >
                        <dt
                            class="text-on-secondary/65 capitalize dark:text-zinc-400"
                        >
                            {{ key.replaceAll("_", " ") }}
                        </dt>
                        <dd class="text-right break-words">
                            {{ values.join(", ") }}
                        </dd>
                    </template>
                </dl>
            </section>

            <details
                open
                class="rounded-lg border border-surface-bright/60 p-3 dark:border-zinc-700"
            >
                <summary class="cursor-pointer font-semibold">
                    Features · {{ viewer.features.length }}
                </summary>
                <div class="mt-3 flex flex-col gap-1">
                    <button
                        v-for="(feature, index) in viewer.features"
                        :key="`${feature.name}:${feature.start}:${feature.end}:${index}`"
                        type="button"
                        class="feature-button grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-2 py-2.5 text-left text-base transition-colors hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-outline dark:hover:bg-zinc-800"
                        :aria-pressed="viewer.selectedIndex === index"
                        @click="viewer.selectFeature(index)"
                    >
                        <span
                            class="size-3 shrink-0 rounded-sm border"
                            :style="featureSwatchStyle(feature)"
                            aria-hidden="true"
                        />
                        <span class="min-w-0 truncate">
                            {{ feature.name }}
                        </span>
                        <span class="font-mono text-base opacity-70">
                            {{ feature.start.toLocaleString() }}–{{
                                feature.end.toLocaleString()
                            }}
                        </span>
                    </button>
                </div>
            </details>
        </div>
    </div>
</template>

<script setup lang="ts">
import { featureColor, type Feature, type Strand } from "@carabennemsi/plasmid";
import type { PlasmidViewerState } from "~/composables/usePlasmidViewer";

const props = defineProps<{
    viewer: PlasmidViewerState;
}>();

const selectedFeatureSwatchStyle = computed(() => {
    const feature = props.viewer.selectedFeature;
    return feature
        ? featureSwatchStyle(feature)
        : { backgroundColor: "transparent", borderColor: "transparent" };
});

function formatBasePairs(value: number) {
    return `${value.toLocaleString()} bp`;
}

function formatCoordinateRange(feature: Feature) {
    return `${feature.start.toLocaleString()}–${feature.end.toLocaleString()}`;
}

function formatStrand(strand: Strand | undefined) {
    if (strand === 1) return "Forward (+)";
    if (strand === -1) return "Reverse (−)";
    return "Unstranded";
}

function featureSwatchStyle(feature: Feature) {
    const color = featureColor(feature.name, feature.type);
    return {
        backgroundColor: color.fill,
        borderColor: color.border,
    };
}
</script>

<style scoped>
.feature-button[aria-pressed="true"],
.feature-button[aria-pressed="true"]:hover,
.feature-button[aria-pressed="true"]:focus-visible {
    background: var(--primary);
    color: var(--on-primary);
}
</style>
