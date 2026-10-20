<script setup lang="ts">
import { slug } from "github-slugger";
import {
    timelineStages,
    timelineThreads,
} from "~/data/human-practices/timeline";

const uid = useId();
const hovered = ref<string | null>(null);
const focused = ref<string | null>(null);
const selected = ref<string | null>(null);
const activeId = computed(
    () => hovered.value ?? focused.value ?? selected.value,
);
const activeThread = computed(() =>
    timelineThreads.find((thread) => thread.id === activeId.value),
);
const stages = timelineStages.map((stage, stageIndex) => ({
    ...stage,
    number: stageIndex + 1,
    cycles: stage.cycles.map((title, cycleIndex) => {
        const id = `${stageIndex + 1}-${cycleIndex + 1}`;
        // The content renderer normalizes whitespace when it generates IDs.
        const heading = `Cycle ${cycleIndex + 1} ${title}`;
        return {
            id,
            title,
            number: cycleIndex + 1,
            href: `${stage.path}#${slug(heading)}`,
            threads: timelineThreads.filter((thread) =>
                thread.nodes.includes(id),
            ),
        };
    }),
}));
const totalCycles = stages.reduce(
    (count, stage) => count + stage.cycles.length,
    0,
);
const plot = ref<HTMLElement | null>(null);
type Point = { x: number; y: number };
const geometry = shallowRef({
    width: 0,
    height: 0,
    axis: 0,
    start: 0,
    end: 0,
    nodes: {} as Record<string, Point>,
    labels: {} as Record<string, Point>,
});

function measure() {
    const element = plot.value;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    const nodes: Record<string, Point> = {};
    const labels: Record<string, Point> = {};
    element.querySelectorAll<HTMLElement>("[data-cycle]").forEach((node) => {
        const box = node.getBoundingClientRect();
        nodes[node.dataset.cycle!] = {
            x: box.left - bounds.left + box.width / 2,
            y: box.top - bounds.top + box.height / 2,
        };
    });
    element
        .querySelectorAll<HTMLElement>("[data-thread-label]")
        .forEach((label) => {
            const box = label.getBoundingClientRect();
            labels[label.dataset.threadLabel!] = {
                x: box.left - bounds.left + box.width / 2,
                y: box.top - bounds.top - 10,
            };
        });
    const points = Object.values(nodes);
    if (!points.length) return;
    geometry.value = {
        width: bounds.width,
        height: bounds.height,
        axis: points[0]!.x,
        start: points[0]!.y - 40,
        end: points[points.length - 1]!.y + 46,
        nodes,
        labels,
    };
}

let observer: ResizeObserver | undefined;
let frame: number | undefined;
onMounted(() => {
    const queueMeasure = () => {
        if (frame !== undefined) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(measure);
    };
    observer = new ResizeObserver(queueMeasure);
    if (plot.value) {
        observer.observe(plot.value);
        plot.value
            .querySelectorAll<HTMLElement>(".cycle-link, .thread-end")
            .forEach((element) => observer!.observe(element));
    }
    queueMeasure();
});
onBeforeUnmount(() => {
    observer?.disconnect();
    if (frame !== undefined) cancelAnimationFrame(frame);
});

const routes = computed(() => {
    const { axis, nodes, labels } = geometry.value;
    return timelineThreads
        .map((thread, index) => {
            const points = thread.nodes
                .map((id) => nodes[id])
                .filter((point): point is Point => !!point);
            // Each theme has its own lane. Larger jumps bow farther to the left.
            const lane = axis * (0.12 + index * 0.095);
            const segments = points.slice(1).map((point, i) => {
                const previous = points[i]!;
                const distance = point.y - previous.y;
                const bend = Math.max(
                    12,
                    Math.min(
                        lane,
                        axis - Math.min(22 + distance * 0.3, axis * 0.65),
                    ),
                );
                return `M ${axis} ${previous.y} C ${bend} ${previous.y + distance * 0.22}, ${bend} ${point.y - distance * 0.22}, ${axis} ${point.y}`;
            });
            const last = points[points.length - 1];
            const label = labels[thread.id];
            const ending =
                last && label
                    ? `M ${axis} ${last.y} C ${lane} ${last.y + 50}, ${lane} ${label.y - 60}, ${label.x} ${label.y}`
                    : "";
            return { ...thread, segments, ending };
        })
        .sort(
            (a, b) =>
                Number(a.id === activeId.value) -
                Number(b.id === activeId.value),
        );
});

function toggle(id: string) {
    selected.value = selected.value === id ? null : id;
}
function reset() {
    selected.value = hovered.value = focused.value = null;
}
function threadStyle(id: string) {
    return { "--thread": `var(--${id})` };
}
</script>

<template>
    <section
        class="hp-timeline"
        :aria-labelledby="`${uid}-title`"
        @keydown.esc="reset"
    >
        <header class="timeline-header">
            <div>
                <p class="eyebrow">INTEGRATED HUMAN PRACTICES</p>
                <h3 :id="`${uid}-title`">A journey shaped by people</h3>
                <p class="timeline-intro">
                    Follow the threads that connect our conversations to our
                    decisions.
                </p>
            </div>
            <p class="journey-count">
                <strong>05</strong> stages <span>/</span>
                <strong>{{ totalCycles }}</strong> cycles
            </p>
        </header>

        <div
            class="thread-controls"
            role="group"
            aria-label="Highlight a timeline theme"
            :aria-describedby="`${uid}-help`"
        >
            <button
                v-for="thread in timelineThreads"
                :key="thread.id"
                type="button"
                class="thread-button"
                :class="{
                    'is-active': activeId === thread.id,
                    'is-muted': activeId && activeId !== thread.id,
                }"
                :style="threadStyle(thread.id)"
                :aria-pressed="selected === thread.id"
                :aria-controls="`${uid}-plot ${uid}-detail`"
                @pointerenter="
                    hovered = $event.pointerType === 'mouse' ? thread.id : null
                "
                @pointerleave="hovered = null"
                @focus="focused = thread.id"
                @blur="focused = null"
                @click="toggle(thread.id)"
            >
                <span class="thread-swatch" aria-hidden="true"></span>
                <span>{{ thread.title }}</span>
                <span class="thread-count" aria-hidden="true">{{
                    thread.nodes.length
                }}</span>
            </button>
        </div>

        <div class="timeline-guide">
            <p :id="`${uid}-help`">
                Hover or focus to trace a theme. Click to pin. Select a cycle to
                read its story.
            </p>
            <button type="button" class="reset-button" @click="reset">
                Show all <span aria-hidden="true">↗</span>
            </button>
        </div>
        <div
            :id="`${uid}-detail`"
            class="thread-detail"
            :style="activeThread ? threadStyle(activeThread.id) : undefined"
        >
            <p class="detail-title">
                {{
                    activeThread?.title ??
                    "Every conversation moves us forward."
                }}
            </p>
            <p>
                {{
                    activeThread?.description ??
                    "Explore how 23 stakeholder cycles shaped our project across eight connected themes — from understanding the science to building a safer, more sustainable and inclusive solution."
                }}
            </p>
            <p class="selection-status" role="status">
                {{
                    selected
                        ? `Pinned: ${timelineThreads.find((thread) => thread.id === selected)?.title}. Press Escape or Show all to clear.`
                        : "All themes available. Choose a thread to explore."
                }}
            </p>
        </div>

        <div :id="`${uid}-plot`" ref="plot" class="timeline-plot">
            <svg
                v-if="geometry.width"
                class="timeline-lines"
                :viewBox="`0 0 ${geometry.width} ${geometry.height}`"
                aria-hidden="true"
                focusable="false"
            >
                <defs>
                    <marker
                        v-for="thread in timelineThreads"
                        :id="`${uid}-arrow-${thread.id}`"
                        :key="thread.id"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="7"
                        markerHeight="7"
                        orient="auto-start-reverse"
                        markerUnits="userSpaceOnUse"
                    >
                        <path
                            d="M 1 1 L 8 5 L 1 9"
                            fill="none"
                            :stroke="`var(--${thread.id})`"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </marker>
                </defs>
                <path
                    class="timeline-spine"
                    :d="`M ${geometry.axis} ${geometry.start} V ${geometry.end}`"
                />
                <path
                    class="spine-arrow"
                    :d="`M ${geometry.axis - 7} ${geometry.end - 7} L ${geometry.axis} ${geometry.end} L ${geometry.axis + 7} ${geometry.end - 7}`"
                />
                <g
                    v-for="thread in routes"
                    :key="thread.id"
                    class="thread-route"
                    :class="{
                        'is-active': activeId === thread.id,
                        'is-muted': activeId && activeId !== thread.id,
                    }"
                    :style="threadStyle(thread.id)"
                    :data-thread="thread.id"
                >
                    <path
                        v-for="(segment, index) in thread.segments"
                        :key="index"
                        :d="segment"
                    />
                    <path
                        :d="thread.ending"
                        :marker-end="`url(#${uid}-arrow-${thread.id})`"
                    />
                </g>
            </svg>

            <ol
                class="stages"
                aria-label="Five stages of our Human Practices journey"
            >
                <li v-for="stage in stages" :key="stage.number" class="stage">
                    <div class="stage-heading">
                        <span class="stage-number" aria-hidden="true">{{
                            String(stage.number).padStart(2, "0")
                        }}</span>
                        <h4>
                            <span class="stage-kicker"
                                >Stage {{ stage.number }}</span
                            >{{ stage.title }}
                        </h4>
                        <span class="stage-count"
                            >{{ stage.cycles.length }} cycles</span
                        >
                    </div>
                    <ol
                        class="cycles"
                        :aria-label="`Stage ${stage.number} cycles`"
                    >
                        <li
                            v-for="cycle in stage.cycles"
                            :key="cycle.id"
                            class="cycle"
                            :class="{
                                'is-connected': activeThread?.nodes.includes(
                                    cycle.id,
                                ),
                                'is-muted':
                                    activeThread &&
                                    !activeThread.nodes.includes(cycle.id),
                            }"
                            :style="
                                activeThread?.nodes.includes(cycle.id)
                                    ? threadStyle(activeThread.id)
                                    : undefined
                            "
                        >
                            <NuxtLink
                                :to="cycle.href"
                                class="cycle-link"
                                :aria-label="`Stage ${stage.number}, Cycle ${cycle.number}: ${cycle.title}. Themes: ${cycle.threads.map((thread) => thread.title).join(', ')}.`"
                            >
                                <span
                                    class="cycle-stop"
                                    :data-cycle="cycle.id"
                                    aria-hidden="true"
                                ></span>
                                <span class="cycle-copy">
                                    <span class="cycle-kicker"
                                        >Cycle
                                        {{
                                            String(cycle.number).padStart(
                                                2,
                                                "0",
                                            )
                                        }}</span
                                    >
                                    <span class="cycle-title">{{
                                        cycle.title
                                    }}</span>
                                    <span
                                        class="cycle-themes"
                                        aria-hidden="true"
                                        ><span
                                            v-for="thread in cycle.threads"
                                            :key="thread.id"
                                            :style="threadStyle(thread.id)"
                                            :title="thread.title"
                                        ></span
                                    ></span>
                                </span>
                                <span class="cycle-arrow" aria-hidden="true"
                                    >↗</span
                                >
                            </NuxtLink>
                        </li>
                    </ol>
                </li>
            </ol>

            <div class="thread-endings" aria-label="Timeline themes">
                <button
                    v-for="thread in timelineThreads"
                    :key="thread.id"
                    type="button"
                    class="thread-end"
                    :data-thread-label="thread.id"
                    :style="threadStyle(thread.id)"
                    :class="{
                        'is-active': activeId === thread.id,
                        'is-muted': activeId && activeId !== thread.id,
                    }"
                    :aria-pressed="selected === thread.id"
                    @pointerenter="
                        hovered =
                            $event.pointerType === 'mouse' ? thread.id : null
                    "
                    @pointerleave="hovered = null"
                    @focus="focused = thread.id"
                    @blur="focused = null"
                    @click="toggle(thread.id)"
                >
                    <span class="thread-swatch" aria-hidden="true"></span
                    >{{ thread.title }}
                </button>
            </div>
        </div>
        <p class="timeline-caption">
            Five stages. Eight threads. One continuously evolving project.
        </p>
    </section>
</template>

<style scoped>
.hp-timeline {
    --science: #207e9a;
    --safety: #bd4165;
    --stability: #8d6a0d;
    --market: #b75c17;
    --needs: #3268b5;
    --awareness: #92652f;
    --sustainability: #17836b;
    --inclusivity: #7752b8;
    --timeline-paper: color-mix(
        in srgb,
        var(--surface-bright) 82%,
        var(--surface)
    );
    --timeline-rule: color-mix(
        in srgb,
        var(--outline-variant) 35%,
        transparent
    );
    color: var(--on-surface);
    background: var(--timeline-paper);
    border: 1px solid var(--timeline-rule);
    border-radius: 1.5rem;
    padding: clamp(1rem, 3.5%, 2rem);
    margin-block: 1.5rem;
    font-family: var(--font-main);
    isolation: isolate;
    container-type: inline-size;
}
.hp-timeline:where(.dark *) {
    --science: #70cce9;
    --safety: #ff859f;
    --stability: #e8ca64;
    --market: #ffb16a;
    --needs: #82b3ff;
    --awareness: #d7b086;
    --sustainability: #6bdbc0;
    --inclusivity: #b9a0ff;
    --timeline-paper: color-mix(in srgb, var(--surface) 93%, #071f45);
}
.hp-timeline p,
.hp-timeline h3,
.hp-timeline h4,
.hp-timeline ol {
    margin: 0;
}
.hp-timeline ol {
    padding: 0;
    list-style: none;
}
.timeline-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
}
.hp-timeline .eyebrow {
    color: var(--primary);
    font-size: 0.66rem;
    font-weight: 750;
    letter-spacing: 0.15em;
    margin-bottom: 0.65rem;
}
.hp-timeline h3 {
    font-family: var(--font-belanosima);
    font-size: clamp(1.6rem, 4cqi, 2.4rem);
    font-weight: 400;
    line-height: 1.12;
}
.hp-timeline .timeline-intro {
    margin-top: 0.7rem;
    font-size: 0.84rem;
    line-height: 1.6;
}
.journey-count {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.4rem;
    flex-shrink: 0;
    font-size: 0.7rem;
    color: var(--primary);
}
.journey-count strong {
    font-size: 1.35rem;
    font-family: var(--font-belanosima);
    font-weight: 400;
}
.journey-count > span {
    opacity: 0.45;
    margin-inline: 0.2rem;
}
.thread-controls {
    position: sticky;
    top: 5rem;
    z-index: 4;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.4rem;
    padding: 0.6rem;
    margin-inline: -0.6rem;
    background: var(--timeline-paper);
    border: 1px solid var(--timeline-rule);
    border-radius: 1rem;
    box-shadow: 0 5px 18px color-mix(in srgb, var(--surface) 35%, transparent);
}
.thread-button,
.thread-end {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 44px;
    cursor: pointer;
    font: inherit;
    text-align: left;
    line-height: 1.35;
    transition:
        opacity 180ms ease,
        background 180ms ease,
        border-color 180ms ease;
}
.thread-button {
    padding: 0.65rem;
    border: 1px solid color-mix(in srgb, var(--thread) 28%, transparent);
    border-radius: 0.65rem;
    background: color-mix(in srgb, var(--thread) 5%, var(--timeline-paper));
    color: var(--on-surface);
    font-size: 0.73rem;
    font-weight: 650;
}
.thread-swatch {
    width: 0.5rem;
    height: 0.5rem;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--thread);
}
.thread-count {
    margin-left: auto;
    flex-shrink: 0;
    white-space: nowrap;
    color: var(--thread);
    font-size: 0.65rem;
    font-variant-numeric: tabular-nums;
}
.thread-button.is-active,
.thread-end.is-active {
    background: color-mix(in srgb, var(--thread) 14%, var(--timeline-paper));
    border-color: var(--thread);
}
.timeline-guide {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-block: 0.9rem;
    font-size: 0.7rem;
    line-height: 1.5;
}
.reset-button {
    flex-shrink: 0;
    cursor: pointer;
    min-height: 44px;
    color: var(--primary);
    font: inherit;
    font-weight: 650;
    background: none;
    border: 0;
    padding: 0.25rem;
}
.thread-detail {
    border-left: 3px solid var(--thread, var(--primary));
    background: color-mix(
        in srgb,
        var(--thread, var(--primary)) 5%,
        transparent
    );
    padding: 1rem 1.2rem;
    min-height: 12rem;
    margin-bottom: 1rem;
    border-radius: 0 0.7rem 0.7rem 0;
    font-size: 0.8rem;
    line-height: 1.7;
}
.hp-timeline .detail-title {
    font-weight: 750;
    margin-bottom: 0.4rem;
    color: var(--thread, var(--primary));
    font-size: 0.9rem;
}
.hp-timeline .selection-status {
    margin-top: 0.6rem;
    font-size: 0.68rem;
}
.timeline-plot {
    position: relative;
    --axis: 38%;
}
.timeline-lines {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
}
.timeline-spine,
.spine-arrow {
    fill: none;
    stroke: var(--primary);
    stroke-width: 5;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.45;
}
.thread-route {
    fill: none;
    stroke: var(--thread);
    stroke-width: 1.7;
    stroke-linecap: round;
    opacity: 0.68;
    transition:
        opacity 180ms ease,
        stroke-width 180ms ease;
}
.thread-route.is-active {
    opacity: 1;
    stroke-width: 3;
}
.thread-route.is-muted {
    opacity: 0.08;
}
.stage {
    position: relative;
    padding-bottom: 1.25rem;
}
.stage-heading {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    min-height: 100px;
    padding-top: 0.75rem;
    border-top: 1px dashed var(--timeline-rule);
}
.stage-number {
    flex: 0 0 var(--axis);
    font-family: var(--font-belanosima);
    font-size: clamp(2.5rem, 8cqi, 4.5rem);
    line-height: 1;
    letter-spacing: -0.05em;
    color: color-mix(in srgb, var(--primary) 22%, var(--timeline-paper));
}
.hp-timeline h4 {
    position: relative;
    padding-block: 0.5rem;
    background: var(--timeline-paper);
    color: var(--primary);
    font-family: var(--font-belanosima);
    font-size: clamp(1.15rem, 2.9cqi, 1.65rem);
    line-height: 1.15;
    font-weight: 400;
}
.stage-kicker {
    display: block;
    margin-bottom: 0.35rem;
    font: 700 0.62rem var(--font-main);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--on-surface);
}
.stage-count {
    margin-left: auto;
    flex-shrink: 0;
    color: var(--primary);
    font-size: 0.65rem;
}
.cycle {
    position: relative;
    margin-left: calc(var(--axis) - 18px);
    transition: opacity 180ms ease;
}
.cycle-link {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    min-height: 82px;
    padding: 0.65rem 0.65rem 0.65rem 0;
    color: var(--on-surface);
    text-decoration: none;
    border-radius: 0.7rem;
    transition: background 180ms ease;
}
.cycle-stop {
    display: block;
    width: 36px;
    height: 12px;
    flex-shrink: 0;
    border-radius: 20px;
    background: var(--primary);
    border: 3px solid var(--timeline-paper);
    box-sizing: content-box;
    margin-left: -3px;
}
.cycle-copy {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
.cycle-kicker {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 0.3rem;
    color: var(--primary);
}
.cycle-title {
    font-size: clamp(0.8rem, 1.9cqi, 0.95rem);
    line-height: 1.45;
    font-weight: 650;
    overflow-wrap: anywhere;
}
.cycle-arrow {
    align-self: center;
    color: var(--primary);
    font-size: 1.15rem;
    padding-left: 0.25rem;
}
.cycle-themes {
    display: flex;
    gap: 4px;
    margin-top: 0.4rem;
}
.cycle-themes > span {
    display: block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--thread);
}
.cycle.is-connected .cycle-link {
    background: color-mix(in srgb, var(--thread) 9%, transparent);
}
.cycle.is-connected .cycle-stop {
    background: var(--thread);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--thread) 35%, transparent);
}
.cycle.is-muted {
    opacity: 0.3;
}
.cycle-link:hover,
.cycle-link:focus-visible {
    background: color-mix(in srgb, var(--primary) 10%, var(--timeline-paper));
}
.cycle-link:hover .cycle-title {
    text-decoration: underline;
    text-underline-offset: 0.2em;
}
.cycle:focus-within,
.cycle:hover {
    opacity: 1;
}
.thread-endings {
    position: relative;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    column-gap: 1rem;
    row-gap: 4rem;
    padding-top: 7rem;
}
.thread-end {
    position: relative;
    justify-content: center;
    padding: 0.6rem;
    background: var(--timeline-paper);
    border: 1px solid color-mix(in srgb, var(--thread) 35%, transparent);
    border-radius: 0.7rem;
    color: var(--thread);
    font-size: 0.72rem;
    font-weight: 650;
}
.thread-button.is-muted,
.thread-end.is-muted {
    opacity: 0.5;
}
.hp-timeline .timeline-caption {
    text-align: center;
    font-size: 0.7rem;
    line-height: 1.5;
    color: var(--primary);
    margin-top: 2rem;
}
.hp-timeline button:focus-visible,
.hp-timeline a:focus-visible {
    outline: 3px solid var(--thread, var(--primary));
    outline-offset: 4px;
}
@container (max-width: 560px) {
    .timeline-header {
        flex-direction: column;
        gap: 0.75rem;
    }
    .thread-controls {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.3rem;
        padding: 0.4rem;
    }
    .thread-button {
        font-size: 0.67rem;
        padding: 0.45rem;
    }
    .thread-detail {
        min-height: 17rem;
        font-size: 0.75rem;
        padding: 0.85rem;
    }
    .timeline-guide {
        align-items: flex-start;
        gap: 0.5rem;
    }
    .timeline-plot {
        --axis: 29%;
    }
    .stage-heading {
        gap: 0.5rem;
        min-height: 95px;
    }
    .stage-count {
        display: none;
    }
    .cycle-link {
        gap: 0.6rem;
        min-height: 94px;
        padding-right: 0.25rem;
    }
    .cycle-title {
        font-size: 0.8rem;
    }
    .cycle-arrow {
        font-size: 0.9rem;
        padding: 0;
    }
    .thread-endings {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        row-gap: 3rem;
        column-gap: 0.75rem;
    }
}
@media (prefers-reduced-motion: reduce) {
    .hp-timeline *,
    .hp-timeline *::before,
    .hp-timeline *::after {
        transition: none !important;
    }
}
@media (forced-colors: active) {
    .thread-swatch,
    .cycle-stop {
        background: CanvasText;
    }
    .thread-route {
        stroke: CanvasText;
    }
    .thread-route.is-active {
        stroke: Highlight;
    }
    .thread-button.is-active,
    .thread-end.is-active,
    .cycle.is-connected .cycle-link {
        outline: 2px solid Highlight;
    }
}
</style>
