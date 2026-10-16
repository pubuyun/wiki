<script setup lang="ts">
import {
    PopoverAnchor,
    PopoverClose,
    PopoverContent,
    PopoverPortal,
    PopoverRoot,
} from "reka-ui";
import activityData from "~/data/education/activites.json";
import LightboxImage from "../LightboxImage.vue";
import {
    layoutActivityCallouts,
    type ActivityCalloutBox,
} from "~/utils/activity-graph-layout";
import {
    activityTextColor,
    layoutActivityLabels,
    type GraphLabelPlacement,
} from "~/utils/activity-graph-labels";

const uid = useId();
const root = ref<HTMLElement | null>(null);
const plot = ref<HTMLElement | null>(null);
const selectedNode = ref<string | null>(null);
const activeCategory = ref<string | null>(null);
const hoveredCategory = ref<string | null>(null);
const focusedCategory = ref<string | null>(null);
const highlightedCategory = computed(
    () =>
        hoveredCategory.value ?? focusedCategory.value ?? activeCategory.value,
);
const frame = ref({ width: 0, height: 0, top: 0, viewport: 0 });
const plotSize = shallowRef({ width: 0, height: 0 });
const labelSizes = shallowRef<
    Record<
        string,
        {
            width: number;
            height: number;
            insideWidth?: number;
            insideHeight?: number;
        }
    >
>({});
const labelVariants = ["outside", "inside"] as const;
const axisObstacles = shallowRef<
    { x: number; y: number; width: number; height: number }[]
>([]);
const contentHeights = shallowRef<Record<string, number>>({});
const imageViewer = ref<InstanceType<typeof LightboxImage> | null>(null);
const imageSources = activityData.activities.map((activity) => activity.image);
const imageAlts = activityData.activities.map((activity) => activity.title);
const categories = activityData.categories;
const activities = activityData.activities;
type Activity = (typeof activities)[number];
const categoryFor = (item: Activity) =>
    categories.find((c) => c.id === item.category)!;
const nodes = activities.map((activity) => ({
    ...activity,
    id: activity.nodeId,
    label: activity.title,
    labelLines:
        "labelLines" in activity && Array.isArray(activity.labelLines)
            ? activity.labelLines
            : [activity.title],
}));
function labelWidth(node: (typeof nodes)[number]) {
    const diameter = (node.size / 1300) * plotSize.value.width;
    return diameter >= 120
        ? Math.min(190, diameter * 0.72)
        : Math.min(
              node.label.length > 28 ? 160 : 128,
              Math.max(
                  Math.min(120, plotSize.value.width * 0.4),
                  plotSize.value.width * 0.24,
              ),
          );
}
function insideLabelWidth(node: (typeof nodes)[number]) {
    const diameter = (node.size / 1300) * plotSize.value.width;
    return Math.max(32, Math.min(190, (diameter - 12) * 0.8));
}
const labelPlacements = computed(() =>
    layoutActivityLabels(
        nodes
            .filter((node) => labelSizes.value[node.id]?.width)
            .map((node) => ({
                id: node.id,
                x: (node.x / 1300) * plotSize.value.width,
                y: (node.y / 1080) * plotSize.value.height,
                radius: (node.size / 2600) * plotSize.value.width,
                ...labelSizes.value[node.id]!,
            })),
        plotSize.value,
        axisObstacles.value,
    ),
);
const labelFor = (id: string) =>
    labelPlacements.value.find((label) => label.id === id);
function labelStyle(node: (typeof nodes)[number]) {
    const label = labelFor(node.id);
    const radius = (node.size / 2600) * plotSize.value.width;
    return {
        width: label ? label.width + "px" : "max-content",
        maxWidth: (label?.width ?? labelWidth(node)) + "px",
        left:
            (label?.x ?? 0) -
            (node.x / 1300) * plotSize.value.width +
            radius +
            "px",
        top:
            (label?.y ?? 0) -
            (node.y / 1080) * plotSize.value.height +
            radius +
            "px",
        visibility: label ? ("visible" as const) : ("hidden" as const),
    };
}
function labelLeader(label: GraphLabelPlacement) {
    const node = nodes.find((node) => node.id === label.id)!;
    const x = (node.x / 1300) * plotSize.value.width,
        y = (node.y / 1080) * plotSize.value.height;
    const x2 = Math.max(label.x, Math.min(x, label.x + label.width));
    const y2 = Math.max(label.y, Math.min(y, label.y + label.height));
    const distance = Math.hypot(x2 - x, y2 - y) || 1;
    const radius = (node.size / 2600) * plotSize.value.width;
    return {
        x1: x + ((x2 - x) / distance) * radius,
        y1: y + ((y2 - y) / distance) * radius,
        x2,
        y2,
    };
}
const labelElements = new Map<string, HTMLElement>();
let labelObserver: ResizeObserver | undefined;
function setLabelElement(id: string, element: unknown) {
    const previous = labelElements.get(id);
    if (previous === element) return;
    if (previous) labelObserver?.unobserve(previous);
    if (element instanceof HTMLElement) {
        labelElements.set(id, element);
        labelObserver?.observe(element);
    } else labelElements.delete(id);
}
function measureAxes() {
    const rect = plot.value?.getBoundingClientRect();
    if (!rect) return;
    const labels = Array.from(
        plot.value!.querySelectorAll(".activity-graph__axis-label"),
    ).map((element) => {
        const box = element.getBoundingClientRect();
        return {
            x: box.x - rect.x,
            y: box.y - rect.y,
            width: box.width,
            height: box.height,
        };
    });
    axisObstacles.value = [
        ...labels,
        {
            x: (606 / 1300) * rect.width - 2,
            y: (93 / 1080) * rect.height,
            width: 4,
            height: (879 / 1080) * rect.height,
        },
        {
            x: (165 / 1300) * rect.width,
            y: (527 / 1080) * rect.height - 2,
            width: (879 / 1300) * rect.width,
            height: 4,
        },
    ];
}
const visible = computed(() =>
    activities.filter((a) =>
        activeCategory.value
            ? a.category === activeCategory.value
            : a.nodeId === selectedNode.value,
    ),
);
const callouts = computed(() => {
    const f = frame.value;
    // Portalled cards may grow beyond the plot, stopping at the browser edge.
    const top = 76 - f.top;
    const bottom = f.viewport - f.top - 18;
    return layoutActivityCallouts(
        visible.value.map((a) => ({
            id: a.id,
            x: (a.x / 1300) * f.width,
            y: (a.y / 1080) * f.height,
            radius: (a.size / 2600) * f.width,
            contentHeight: contentHeights.value[a.id],
        })),
        { x: 12, y: top, width: f.width - 30, height: bottom - top },
    );
});
const lastPositions = shallowRef<Record<string, ActivityCalloutBox>>({});
const motionReady = shallowRef(new Set<string>());
watch(
    callouts,
    (cards) => {
        motionReady.value = new Set(
            cards
                .filter((card) => motionReady.value.has(card.id))
                .map((card) => card.id),
        );
        lastPositions.value = {
            ...lastPositions.value,
            ...Object.fromEntries(cards.map((card) => [card.id, card])),
        };
    },
    { flush: "sync" },
);
const cardFor = (id: string) =>
    callouts.value.find((c) => c.id === id) ?? lastPositions.value[id];
function enableMotion(id: string, event: AnimationEvent) {
    if (
        event.target !== event.currentTarget ||
        event.animationName !== "activity-callout-in"
    )
        return;
    // Start position transitions only after the entrance animation, avoiding
    // movement from Floating UI's offscreen measurement position.
    motionReady.value = new Set([...motionReady.value, id]);
}
function close() {
    activeCategory.value = null;
    selectedNode.value = null;
}
function selectNode(id: string) {
    activeCategory.value = null;
    selectedNode.value = selectedNode.value === id ? null : id;
}
function selectCategory(id: string) {
    selectedNode.value = null;
    activeCategory.value = activeCategory.value === id ? null : id;
}
const contentElements = new Map<string, HTMLElement>();
let contentObserver: ResizeObserver | undefined;
function setContentElement(id: string, element: unknown) {
    const previous = contentElements.get(id);
    if (previous === element) return;
    if (previous) contentObserver?.unobserve(previous);
    if (element instanceof HTMLElement) {
        contentElements.set(id, element);
        contentObserver?.observe(element);
    } else {
        contentElements.delete(id);
    }
}
function openImage(activity: Activity) {
    imageViewer.value?.open(activities.indexOf(activity));
}
function outside(event: Event) {
    const target = (event as CustomEvent<{ originalEvent: Event }>).detail
        ?.originalEvent.target;
    if (
        target instanceof Element &&
        (root.value?.contains(target) ||
            target.closest('[data-activity-owner="' + uid + '"]'))
    )
        event.preventDefault();
    else close();
}
function measure() {
    const r = plot.value?.getBoundingClientRect();
    if (
        r &&
        (r.width !== plotSize.value.width || r.height !== plotSize.value.height)
    ) {
        plotSize.value = { width: r.width, height: r.height };
        nextTick(measureAxes);
    }
    if (r)
        frame.value = {
            width: r.width,
            height: r.height,
            top: r.top,
            viewport: window.innerHeight,
        };
}
function lineEnd(id: string) {
    const card = cardFor(id)!;
    const activity = activities.find((a) => a.id === id)!;
    const x = (activity.x / 1300) * frame.value.width,
        y = (activity.y / 1080) * frame.value.height;
    return {
        x1: x,
        y1: y,
        x2: Math.max(card.x, Math.min(x, card.x + card.width)),
        y2: Math.max(card.y, Math.min(y, card.y + card.height)),
    };
}
let observer: ResizeObserver | undefined;
onMounted(() => {
    measure();
    observer = new ResizeObserver(measure);
    if (plot.value) observer.observe(plot.value);
    labelObserver = new ResizeObserver((entries) => {
        const next = { ...labelSizes.value };
        let changed = false;
        for (const entry of entries) {
            const element = entry.target as HTMLElement;
            const id = element.dataset.labelMeasure;
            if (!id) {
                measureAxes();
                continue;
            }
            const rect = element.getBoundingClientRect();
            const width = Math.ceil(rect.width * 100) / 100,
                height = Math.ceil(rect.height * 100) / 100;
            const widthKey =
                element.dataset.labelVariant === "inside"
                    ? "insideWidth"
                    : "width";
            const heightKey =
                element.dataset.labelVariant === "inside"
                    ? "insideHeight"
                    : "height";
            if (
                next[id]?.[widthKey] !== width ||
                next[id]?.[heightKey] !== height
            ) {
                next[id] = {
                    width: 0,
                    height: 0,
                    ...next[id],
                    [widthKey]: width,
                    [heightKey]: height,
                };
                changed = true;
            }
        }
        if (changed) labelSizes.value = next;
    });
    for (const element of labelElements.values())
        labelObserver.observe(element);
    for (const element of plot.value?.querySelectorAll(
        ".activity-graph__axis-label",
    ) ?? [])
        labelObserver.observe(element);
    measureAxes();
    contentObserver = new ResizeObserver((entries) => {
        const next = { ...contentHeights.value };
        let changed = false;
        for (const entry of entries) {
            const id = (entry.target as HTMLElement).dataset.activityContent;
            if (!id) continue;
            const body = entry.target.parentElement!;
            const style = getComputedStyle(body);
            const height = Math.ceil(
                entry.contentRect.height +
                    parseFloat(style.paddingTop) +
                    parseFloat(style.paddingBottom) +
                    2,
            );
            if (next[id] !== height) {
                next[id] = height;
                changed = true;
            }
        }
        if (changed) contentHeights.value = next;
    });
    for (const element of contentElements.values())
        contentObserver.observe(element);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, {
        passive: true,
        capture: true,
    });
});
onBeforeUnmount(() => {
    observer?.disconnect();
    contentObserver?.disconnect();
    labelObserver?.disconnect();
    window.removeEventListener("resize", measure);
    window.removeEventListener("scroll", measure, true);
});
</script>

<template>
    <section
        ref="root"
        class="activity-graph not-prose font-main"
        :aria-labelledby="uid + '-title'"
        @pointerleave="hoveredCategory = null"
        @keydown.esc="close"
    >
        <h2 :id="uid + '-title'" class="sr-only">Education activities</h2>
        <div class="activity-graph__layout">
            <div class="activity-graph__canvas">
                <div ref="plot" class="activity-graph__plot">
                    <svg
                        viewBox="0 0 1300 1080"
                        class="activity-graph__axes"
                        aria-hidden="true"
                        preserveAspectRatio="none"
                    >
                        <path d="M165 527H1044 M606 93V972" />
                    </svg>
                    <span
                        class="activity-graph__axis-label axis-top"
                        aria-hidden="true"
                        >More<br />interactive</span
                    >
                    <span
                        class="activity-graph__axis-label axis-bottom"
                        aria-hidden="true"
                        >Less<br />interactive</span
                    >
                    <span
                        class="activity-graph__axis-label axis-left"
                        aria-hidden="true"
                        >Beginner-<br />friendly</span
                    >
                    <span
                        class="activity-graph__axis-label axis-right"
                        aria-hidden="true"
                        >Prior knowledge<br />needed</span
                    >
                    <svg
                        class="activity-graph__label-leaders"
                        :viewBox="
                            '0 0 ' + plotSize.width + ' ' + plotSize.height
                        "
                        aria-hidden="true"
                    >
                        <line
                            v-for="label in labelPlacements.filter(
                                (label) => !label.inside,
                            )"
                            :key="label.id"
                            v-bind="labelLeader(label)"
                        />
                    </svg>
                    <button
                        v-for="node in nodes"
                        :key="node.id"
                        type="button"
                        class="activity-graph__node"
                        :class="{
                            'is-dimmed':
                                highlightedCategory &&
                                highlightedCategory !== node.category,
                            'is-active':
                                highlightedCategory === node.category ||
                                selectedNode === node.id,
                            'activity-graph__node--kit': [
                                'bacterial-fungi-kit',
                                'fuse-beads-kit',
                            ].includes(node.id),
                        }"
                        :style="{
                            left: node.x / 13 + '%',
                            top: node.y / 10.8 + '%',
                            width: node.size / 13 + '%',
                            '--node-color': categoryFor(node).color,
                            '--node-ink': activityTextColor(
                                categoryFor(node).color,
                            ),
                        }"
                        :aria-label="node.label"
                        :aria-expanded="
                            visible.some((a) => a.nodeId === node.id)
                        "
                        @click="selectNode(node.id)"
                    >
                        <span class="activity-graph__dot" aria-hidden="true" />
                        <span
                            class="activity-graph__label"
                            :data-graph-label="node.id"
                            :data-placement="
                                labelFor(node.id)?.inside ? 'inside' : 'outside'
                            "
                            :style="labelStyle(node)"
                        >
                            <span
                                v-for="(line, index) in node.labelLines"
                                :key="index"
                                class="activity-graph__label-line"
                                >{{ line }}</span
                            >
                        </span>
                        <span
                            class="activity-graph__measurements"
                            aria-hidden="true"
                        >
                            <span
                                v-for="variant in labelVariants"
                                :key="variant"
                                class="activity-graph__label activity-graph__label--measure"
                                aria-hidden="true"
                                :ref="
                                    (element) =>
                                        setLabelElement(
                                            node.id + '-' + variant,
                                            element,
                                        )
                                "
                                :data-label-measure="node.id"
                                :data-label-variant="variant"
                                :style="{
                                    width: 'max-content',
                                    maxWidth:
                                        (variant === 'inside'
                                            ? insideLabelWidth(node)
                                            : labelWidth(node)) + 'px',
                                }"
                            >
                                <span
                                    v-for="(line, index) in node.labelLines"
                                    :key="index"
                                    class="activity-graph__label-line"
                                    >{{ line }}</span
                                >
                            </span>
                        </span>
                    </button>
                    <svg
                        v-if="callouts.length"
                        class="activity-graph__leaders"
                        :viewBox="'0 0 ' + frame.width + ' ' + frame.height"
                        aria-hidden="true"
                    >
                        <line
                            v-for="card in callouts"
                            :key="card.id"
                            v-bind="lineEnd(card.id)"
                        />
                    </svg>
                    <PopoverRoot
                        v-for="activity in activities"
                        :key="activity.id"
                        :open="callouts.some((card) => card.id === activity.id)"
                        @update:open="
                            (open) => {
                                if (!open) close();
                            }
                        "
                    >
                        <PopoverAnchor
                            class="activity-graph__anchor"
                            :style="{
                                left: (cardFor(activity.id)?.x ?? 0) + 'px',
                                top: (cardFor(activity.id)?.y ?? 0) + 'px',
                            }"
                        />
                        <PopoverPortal>
                            <PopoverContent
                                class="activity-callout font-main"
                                side="bottom"
                                align="start"
                                :avoid-collisions="false"
                                :side-offset="0"
                                :data-activity-owner="uid"
                                :data-activity-id="activity.id"
                                :data-motion-ready="
                                    motionReady.has(activity.id)
                                "
                                :aria-label="activity.title"
                                :style="{
                                    width:
                                        (cardFor(activity.id)?.width ?? 280) +
                                        'px',
                                    '--activity-card-max-height':
                                        (cardFor(activity.id)?.height ??
                                            frame.viewport - 94) + 'px',
                                }"
                                @open-auto-focus.prevent
                                @close-auto-focus.prevent
                                @focus-outside.prevent
                                @interact-outside="outside"
                                @animationend="
                                    enableMotion(activity.id, $event)
                                "
                            >
                                <div
                                    class="activity-callout__backplate"
                                    aria-hidden="true"
                                />
                                <article class="activity-callout__body">
                                    <div
                                        :ref="
                                            (element) =>
                                                setContentElement(
                                                    activity.id,
                                                    element,
                                                )
                                        "
                                        :data-activity-content="activity.id"
                                    >
                                        <header>
                                            <span
                                                class="activity-callout__category"
                                                :style="{
                                                    background:
                                                        categoryFor(activity)
                                                            .color,
                                                    color: activityTextColor(
                                                        categoryFor(activity)
                                                            .color,
                                                    ),
                                                }"
                                                >{{
                                                    categoryFor(activity).label
                                                }}</span
                                            ><PopoverClose
                                                class="activity-callout__close"
                                                :aria-label="
                                                    'Close ' + activity.title
                                                "
                                                >×</PopoverClose
                                            >
                                        </header>
                                        <h3>{{ activity.title }}</h3>
                                        <p
                                            v-if="activity.info"
                                            class="activity-callout__info"
                                        >
                                            {{ activity.info }}
                                        </p>
                                        <p>{{ activity.description }}</p>
                                        <button
                                            type="button"
                                            class="activity-callout__image"
                                            :style="{
                                                aspectRatio:
                                                    activity.imageWidth +
                                                    ' / ' +
                                                    activity.imageHeight,
                                            }"
                                            :aria-label="
                                                'Open image: ' + activity.title
                                            "
                                            @click="openImage(activity)"
                                        >
                                            <img
                                                :src="activity.image"
                                                :alt="activity.title"
                                                :width="activity.imageWidth"
                                                :height="activity.imageHeight"
                                                loading="lazy"
                                            />
                                        </button>
                                    </div>
                                </article>
                            </PopoverContent>
                        </PopoverPortal>
                    </PopoverRoot>
                </div>
            </div>
            <nav
                class="activity-graph__legend"
                aria-label="Activity categories"
            >
                <button
                    v-for="category in categories"
                    :key="category.id"
                    type="button"
                    :style="{
                        background: category.color,
                        color: activityTextColor(category.color),
                    }"
                    :aria-pressed="activeCategory === category.id"
                    @pointerenter="
                        (event) => {
                            if (event.pointerType === 'mouse')
                                hoveredCategory = category.id;
                        }
                    "
                    @pointerleave="hoveredCategory = null"
                    @focus="focusedCategory = category.id"
                    @blur="focusedCategory = null"
                    @click="selectCategory(category.id)"
                >
                    {{ category.label }}
                </button>
            </nav>
        </div>
        <LightboxImage ref="imageViewer" :src="imageSources" :alt="imageAlts">
            <span />
        </LightboxImage>
    </section>
</template>

<style scoped>
.activity-graph {
    width: 100%;
    color: var(--on-surface);
    margin-block: 1rem 2rem;
    font-size: max(1rem, 1em);
    container-type: inline-size;
}
.activity-graph__layout {
    display: grid;
    grid-template-columns: minmax(0, 1300fr) minmax(0, 510fr);
    gap: 4%;
    align-items: start;
}
.activity-graph__canvas {
    min-width: 0;
    container: activity-plot / inline-size;
}
.activity-graph__plot {
    position: relative;
    width: 100%;
    min-width: 0;
    aspect-ratio: 1300 / 1080;
    min-height: 46rem;
    container-type: inline-size;
    isolation: isolate;
}
.activity-graph__axes,
.activity-graph__leaders,
.activity-graph__label-leaders {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}
.activity-graph__axes path {
    stroke: var(--primary);
    stroke-width: 4;
    fill: none;
}
.activity-graph__axis-label {
    position: absolute;
    color: var(--on-surface);
    font-size: 1rem;
    font-weight: 650;
    line-height: 1.25;
    text-align: center;
    pointer-events: none;
}
.axis-top {
    left: 46.62%;
    top: 0;
    transform: translateX(-50%);
}
.axis-bottom {
    left: 46.62%;
    bottom: 0;
    transform: translateX(-50%);
}
.axis-left {
    left: 0;
    top: 48.8%;
    width: max-content;
    max-width: 24%;
    transform: translateY(-50%);
}
.axis-right {
    right: 0;
    top: 48.8%;
    width: min(10rem, 20%);
    transform: translateY(-50%);
}
.activity-graph__label-leaders line {
    stroke: var(--on-surface);
    stroke-width: 1;
    opacity: 0.65;
}
.activity-graph__node {
    position: absolute;
    z-index: 1;
    aspect-ratio: 1;
    transform: translate(-50%, -50%);
    border: 0;
    padding: 0;
    border-radius: 50%;
    background: var(--node-color);
    color: var(--node-ink);
    cursor: pointer;
    transition: box-shadow 180ms;
}
.activity-graph__node::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--surface);
    opacity: 0;
    pointer-events: none;
    transition: opacity 180ms;
}
.activity-graph__dot {
    position: absolute;
    z-index: 1;
    left: 50%;
    top: 50%;
    width: 0.48cqi;
    height: 0.48cqi;
    min-width: 2px;
    min-height: 2px;
    border-radius: 50%;
    background: currentColor;
    transform: translate(-50%, -50%);
}
.activity-graph__label {
    position: absolute;
    z-index: 1;
    padding: 0.25rem 0.35rem;
    border-radius: 0.4rem;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.25;
    text-align: center;
    overflow-wrap: anywhere;
}
.activity-graph__label[data-placement="outside"] {
    background: var(--surface);
    color: var(--on-surface);
}
.activity-graph__label--measure {
    left: 0;
    top: 0;
    visibility: hidden;
    pointer-events: none;
}
.activity-graph__measurements {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
}
.activity-graph__node:has(.activity-graph__label[data-placement="inside"])
    .activity-graph__dot {
    visibility: hidden;
}
.activity-graph__node[aria-label="Short videos"] {
    z-index: 0;
}
.activity-graph__node--kit {
    z-index: 2;
}
.activity-graph__label-line {
    display: block;
}
.activity-graph__node:hover,
.activity-graph__node.is-active {
    box-shadow:
        0 0 0 0.3cqi var(--surface),
        0 0 0 0.55cqi var(--node-color);
}
.activity-graph__node.is-dimmed {
    box-shadow: none;
}
.activity-graph__node.is-dimmed::before {
    opacity: 0.82;
}
.activity-graph__node.is-dimmed .activity-graph__label,
.activity-graph__node.is-dimmed .activity-graph__dot {
    color: var(--on-surface);
}
.activity-graph__node:focus-visible {
    outline: 3px solid var(--outline);
    outline-offset: 5px;
}
.activity-graph__leaders {
    z-index: 4;
    overflow: hidden;
}
.activity-graph__leaders line {
    stroke: var(--primary);
    stroke-width: 1.5;
    opacity: 0.7;
}
.activity-graph__anchor {
    position: absolute;
    width: 0;
    height: 0;
    pointer-events: none;
}
.activity-graph__legend {
    display: grid;
    gap: 0.9cqi;
    padding-top: 1.2%;
}
.activity-graph__legend button {
    min-width: 0;
    border: 0;
    border-radius: 3rem;
    padding: 0.7em;
    color: white;
    font-size: clamp(1rem, 1.5vw, 1.8rem);
    font-weight: 700;
    line-height: 1;
    overflow-wrap: anywhere;
    cursor: pointer;
    transition:
        filter 180ms,
        box-shadow 180ms;
}
.activity-graph__legend button:hover,
.activity-graph__legend button[aria-pressed="true"] {
    box-shadow: 0 4px 12px
        color-mix(in srgb, var(--on-surface) 22%, transparent);
}
.activity-graph__legend button:focus-visible {
    outline: 3px solid var(--outline);
    outline-offset: 4px;
}
@media (orientation: portrait) {
    .activity-graph__layout {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    .activity-graph__legend {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.6rem;
    }
}
@container activity-plot (max-width: 56rem) {
    .activity-graph__plot {
        min-height: 72rem;
    }
}
@container activity-plot (max-width: 32rem) {
    .activity-graph__plot {
        min-height: 96rem;
    }
}
@container activity-plot (max-width: 24rem) {
    .activity-graph__plot {
        min-height: 144rem;
    }
}
@media (prefers-reduced-motion: reduce) {
    .activity-graph__node,
    .activity-graph__node::before,
    .activity-graph__legend button {
        transition: none;
    }
}
</style>

<style>
/* Reka Presence watches the portalled root's exit animation. */
[data-reka-popper-content-wrapper]:has(
    > .activity-callout[data-state="open"][data-motion-ready="true"]
) {
    transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
}
.activity-callout {
    position: relative;
    isolation: isolate;
    z-index: 80;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--on-surface);
    transform-origin: center;
    font-size: 1rem;
}
.activity-callout[data-state="open"] {
    animation: activity-callout-in 220ms cubic-bezier(0.16, 1, 0.3, 1);
}
.activity-callout[data-state="closed"] {
    animation: activity-callout-out 130ms ease-in;
    pointer-events: none;
}
.activity-callout__backplate {
    position: absolute;
    inset: 0;
    z-index: -1;
    transform: translate(5px, 5px);
    border-radius: 0.85rem;
    background: var(--primary);
    pointer-events: none;
}
.activity-callout__body {
    max-height: var(--activity-card-max-height);
    overflow-x: hidden;
    overflow-y: auto;
    /* Keep image/text width unchanged when native overflow begins or ends. */
    scrollbar-gutter: stable;
    overscroll-behavior: contain;
    border: 1px solid color-mix(in srgb, var(--outline) 22%, transparent);
    border-radius: 0.85rem;
    background: var(--surface-elevated);
    padding: 0.9rem;
    box-shadow: 0 8px 22px
        color-mix(in srgb, var(--on-surface) 16%, transparent);
    transition: max-height 240ms cubic-bezier(0.22, 1, 0.36, 1);
}
.activity-callout header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
}
.activity-callout__category {
    border-radius: 0.5rem;
    padding: 0.25rem 0.5rem;
    color: white;
    font-size: 1rem;
    font-weight: 700;
}
.activity-callout__close {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border: 0;
    border-radius: 50%;
    background: var(--secondary);
    color: var(--on-secondary);
    font-size: 1.2rem;
    cursor: pointer;
    flex-shrink: 0;
}
.activity-callout__close:focus-visible {
    outline: 2px solid var(--outline);
    outline-offset: 2px;
}
.activity-callout h3 {
    margin: 0.55rem 0 0.4rem;
    font-family: var(--font-belanosima);
    font-size: 1.15rem;
    line-height: 1.1;
}
.activity-callout p {
    margin: 0.4rem 0 0;
    font-size: 1rem;
    line-height: 1.45;
}
.activity-callout p.activity-callout__info {
    font-size: 1rem;
    opacity: 1;
}
.activity-callout__image {
    position: relative;
    display: block;
    width: 100%;
    margin-top: 0.7rem;
    padding: 0;
    border: 0;
    border-radius: 0.5rem;
    overflow: hidden;
    background: color-mix(in srgb, var(--on-surface) 6%, transparent);
    cursor: zoom-in;
}
.activity-callout__image:focus-visible {
    outline: 2px solid var(--outline);
    outline-offset: 3px;
}
.activity-callout__image img {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 0.5rem;
}
@keyframes activity-callout-in {
    from {
        opacity: 0;
        transform: translateY(7px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
@keyframes activity-callout-out {
    from {
        opacity: 1;
        transform: scale(1);
    }
    to {
        opacity: 0;
        transform: translateY(4px) scale(0.97);
    }
}
@media (prefers-reduced-motion: reduce) {
    [data-reka-popper-content-wrapper]:has(> .activity-callout),
    .activity-callout__body {
        transition: none;
    }
    .activity-callout[data-state] {
        animation: none;
    }
}
</style>
