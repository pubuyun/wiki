<script setup lang="ts">
import type { TargetProfileDimension } from "~/utils/target-profile";

defineProps<{
    dimensions: TargetProfileDimension[];
    beforeDimensions?: TargetProfileDimension[];
    explanation?: string;
}>();

function change(before: number, after: number) {
    const difference = Number((after - before).toFixed(2));
    return `${difference > 0 ? "+" : ""}${difference}`;
}
</script>

<template>
    <details
        class="radar-text-alternative rounded-xl border border-outline px-4 py-3 sm:px-5"
    >
        <summary
            class="min-h-11 cursor-pointer content-center rounded font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-outline"
        >
            Graph text alternative
        </summary>
        <p v-if="explanation" class="mt-3 mb-4 leading-relaxed">
            {{ explanation }}
        </p>
        <ul class="mt-3 mb-0 space-y-4 pl-5 leading-relaxed">
            <li v-for="(dimension, index) in dimensions" :key="dimension.key">
                <template v-if="beforeDimensions && dimension.developable">
                    <strong>{{ dimension.label }}</strong>
                    <p class="my-1">
                        Before activity:
                        {{ beforeDimensions[index]!.score }} / 5 → After
                        activity: {{ dimension.score }} / 5.
                    </p>
                    <p class="my-1">{{ dimension.explanation }}</p>
                    <p class="my-1">
                        Change:
                        {{
                            change(
                                beforeDimensions[index]!.score,
                                dimension.score,
                            )
                        }}
                        points.
                    </p>
                </template>
                <template v-else>
                    <strong
                        >{{ dimension.label }}: {{ dimension.score }}</strong
                    >
                    <template v-if="dimension.explanation">
                        ({{ dimension.explanation }})
                    </template>
                    <span v-if="beforeDimensions"> · Fixed reference.</span>
                </template>
            </li>
        </ul>
    </details>
</template>

<style scoped>
.radar-text-alternative {
    font-family: var(--font-main);
    overflow-wrap: anywhere;
}
</style>
