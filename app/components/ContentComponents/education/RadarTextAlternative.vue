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
    <details class="radar-text-alternative">
        <summary class="radar-alternative-summary">
            <span class="radar-alternative-icon" aria-hidden="true">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <rect x="5" y="3" width="14" height="18" rx="3" />
                    <path d="M9 8h6M9 12h6M9 16h3" />
                </svg>
            </span>
            <span class="radar-alternative-title">Graph text alternative</span>
            <span class="radar-alternative-toggle" aria-hidden="true">
                <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="m5 7.5 5 5 5-5" />
                </svg>
            </span>
        </summary>
        <div class="radar-alternative-content">
            <p v-if="explanation" class="radar-alternative-intro">
                {{ explanation }}
            </p>
            <ul class="radar-alternative-dimensions" role="list">
                <li
                    v-for="(dimension, index) in dimensions"
                    :key="dimension.key"
                    class="radar-alternative-dimension"
                >
                    <div class="radar-alternative-dimension-heading">
                        <strong>{{ dimension.label }}</strong>
                        <span
                            v-if="!beforeDimensions || !dimension.developable"
                            class="radar-alternative-score"
                            >{{ dimension.score }} <span>/ 5</span></span
                        >
                        <span v-else class="radar-alternative-change"
                            >Change:
                            {{
                                change(
                                    beforeDimensions[index]!.score,
                                    dimension.score,
                                )
                            }}
                            points</span
                        >
                    </div>
                    <template v-if="beforeDimensions && dimension.developable">
                        <div class="radar-alternative-comparison">
                            <p>
                                <span>Before activity</span
                                ><strong
                                    >{{ beforeDimensions[index]!.score }} /
                                    5</strong
                                >
                            </p>
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 20 20"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M3 10h14m-5-5 5 5-5 5" />
                            </svg>
                            <p>
                                <span>After activity</span
                                ><strong>{{ dimension.score }} / 5</strong>
                            </p>
                        </div>
                    </template>
                    <p
                        v-if="dimension.explanation"
                        class="radar-alternative-description"
                    >
                        {{ dimension.explanation }}
                    </p>
                    <p
                        v-if="beforeDimensions && !dimension.developable"
                        class="radar-alternative-reference"
                    >
                        Fixed reference
                    </p>
                </li>
            </ul>
        </div>
    </details>
</template>

<style scoped>
.radar-text-alternative {
    container-type: inline-size;
    border: 1px solid color-mix(in srgb, var(--outline) 50%, transparent);
    border-radius: 1.25rem;
    background: color-mix(in srgb, var(--surface) 45%, var(--secondary));
    color: var(--on-secondary);
    font-family: var(--font-main);
    font-size: 1rem;
    line-height: 1.6;
    overflow-wrap: anywhere;
}

.radar-alternative-summary {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 4.5rem;
    padding: 0.875rem 1rem;
    border-radius: inherit;
    list-style: none;
    cursor: pointer;
    transition: background-color 160ms ease;
}

.radar-alternative-summary::-webkit-details-marker {
    display: none;
}

.radar-alternative-summary:hover {
    background: color-mix(in srgb, var(--primary) 9%, transparent);
}

.radar-alternative-summary:focus-visible {
    outline: 3px solid var(--primary);
    outline-offset: 4px;
}

.radar-alternative-icon,
.radar-alternative-toggle {
    display: grid;
    flex-shrink: 0;
    place-items: center;
}

.radar-alternative-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.8rem;
    background: var(--accent);
    color: var(--on-accent);
}

.radar-alternative-icon svg {
    width: 1.4rem;
    height: 1.4rem;
}

.radar-alternative-title {
    flex: 1;
    min-width: 0;
    font-family: var(--font-belanosima);
    font-size: 1.25rem;
    line-height: 1.25;
}

.radar-alternative-toggle {
    width: 1.75rem;
    height: 1.75rem;
    color: var(--primary);
    transition: transform 160ms ease;
}

.radar-alternative-toggle svg {
    width: 1.25rem;
    height: 1.25rem;
}

details[open] .radar-alternative-toggle {
    transform: rotate(180deg);
}

.radar-alternative-content {
    margin-inline: 1rem;
    padding-block: 1rem;
    border-top: 1px solid color-mix(in srgb, var(--outline) 30%, transparent);
}

.radar-alternative-intro {
    margin: 0 0 1.25rem;
}

.radar-alternative-dimensions {
    display: grid;
    gap: 0.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
}

.radar-alternative-dimension {
    min-width: 0;
    padding: 1rem;
    border: 1px solid color-mix(in srgb, var(--outline) 22%, transparent);
    border-radius: 1rem;
    background: var(--secondary);
}

.radar-alternative-dimension-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem 0.75rem;
    line-height: 1.4;
}

.radar-alternative-dimension-heading > strong {
    font-weight: 650;
}

.radar-alternative-score,
.radar-alternative-change {
    padding: 0.25rem 0.625rem;
    border-radius: 0.625rem;
    font-size: 0.875rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
}

.radar-alternative-score {
    background: color-mix(in srgb, var(--primary) 12%, var(--secondary));
}

.radar-alternative-score > span {
    font-weight: 400;
}

.radar-alternative-change {
    background: var(--accent);
    color: var(--on-accent);
}

.radar-alternative-description {
    margin: 0.625rem 0 0;
    font-size: 0.9375rem;
}

.radar-alternative-reference {
    margin: 0.5rem 0 0;
    font-size: 0.8125rem;
}

.radar-alternative-comparison {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 1.25rem minmax(0, 1fr);
    align-items: center;
    gap: 0.625rem;
    margin-top: 0.875rem;
}

.radar-alternative-comparison p {
    display: grid;
    gap: 0.125rem;
    margin: 0;
}

.radar-alternative-comparison span {
    font-size: 0.8125rem;
}

.radar-alternative-comparison strong {
    font-size: 1.125rem;
    font-variant-numeric: tabular-nums;
}

.radar-alternative-comparison svg {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--primary);
}

@container (min-width: 36rem) {
    .radar-alternative-summary {
        padding-inline: 1.25rem;
    }

    .radar-alternative-content {
        margin-inline: 1.25rem;
        padding-block: 1.25rem;
    }

    .radar-alternative-dimensions {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-auto-rows: 1fr;
    }
}

:global(.high-contrast .radar-text-alternative),
:global(.high-contrast .radar-alternative-content),
:global(.high-contrast .radar-alternative-dimension) {
    border-color: var(--outline);
}

@media (prefers-reduced-motion: reduce) {
    .radar-alternative-summary,
    .radar-alternative-toggle {
        transition: none;
    }
}

@media (forced-colors: active) {
    .radar-text-alternative,
    .radar-alternative-content,
    .radar-alternative-dimension {
        border-color: CanvasText;
    }
}
</style>
