<script setup lang="ts">
import { NuxtLink } from "#components";
import timeline from "~/data/education/agegroup.json";

const hoveredGroup = ref<string | null>(null);
const focusedGroup = ref<string | null>(null);
const selectedGroup = ref<string | null>(null);
const activeGroup = computed(
    () => selectedGroup.value ?? hoveredGroup.value ?? focusedGroup.value,
);
const groups = timeline.ageGroups;
const activities = timeline.activities;
type Activity = (typeof activities)[number];
const groupFor = (id: string) => groups.find((group) => group.id === id)!;
const solidConnected = (activity: Activity) =>
    !!activeGroup.value && activity.solid.includes(activeGroup.value);
const dashedConnected = (activity: Activity) =>
    !!activeGroup.value && activity.dashed.includes(activeGroup.value);
const connected = (activity: Activity) =>
    !!activeGroup.value &&
    [...activity.solid, ...activity.dashed].includes(activeGroup.value);

// Activities shared by two primary audiences follow the selected solid connection.
function activityColor(activity: Activity) {
    const id =
        activeGroup.value && activity.solid.includes(activeGroup.value)
            ? activeGroup.value
            : activity.solid[0]!;
    return groupFor(id).color;
}

const connections = computed(() => {
    if (!activeGroup.value) return [];
    const group = groupFor(activeGroup.value);
    const startX = group.x + group.width / 2;
    return activities.filter(connected).map((activity) => {
        const below = activity.y > 470;
        const startY = group.id === "public" ? (below ? 520 : 472) : 342;
        const endY = activity.y + ((below ? -1 : 1) * activity.height) / 2;
        const bend = Math.max(34, Math.abs(endY - startY) * 0.58);
        const direction = below ? 1 : -1;
        return {
            id: activity.id,
            dashed: activity.dashed.includes(group.id),
            path: `M ${startX} ${startY} C ${startX + (activity.x - startX) * 0.56} ${startY + direction * bend}, ${activity.x + (startX - activity.x) * 0.08} ${endY - direction * bend * 0.45}, ${activity.x} ${endY}`,
        };
    });
});

function clearSelection() {
    selectedGroup.value = null;
    hoveredGroup.value = null;
    focusedGroup.value = null;
}

function toggleGroup(id: string) {
    if (selectedGroup.value === id) {
        clearSelection();
        return;
    }
    selectedGroup.value = id;
}
</script>

<template>
    <div
        class="age-timeline"
        role="region"
        aria-label="Education activities by age group"
        tabindex="0"
        @keydown.esc="clearSelection"
    >
        <h2 class="age-timeline__title">Activities and Related Age Groups</h2>
        <div class="age-timeline__viewport">
            <div class="age-timeline__board">
                <svg
                    class="age-timeline__connections"
                    viewBox="0 0 1040 590"
                    aria-hidden="true"
                >
                    <path
                        v-for="connection in connections"
                        :key="connection.id"
                        :d="connection.path"
                        :stroke="groupFor(activeGroup!).color"
                        :class="[
                            'age-timeline__connection',
                            connection.dashed
                                ? 'age-timeline__connection--dashed'
                                : 'age-timeline__connection--solid',
                        ]"
                    />
                    <path
                        class="age-timeline__arrow"
                        d="M 8 463 H 1030 M 1016 449 L 1032 463 L 1016 477"
                    />
                </svg>

                <component
                    :is="activity.href ? NuxtLink : 'span'"
                    v-for="activity in activities"
                    :key="activity.id"
                    :to="activity.href || undefined"
                    class="age-timeline__activity"
                    :class="{
                        'is-solid-connected': solidConnected(activity),
                        'is-dashed-connected': dashedConnected(activity),
                        'is-muted': activeGroup && !connected(activity),
                    }"
                    :style="{
                        left: `${activity.x / 10.4}%`,
                        top: `${activity.y / 5.9}%`,
                        width: `${activity.width / 10.4}%`,
                        minHeight: `${activity.height / 5.9}%`,
                        '--activity-color': activityColor(activity),
                    }"
                >
                    <span
                        v-for="(line, index) in activity.label"
                        :key="index"
                        >{{ line }}</span
                    >
                </component>

                <button
                    v-for="group in groups"
                    :key="group.id"
                    type="button"
                    class="age-timeline__group"
                    :class="[
                        `age-timeline__group--${group.id}`,
                        { 'is-active': activeGroup === group.id },
                    ]"
                    :style="{
                        left: `${group.x / 10.4}%`,
                        width: `${group.width / 10.4}%`,
                        '--group-color': group.color,
                    }"
                    :aria-label="group.label.join(' ')"
                    :aria-pressed="selectedGroup === group.id"
                    @mouseenter="hoveredGroup = group.id"
                    @mouseleave="hoveredGroup = null"
                    @focus="focusedGroup = group.id"
                    @blur="focusedGroup = null"
                    @click="toggleGroup(group.id)"
                >
                    <span v-for="(line, index) in group.label" :key="index">{{
                        line
                    }}</span>
                </button>
                <p
                    class="age-timeline__sr-only"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {{
                        activeGroup
                            ? `${groupFor(activeGroup).label.join(" ")}: ${activities
                                  .filter(connected)
                                  .map((activity) => activity.label.join(" "))
                                  .join("; ")}.`
                            : ""
                    }}
                </p>
            </div>
        </div>
        <div class="age-timeline__legend" role="group" aria-label="Connection legend">
            <span class="age-timeline__legend-item">
                <span
                    class="age-timeline__legend-line age-timeline__legend-line--solid"
                    aria-hidden="true"
                ></span>
                Solid: Directly designed for this age group
            </span>
            <span class="age-timeline__legend-item">
                <span
                    class="age-timeline__legend-line age-timeline__legend-line--dashed"
                    aria-hidden="true"
                ></span>
                Dashed: Related activity
            </span>
        </div>
    </div>
</template>

<style scoped>
.age-timeline {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    box-sizing: border-box;
    height: calc(100dvh - var(--category-header-height, 3rem) - 2rem);
    max-width: 100%;
    border-radius: 1.25rem;
    background: var(--surface);
    margin-block: 1rem;
    padding: 0.75rem 0.25rem;
    font-family: var(--font-belanosima);
}
.age-timeline__title {
    margin: 0 0 1rem;
    padding-inline: 0.75rem;
    color: var(--on-surface);
    font-size: clamp(1.25rem, 2.5vw, 2rem);
    font-weight: 400;
    line-height: 1.2;
    text-align: center;
}
.age-timeline__viewport {
    min-height: 0;
    min-width: 0;
    container-type: size;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: thin;
    scrollbar-color: var(--primary) transparent;
}
.age-timeline__board {
    position: relative;
    isolation: isolate;
    container-type: inline-size;
    width: min(100%, calc(100cqh * 1040 / 590));
    min-width: min(46rem, calc(100cqh * 1040 / 590));
    margin-inline: auto;
    aspect-ratio: 1040 / 590;
}
.age-timeline__connections {
    position: absolute;
    z-index: 1;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
}
.age-timeline__connection {
    fill: none;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
}
.age-timeline__connection--solid {
    stroke-width: 4;
}
.age-timeline__connection--dashed {
    stroke-width: 2.5;
    stroke-dasharray: 9 6;
    opacity: 0.58;
}
.age-timeline__arrow {
    fill: none;
    stroke: var(--on-surface);
    stroke-width: 8;
    stroke-linecap: round;
    stroke-linejoin: round;
}
.age-timeline__activity {
    position: absolute;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.22em 0.35em;
    transform: translate(-50%, -50%);
    border: 2px solid transparent;
    border-radius: 2rem;
    background: var(--activity-color);
    color: #031323;
    font-size: 1.48cqi;
    font-weight: 400;
    line-height: 1.02;
    text-align: center;
    text-decoration: none;
    overflow-wrap: normal;
    transition:
        opacity 160ms ease,
        box-shadow 160ms ease;
}
.age-timeline__activity.is-solid-connected {
    box-shadow:
        0 0 0 2px var(--surface),
        0 0 0 4px var(--activity-color);
    opacity: 1;
}
.age-timeline__activity.is-dashed-connected {
    opacity: 0.62;
    box-shadow: 0 0 0 1px
        color-mix(in srgb, var(--activity-color) 55%, transparent);
}
.age-timeline__activity.is-muted {
    opacity: 0.3;
}
.age-timeline__activity > span,
.age-timeline__group > span {
    white-space: nowrap;
}
a.age-timeline__activity:hover,
a.age-timeline__activity:focus-visible {
    opacity: 1;
    text-decoration: underline;
    text-underline-offset: 0.15em;
}
.age-timeline__group {
    position: absolute;
    top: 57.97%;
    height: 19.32%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.25em;
    border: 0;
    border-radius: 2rem;
    background: var(--group-color);
    color: #082c51;
    font: inherit;
    font-size: 3cqi;
    line-height: 1.12;
    cursor: pointer;
    transition: box-shadow 160ms ease;
}
.age-timeline__group--primary {
    border-radius: 2rem 0 0 2rem;
}
.age-timeline__group--secondary {
    border-radius: 0;
}
.age-timeline__group--high-school {
    border-radius: 0 2rem 2rem 0;
}
.age-timeline__group--public {
    top: 80%;
    height: 8.14%;
    border-radius: 2rem;
}
.age-timeline__group.is-active {
    box-shadow: inset 0 0 0 3px color-mix(in srgb, #082c51 55%, transparent);
}
.age-timeline:focus-visible,
.age-timeline__group:focus-visible,
.age-timeline__activity:focus-visible {
    outline: 3px solid var(--on-surface);
    outline-offset: 3px;
}
.age-timeline__sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
}
.age-timeline__legend {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem 1.5rem;
    padding: 0.45rem 0.25rem 0.1rem;
    color: var(--on-surface);
    font-family: var(--font-main);
    font-size: clamp(0.72rem, 1.3vw, 0.95rem);
    line-height: 1.25;
}
.age-timeline__legend-item {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    white-space: nowrap;
}
.age-timeline__legend-line {
    display: inline-block;
    width: 2.4rem;
    flex: 0 0 auto;
    border-top-color: currentColor;
    border-top-style: solid;
}
.age-timeline__legend-line--solid {
    border-top-width: 4px;
}
.age-timeline__legend-line--dashed {
    border-top-width: 2.5px;
    border-top-style: dashed;
}
:global(.high-contrast) .age-timeline__activity.is-muted {
    opacity: 1;
}
:global(.high-contrast) .age-timeline__activity.is-solid-connected,
:global(.high-contrast) .age-timeline__activity.is-dashed-connected {
    outline: 3px solid var(--on-surface);
    outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
    .age-timeline__activity,
    .age-timeline__group {
        transition: none;
    }
}
</style>
