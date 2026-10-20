<script setup lang="ts">
import { slug } from "github-slugger";
import {
    timelineStages,
    timelineThreads,
} from "~/data/human-practices/timeline";

const uid = useId();
const navigationHidden = useState<boolean>(
    "navigation-bar-hidden",
    () => false,
);
const hovered = ref<string | null>(null);
const focused = ref<string | null>(null);
const selected = ref<string | null>(null);
const activeId = computed(
    () => selected.value ?? hovered.value ?? focused.value,
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
const plot = ref<HTMLElement | null>(null);
type Point = { x: number; y: number };
type Label = Point & {
    textX: number;
    left: number;
    right: number;
    top: number;
    bottom: number;
    buttonTop: number;
    curve: string;
};
const geometry = shallowRef({
    width: 0,
    height: 0,
    axis: 0,
    start: 0,
    end: 0,
    footerHeight: 384,
    nodes: {} as Record<string, Point>,
    labels: {} as Record<string, Label>,
});

function curvePoint(
    start: Point,
    control: Point,
    end: Point,
    t: number,
): Point {
    const u = 1 - t;
    return {
        x: u * u * start.x + 2 * u * t * control.x + t * t * end.x,
        y: u * u * start.y + 2 * u * t * control.y + t * t * end.y,
    };
}

function connectionBend(axis: number, index: number, distance: number) {
    return Math.max(
        12,
        Math.min(
            axis * (0.12 + index * 0.095),
            axis - Math.min(22 + distance * 0.3, axis * 0.65),
        ),
    );
}

function measure() {
    const element = plot.value;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    const nodes: Record<string, Point> = {};
    const labels: Record<string, Label> = {};
    element.querySelectorAll<HTMLElement>("[data-cycle]").forEach((node) => {
        const box = node.getBoundingClientRect();
        nodes[node.dataset.cycle!] = {
            x: box.left - bounds.left + box.width / 2,
            y: box.top - bounds.top + box.height / 2,
        };
    });
    const points = Object.values(nodes);
    if (!points.length) return;
    const axis = points[0]!.x;
    // Sample all connection curves so ending labels also avoid earlier stages.
    const occupied: Point[] = [];
    timelineThreads.forEach((thread, index) => {
        thread.nodes.slice(1).forEach((id, i) => {
            const start = nodes[thread.nodes[i]!]!;
            const end = nodes[id]!;
            const distance = end.y - start.y;
            const bend = connectionBend(axis, index, distance);
            const steps = Math.ceil((distance + 2 * (axis - bend)) / 3);
            for (let step = 0; step <= steps; step++) {
                const t = step / steps;
                const u = 1 - t;
                occupied.push({
                    x: (u ** 3 + t ** 3) * axis + 3 * u * t * bend,
                    y:
                        u ** 3 * start.y +
                        3 * u * u * t * (start.y + distance * 0.22) +
                        3 * u * t * t * (end.y - distance * 0.22) +
                        t ** 3 * end.y,
                });
            }
        });
    });
    const contentEnd =
        element.querySelector(".stages")!.getBoundingClientRect().bottom -
        bounds.top;
    const metrics = new Map(
        Array.from(
            element.querySelectorAll<HTMLElement>("[data-thread-label]"),
            (button) => {
                const text = button
                    .querySelector(".thread-end-label")!
                    .getBoundingClientRect();
                return [
                    button.dataset.threadLabel!,
                    {
                        width: text.width,
                        height: text.height,
                        inset: text.top - button.getBoundingClientRect().top,
                    },
                ] as const;
            },
        ),
    );
    const endings = timelineThreads
        .map((thread, index) => ({
            ...thread,
            index,
            start: nodes[thread.nodes[thread.nodes.length - 1]!]!,
        }))
        .sort((a, b) => a.start.y - b.start.y || a.index - b.index);
    let nextY = 0;
    for (const thread of endings) {
        const size = metrics.get(thread.id)!;
        const minX = size.width + 22;
        const maxX = axis - 18;
        const phase =
            (thread.index * 0.618034 + thread.nodes.length * 0.137) % 1;
        let y = Math.max(thread.start.y + 64, nextY);
        let placed = false;
        // Move labels, rather than adding bends to the arrow. Every ending is
        // one quadratic with monotonic x/y coordinates and no inflection.
        while (!placed) {
            for (let attempt = 0; attempt < 12 && !placed; attempt++) {
                const fraction = (phase + attempt * 0.381966) % 1;
                const x = minX + Math.max(0, maxX - minX) * fraction;
                const textX = x - size.width / 2 - 12;
                const labelBox = {
                    left: textX - size.width / 2 - 6,
                    right: textX + size.width / 2 + 6,
                    top: y + 6,
                    bottom: y + 18 + size.height,
                };
                if (
                    occupied.some(
                        (point) =>
                            point.x >= labelBox.left &&
                            point.x <= labelBox.right &&
                            point.y >= labelBox.top &&
                            point.y <= labelBox.bottom,
                    )
                )
                    continue;
                const control = {
                    x: axis,
                    y,
                };
                const steps = Math.ceil((axis - x + y - thread.start.y) / 4);
                const obstacles = Object.values(labels);
                const endingPoints: Point[] = [];
                let clear = true;
                for (let step = 0; step <= steps && clear; step++) {
                    const point = curvePoint(
                        thread.start,
                        control,
                        { x, y },
                        step / steps,
                    );
                    endingPoints.push(point);
                    clear = !obstacles.some(
                        (box) =>
                            point.x >= box.left &&
                            point.x <= box.right &&
                            point.y >= box.top &&
                            point.y <= box.bottom,
                    );
                }
                if (!clear) continue;
                labels[thread.id] = {
                    x,
                    y,
                    textX,
                    ...labelBox,
                    buttonTop: y + 12 - size.inset,
                    curve: `M ${axis} ${thread.start.y} Q ${control.x} ${control.y}, ${x} ${y}`,
                };
                occupied.push(...endingPoints);
                nextY = y + size.height + 34 + fraction * 16;
                placed = true;
            }
            if (!placed) y += 28;
        }
    }
    const height = Math.max(
        contentEnd + 50,
        ...Object.values(labels).map((label) => label.bottom + 30),
    );
    geometry.value = {
        width: bounds.width,
        height,
        axis,
        start: 25,
        end: height - 10,
        footerHeight: height - contentEnd,
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
    return timelineThreads.map((thread, index) => {
        const points = thread.nodes
            .map((id) => nodes[id])
            .filter((point): point is Point => !!point);
        // Each theme has its own lane. Larger jumps bow farther to the left.
        const segments = points.slice(1).map((point, i) => {
            const previous = points[i]!;
            const distance = point.y - previous.y;
            const bend = connectionBend(axis, index, distance);
            return `M ${axis} ${previous.y} C ${bend} ${previous.y + distance * 0.22}, ${bend} ${point.y - distance * 0.22}, ${axis} ${point.y}`;
        });
        const ending = labels[thread.id]?.curve ?? "";
        return { ...thread, segments, ending };
    });
});
const drawnRoutes = computed(() =>
    [...routes.value].sort(
        (a, b) =>
            Number(a.id === activeId.value) - Number(b.id === activeId.value),
    ),
);

function toggle(id: string) {
    if (selected.value === id) {
        reset();
    } else {
        selected.value = id;
    }
}
function reset() {
    selected.value = hovered.value = focused.value = null;
}
function threadStyle(id: string) {
    return { "--thread": `var(--${id})`, "--ribbon": `var(--${id}-ribbon)` };
}
function labelStyle(id: string) {
    const label = geometry.value.labels[id];
    return label
        ? { left: `${label.textX}px`, top: `${label.buttonTop}px` }
        : { visibility: "hidden" as const };
}
function ribbonTitle(title: string) {
    return title
        .replace("Technology", "Techno\u00adlogy")
        .replace("Stability", "Stab\u00adility")
        .replace("Industry", "Indus\u00adtry")
        .replace("Awareness", "Aware\u00adness")
        .replace("Sustainability", "Sustain\u00adability")
        .replace("Inclusivity", "Inclus\u00adivity");
}
function ribbonLines(title: string) {
    const split = title.lastIndexOf(" ");
    return split < 0
        ? [ribbonTitle(title)]
        : [title.slice(0, split), ribbonTitle(title.slice(split + 1))];
}
</script>

<template>
    <section
        class="hp-timeline"
        :class="{ 'is-nav-hidden': navigationHidden }"
        aria-label="Human Practices timeline"
        @keydown.esc="reset"
    >
        <div
            class="thread-controls"
            role="group"
            aria-label="Highlight a timeline theme"
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
                :aria-label="thread.title"
                :aria-controls="`${uid}-plot`"
                @pointerenter="
                    hovered = $event.pointerType === 'mouse' ? thread.id : null
                "
                @pointerleave="hovered = null"
                @focus="focused = thread.id"
                @blur="focused = null"
                @click="toggle(thread.id)"
            >
                <span class="thread-button-label"
                    ><span
                        v-for="line in ribbonLines(thread.title)"
                        :key="line"
                        >{{ line }}</span
                    ></span
                >
            </button>
        </div>

        <div
            :id="`${uid}-plot`"
            ref="plot"
            class="timeline-plot"
            :style="{ '--ending-space': `${geometry.footerHeight}px` }"
        >
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
                        markerWidth="8"
                        markerHeight="8"
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
                    :d="`M ${geometry.axis - 12} ${geometry.end - 14} L ${geometry.axis} ${geometry.end} L ${geometry.axis + 12} ${geometry.end - 14}`"
                />
                <g
                    v-for="thread in drawnRoutes"
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
                    <h3 class="stage-heading">Stage {{ stage.number }}</h3>
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
                                    <span class="cycle-title"
                                        >Cycle{{ cycle.number }}-{{
                                            cycle.title
                                        }}</span
                                    >
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
                    :class="[
                        'thread-end',
                        `thread-end-${thread.id}`,
                        {
                            'is-active': activeId === thread.id,
                            'is-muted': activeId && activeId !== thread.id,
                        },
                    ]"
                    :data-thread-label="thread.id"
                    :style="[threadStyle(thread.id), labelStyle(thread.id)]"
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
                    <span class="thread-end-label">{{ thread.title }}</span>
                </button>
            </div>
        </div>
    </section>
</template>

<style scoped>
.hp-timeline {
    --ribbon-height: clamp(78px, 10cqi, 104px);
    --ribbon-offset: var(--category-header-height, 3.5rem);
    /* Reference palette, left to right, converted from Display P3 to sRGB. */
    --science: #ff6e85;
    --safety: #ffa120;
    --stability: #fdde69;
    --market: #6ae9cb;
    --needs: #5dd3ff;
    --awareness: #4a98fe;
    --sustainability: #a388fd;
    --inclusivity: #d292fd;
    --science-ribbon: var(--science);
    --safety-ribbon: var(--safety);
    --stability-ribbon: var(--stability);
    --market-ribbon: var(--market);
    --needs-ribbon: var(--needs);
    --awareness-ribbon: var(--awareness);
    --sustainability-ribbon: var(--sustainability);
    --inclusivity-ribbon: var(--inclusivity);
    --timeline-paper: var(--surface-bright);
    --axis-color: #387fc9;
    --stop-color: #7ecff3;
    color: var(--on-surface);
    background: var(--timeline-paper);
    font-family: var(--font-main);
    isolation: isolate;
    container-type: inline-size;
}
.hp-timeline.is-nav-hidden {
    --ribbon-offset: 0px;
}
.hp-timeline:where(.dark *) {
    --timeline-paper: var(--surface);
}
.hp-timeline ol {
    margin: 0;
    padding: 0;
    list-style: none;
}
.thread-controls {
    position: sticky;
    top: 0;
    z-index: 4;
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    align-items: start;
    height: calc(var(--ribbon-height) + var(--category-header-height, 3.5rem));
    pointer-events: none;
}
.thread-button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    height: calc(var(--ribbon-height) + var(--ribbon-offset));
    padding: calc(0.4rem + var(--ribbon-offset)) 0.3rem 0.8rem;
    border: 0;
    border-radius: 0 0 50% 50% / 0 0 28% 28%;
    background: var(--ribbon);
    color: #082f64;
    font: 400 clamp(0.65rem, 1.8cqi, 1.2rem)/1.12 var(--font-belanosima);
    text-align: center;
    overflow-wrap: anywhere;
    hyphens: manual;
    cursor: pointer;
    pointer-events: auto;
    transition:
        opacity 150ms ease,
        height 300ms ease-out,
        padding 300ms ease-out;
}
.thread-button.is-active {
    box-shadow: inset 0 -5px 0 #082f64;
}
.thread-button-label > span {
    display: block;
}
.thread-button.is-muted {
    opacity: 0.45;
}
.timeline-plot {
    position: relative;
    --axis: 51%;
    padding-block: 1.1rem var(--ending-space, 24rem);
}
.timeline-lines {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible;
}
.timeline-spine,
.spine-arrow {
    fill: none;
    stroke: var(--axis-color);
    stroke-width: 8;
    stroke-linecap: round;
    stroke-linejoin: round;
}
.thread-route {
    fill: none;
    stroke: var(--thread);
    stroke-width: 1.8;
    stroke-linecap: round;
    opacity: 0.9;
    transition:
        opacity 150ms ease,
        stroke-width 150ms ease;
}
.thread-route.is-active {
    opacity: 1;
    stroke-width: 3.2;
}
.thread-route.is-muted {
    opacity: 0.1;
}
.stage {
    position: relative;
    padding-bottom: 0.4rem;
}
.hp-timeline .stage-heading {
    position: relative;
    width: max-content;
    max-width: 90%;
    margin: 0.25rem 0 0.6rem var(--axis);
    transform: translateX(-50%);
    padding: 0.4rem 0.6rem;
    border-radius: 0.8rem;
    background: #f8ffff;
    color: #084999;
    font: 700 clamp(1.3rem, 4.8cqi, 2rem)/1.15 var(--font-main);
}
.cycle {
    position: relative;
    margin-left: calc(var(--axis) - 4.5%);
    transition: opacity 150ms ease;
}
.cycle-link {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 66px;
    padding-block: 0.35rem;
    color: var(--on-surface);
    text-decoration: none;
}
.cycle-stop {
    display: block;
    width: 9cqi;
    height: 13px;
    flex-shrink: 0;
    border-radius: 20px;
    background: var(--stop-color);
}
.cycle-copy {
    min-width: 0;
    flex: 1;
    padding-right: 0.4rem;
}
.cycle-title {
    display: block;
    font-size: clamp(0.75rem, 1.85cqi, 1.13rem);
    line-height: 1.3;
    font-weight: 700;
    overflow-wrap: anywhere;
}
.cycle-themes {
    display: flex;
    gap: 4px;
    margin-top: 0.35rem;
}
.cycle-themes > span {
    display: block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--thread);
}
.cycle.is-connected .cycle-stop {
    background: var(--thread);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--thread) 30%, transparent);
}
.cycle.is-connected .cycle-title {
    color: color-mix(in srgb, var(--thread) 55%, var(--on-surface));
}
.cycle.is-muted {
    opacity: 0.3;
}
.cycle:focus-within,
.cycle:hover {
    opacity: 1;
}
.cycle-link:hover .cycle-title {
    text-decoration: underline;
    text-underline-offset: 0.2em;
}
.thread-endings {
    position: absolute;
    inset: 0;
    pointer-events: none;
}
.thread-end {
    position: absolute;
    transform: translateX(-50%);
    width: 24%;
    min-height: 44px;
    border: 0;
    padding: 0.25rem;
    background: transparent;
    color: color-mix(in srgb, var(--thread) 55%, var(--on-surface));
    text-shadow:
        0 1px 3px var(--timeline-paper),
        0 -1px 3px var(--timeline-paper);
    font: 700 clamp(0.58rem, 1.8cqi, 0.9rem)/1.2 var(--font-main);
    text-align: center;
    pointer-events: auto;
    cursor: pointer;
    transition: opacity 150ms ease;
}
.thread-end.is-muted {
    opacity: 0.3;
}
.thread-end-label {
    display: inline-block;
    max-width: 100%;
}
.thread-end.is-active {
    text-decoration: underline;
    text-underline-offset: 0.25em;
}
.hp-timeline button:focus-visible,
.hp-timeline a:focus-visible {
    outline: 3px solid var(--thread, var(--primary));
    outline-offset: 3px;
}
@container (max-width: 400px) {
    .thread-button {
        font-size: 0.65rem;
        padding-inline: 0.12rem;
    }
    .cycle-link {
        gap: 0.4rem;
        min-height: 64px;
    }
    .cycle-stop {
        height: 11px;
    }
    .cycle-title {
        font-size: 0.75rem;
    }
}
@media (prefers-reduced-motion: reduce) {
    .hp-timeline * {
        transition: none !important;
    }
}
@media (forced-colors: active) {
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
