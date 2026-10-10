<script setup lang="ts">
import { use } from "echarts/core";
import { RadarChart } from "echarts/charts";
import { GraphicComponent, RadarComponent } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";
import VChart from "vue-echarts";
import type { TargetProfileDimension } from "~/utils/target-profile";

use([RadarChart, RadarComponent, GraphicComponent, SVGRenderer]);
const props = defineProps<{
    dimensions: TargetProfileDimension[];
    beforeDimensions?: TargetProfileDimension[];
    label: string;
}>();
const theme = useWikiChartTheme();
const darkMode = useState<boolean>("dark-mode", () => true);
const chartRoot = useTemplateRef<HTMLDivElement>("chartRoot");
const tooltip = useTemplateRef<HTMLDivElement>("tooltip");
const tooltipHeight = ref(160);
const size = ref({ width: 640, height: 560 });
const tooltipId = `${useId()}-tooltip`;
const active = ref<string | null>(null);
const focused = ref<string | null>(null);
const pinned = ref<string | null>(null);
const dismissed = ref<string | null>(null);
let observer: ResizeObserver | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;

type Phase = "profile" | "fixed" | "before" | "after";
interface RadarPoint {
    id: string;
    index: number;
    dimension: TargetProfileDimension;
    phase: Phase;
    position: number[];
}
interface TooltipTarget {
    id: string;
    title: string;
    position: number[];
    lines: { label: string; score: number }[];
    explanation: string;
}

// Match the reference: alternate fixed and developable axes anticlockwise.
const axisOrder = [0, 5, 2, 4, 1, 3];
const dimensions = computed(() =>
    axisOrder.map((index) => props.dimensions[index]!),
);
const before = computed(() =>
    axisOrder.map((index) => props.beforeDimensions?.[index]),
);
const comparison = computed(() => Boolean(props.beforeDimensions));
function hasExplanation(dimension: TargetProfileDimension) {
    return !comparison.value || dimension.developable;
}
const colors = computed(() => ({
    fixed: theme.value.color[0]!,
    developable: theme.value.color[darkMode.value ? 1 : 2]!,
}));
const radius = computed(() =>
    Math.min(size.value.width * 0.3, size.value.height / 2 - 76),
);

function position(index: number, distance: number) {
    const angle = Math.PI / 2 + (index * Math.PI) / 3;
    return [
        size.value.width / 2 + Math.cos(angle) * distance,
        size.value.height / 2 - Math.sin(angle) * distance,
    ];
}
function axisStyle(index: number) {
    const [x, y] = position(index, radius.value);
    return {
        left: `${x! + (index === 1 || index === 2 ? -8 : index === 4 || index === 5 ? 8 : 0)}px`,
        top: `${y! + (index === 0 || index === 1 || index === 5 ? -42 : 42)}px`,
    };
}
function makePoint(
    dimension: TargetProfileDimension,
    index: number,
    phase: Phase,
): RadarPoint {
    return {
        id: `${phase}-${index}`,
        index,
        dimension,
        phase,
        position: position(index, (dimension.score / 5) * radius.value),
    };
}
const points = computed(() =>
    dimensions.value.flatMap((dimension, index) => {
        if (!comparison.value) return [makePoint(dimension, index, "profile")];
        if (!dimension.developable)
            return [makePoint(dimension, index, "fixed")];
        return [
            makePoint(before.value[index]!, index, "before"),
            makePoint(dimension, index, "after"),
        ];
    }),
);
function phaseLabel(phase: Phase) {
    return {
        profile: "",
        fixed: "Fixed reference",
        before: "Before activity",
        after: "After activity",
    }[phase];
}
function pointLabel(point: RadarPoint) {
    return `${point.dimension.label}: ${point.dimension.score} out of 5${phaseLabel(point.phase) ? `. ${phaseLabel(point.phase)}` : ""}`;
}
function pointTargetId(point: RadarPoint) {
    // Before/after points share the axis popup, including its anchor and content.
    return comparison.value ? `axis-${point.index}` : point.id;
}
function axisLabel(dimension: TargetProfileDimension, index: number) {
    if (comparison.value && dimension.developable)
        return `${dimension.label}: before activity ${before.value[index]!.score}, after activity ${dimension.score} out of 5.`;
    return `${dimension.label}: ${dimension.score} out of 5. ${dimension.developable ? "Developable dimension" : "Fixed characteristic"}.`;
}
const targets = computed<TooltipTarget[]>(() => [
    ...dimensions.value
        .map((dimension, index) => ({
            id: `axis-${index}`,
            title: dimension.label,
            position: position(index, radius.value),
            explanation: dimension.explanation,
            lines:
                comparison.value && dimension.developable
                    ? [
                          {
                              label: "Before activity",
                              score: before.value[index]!.score,
                          },
                          {
                              label: "After activity",
                              score: dimension.score,
                          },
                      ]
                    : [
                          {
                              label: comparison.value ? "Fixed reference" : "",
                              score: dimension.score,
                          },
                      ],
        }))
        .filter((_target, index) => hasExplanation(dimensions.value[index]!)),
    ...points.value
        .filter((point) => !comparison.value && hasExplanation(point.dimension))
        .map((point) => ({
            id: point.id,
            title: point.dimension.label,
            position: point.position,
            explanation: point.dimension.explanation,
            lines: [
                {
                    label: phaseLabel(point.phase),
                    score: point.dimension.score,
                },
            ],
        })),
]);
const activeTarget = computed(() =>
    targets.value.find((target) => target.id === active.value),
);

const option = computed<EChartsOption>(() => {
    const polygons = comparison.value
        ? [
              {
                  points: points.value.filter(
                      (point) => point.phase === "before",
                  ),
                  color: colors.value.developable,
                  dashed: true,
                  fill: "0e",
                  width: 2,
              },
              {
                  points: points.value.filter(
                      (point) => point.phase === "after",
                  ),
                  color: colors.value.developable,
                  dashed: false,
                  fill: "28",
                  width: 3,
              },
          ]
        : [false, true].map((developable) => ({
              points: points.value.filter(
                  (point) => point.dimension.developable === developable,
              ),
              color: developable
                  ? colors.value.developable
                  : colors.value.fixed,
              dashed: developable,
              fill: "24",
              width: 3,
          }));
    return {
        animation: false,
        textStyle: { fontFamily: '"Belanosima", sans-serif' },
        radar: {
            center: [size.value.width / 2, size.value.height / 2],
            radius: radius.value,
            startAngle: 90,
            shape: "polygon",
            splitNumber: 5,
            axisName: { show: false },
            indicator: dimensions.value.map((dimension) => ({
                name: dimension.label,
                min: 0,
                max: 5,
            })),
            axisLine: {
                lineStyle: {
                    color: theme.value.categoryAxis.axisLine.lineStyle.color,
                    opacity: 0.6,
                },
            },
            splitLine: {
                lineStyle: {
                    color: theme.value.categoryAxis.splitLine.lineStyle.color,
                    opacity: 0.8,
                },
            },
            splitArea: {
                show: true,
                areaStyle: {
                    color: ["transparent", `${colors.value.fixed}08`],
                },
            },
        },
        // Establish six radar axes using the real scores; polygons connect only
        // members of each group, without invented zero values.
        series: [
            {
                type: "radar",
                silent: true,
                symbol: "none",
                lineStyle: { opacity: 0 },
                data: [
                    {
                        value: dimensions.value.map(
                            (dimension) => dimension.score,
                        ),
                    },
                ],
            },
        ],
        graphic: [
            ...polygons.map((polygon) => ({
                type: "polygon" as const,
                silent: true,
                z: 10,
                shape: {
                    points: polygon.points.map((point) => point.position),
                },
                style: {
                    fill: `${polygon.color}${polygon.fill}`,
                    stroke: polygon.color,
                    lineWidth: polygon.width,
                    lineDash: polygon.dashed ? [7, 4] : undefined,
                },
            })),
            ...[1, 2, 3, 4, 5].map((score) => ({
                type: "text" as const,
                silent: true,
                z: 11,
                x: size.value.width / 2 - 22,
                y: size.value.height / 2 - (score / 5) * radius.value - 7,
                style: {
                    text: String(score),
                    fill: theme.value.textStyle.color,
                    font: '14px "Belanosima", sans-serif',
                },
            })),
        ],
    };
});
const tooltipStyle = computed(() => {
    if (!activeTarget.value) return {};
    const [x, y] = activeTarget.value.position;
    const width = Math.min(336, size.value.width - 24);
    return {
        width: `${width}px`,
        maxHeight: `${size.value.height - 24}px`,
        left: `${Math.max(12, Math.min(x! - width / 2, size.value.width - width - 16))}px`,
        top: `${Math.max(12, Math.min(y! < size.value.height / 2 ? y! + 26 : y! - tooltipHeight.value - 26, size.value.height - tooltipHeight.value - 16))}px`,
    };
});
watch(
    [activeTarget, size],
    async () => {
        await nextTick();
        if (tooltip.value) tooltipHeight.value = tooltip.value.offsetHeight;
    },
    { flush: "post" },
);

function cancelHide() {
    clearTimeout(hideTimer);
}
function show(id: string) {
    cancelHide();
    if (dismissed.value === id) return;
    dismissed.value = null;
    active.value = id;
}
function scheduleHide() {
    cancelHide();
    hideTimer = setTimeout(() => {
        const next = focused.value ?? pinned.value;
        active.value = next === dismissed.value ? null : next;
    }, 180);
}
function leave(id: string) {
    if (dismissed.value === id) dismissed.value = null;
    scheduleHide();
}
function focus(id: string) {
    if (dismissed.value === id) return;
    focused.value = id;
    show(id);
}
function blur() {
    focused.value = null;
    dismissed.value = null;
    scheduleHide();
}
function dismiss() {
    cancelHide();
    if (active.value) dismissed.value = active.value;
    pinned.value = null;
    focused.value = null;
    active.value = null;
}
function toggle(id: string) {
    dismissed.value = null;
    if (pinned.value === id) dismiss();
    else {
        pinned.value = id;
        show(id);
    }
}
function closeOutside(event: PointerEvent) {
    if (
        pinned.value &&
        event.target instanceof Node &&
        !chartRoot.value?.contains(event.target)
    )
        dismiss();
}
function closeOnEscape(event: KeyboardEvent) {
    if (event.key === "Escape" && active.value) dismiss();
}
function syncSize() {
    const element = chartRoot.value;
    if (element && element.clientWidth > 0) {
        size.value = {
            width: element.clientWidth,
            height: element.clientHeight,
        };
    }
}
function observePlot() {
    observer?.disconnect();
    if (chartRoot.value) {
        syncSize();
        observer?.observe(chartRoot.value);
    }
}
// A .client component can receive its DOM ref after its mounted hook, so also
// attach the observer when the plot ref becomes available.
watch(chartRoot, observePlot, { flush: "post" });
onMounted(() => {
    observer = new ResizeObserver(syncSize);
    observePlot();
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape, true);
});
onBeforeUnmount(() => {
    observer?.disconnect();
    cancelHide();
    document.removeEventListener("pointerdown", closeOutside);
    document.removeEventListener("keydown", closeOnEscape, true);
});
</script>

<template>
    <div
        class="radar-container"
        :style="{
            '--fixed-color': colors.fixed,
            '--developable-color': colors.developable,
        }"
        @keydown.esc.stop="dismiss"
    >
        <div ref="chartRoot" class="radar-plot">
            <div class="absolute inset-0" aria-hidden="true">
                <VChart
                    :option="option"
                    :theme="theme"
                    :init-options="{ renderer: 'svg' }"
                    :update-options="{ notMerge: true }"
                    autoresize
                    class="h-full w-full"
                />
            </div>
            <div
                role="group"
                :aria-label="`${label}: six dimensions, scored from 1 to 5`"
            >
                <component
                    v-for="(dimension, index) in dimensions"
                    :is="hasExplanation(dimension) ? 'button' : 'span'"
                    :key="dimension.key"
                    :type="hasExplanation(dimension) ? 'button' : undefined"
                    :role="hasExplanation(dimension) ? undefined : 'img'"
                    class="radar-axis"
                    :style="axisStyle(index)"
                    :aria-label="axisLabel(dimension, index)"
                    :aria-describedby="
                        active === `axis-${index}`
                            ? `${tooltipId}-${active}`
                            : undefined
                    "
                    @pointerenter="
                        hasExplanation(dimension) && show(`axis-${index}`)
                    "
                    @pointerleave="leave(`axis-${index}`)"
                    @focus="hasExplanation(dimension) && focus(`axis-${index}`)"
                    @blur="blur"
                    @click="
                        hasExplanation(dimension) && toggle(`axis-${index}`)
                    "
                >
                    {{ dimension.key }}
                </component>
                <component
                    v-for="point in points"
                    :is="hasExplanation(point.dimension) ? 'button' : 'span'"
                    :key="point.id"
                    :type="
                        hasExplanation(point.dimension) ? 'button' : undefined
                    "
                    :role="hasExplanation(point.dimension) ? undefined : 'img'"
                    :tabindex="hasExplanation(point.dimension) ? -1 : undefined"
                    class="radar-point"
                    :class="{
                        'radar-point--developable': point.dimension.developable,
                        'radar-point--before': point.phase === 'before',
                    }"
                    :style="{
                        left: `${point.position[0]}px`,
                        top: `${point.position[1]}px`,
                    }"
                    :aria-label="pointLabel(point)"
                    :aria-describedby="
                        active === pointTargetId(point)
                            ? `${tooltipId}-${active}`
                            : undefined
                    "
                    @pointerenter="
                        hasExplanation(point.dimension) &&
                        show(pointTargetId(point))
                    "
                    @pointerleave="leave(pointTargetId(point))"
                    @focus="
                        hasExplanation(point.dimension) &&
                        focus(pointTargetId(point))
                    "
                    @blur="blur"
                    @click="
                        hasExplanation(point.dimension) &&
                        toggle(pointTargetId(point))
                    "
                >
                    <span class="radar-marker" aria-hidden="true"></span>
                    <span
                        v-if="point.phase !== 'before'"
                        class="radar-score"
                        aria-hidden="true"
                        :class="{
                            'radar-score--below':
                                point.index >= 2 && point.index <= 4,
                        }"
                        >{{ point.dimension.score }}</span
                    >
                </component>
            </div>
            <Transition name="radar-popover">
                <div
                    v-if="activeTarget"
                    :key="activeTarget.id"
                    ref="tooltip"
                    :id="`${tooltipId}-${activeTarget.id}`"
                    role="tooltip"
                    class="radar-tooltip"
                    :style="tooltipStyle"
                    @pointerenter="cancelHide"
                    @pointerleave="scheduleHide"
                >
                    <div class="radar-tooltip-shadow" aria-hidden="true"></div>
                    <div
                        class="radar-tooltip-content inline-annotation-content"
                    >
                        <p class="radar-tooltip-title">
                            {{ activeTarget.title }}
                        </p>
                        <div
                            v-for="line in activeTarget.lines"
                            :key="line.label"
                            class="radar-tooltip-entry"
                        >
                            <p class="radar-tooltip-score">
                                {{ line.label ? `${line.label} · ` : ""
                                }}{{ line.score }} / 5
                            </p>
                        </div>
                        <p class="radar-tooltip-explanation">
                            {{ activeTarget.explanation }}
                        </p>
                    </div>
                </div>
            </Transition>
        </div>
        <div class="radar-legends" aria-label="Chart legend">
            <span class="radar-legend-item"
                ><span
                    class="radar-legend radar-legend--fixed"
                    :class="{ 'radar-legend--reference': comparison }"
                    aria-hidden="true"
                ></span
                >Fixed characteristics</span
            >
            <template v-if="comparison">
                <span class="radar-legend-item"
                    ><span
                        class="radar-legend radar-legend--before"
                        aria-hidden="true"
                    ></span
                    >Before activity</span
                >
                <span class="radar-legend-item"
                    ><span
                        class="radar-legend radar-legend--after"
                        aria-hidden="true"
                    ></span
                    >After activity</span
                >
            </template>
            <span v-else class="radar-legend-item"
                ><span
                    class="radar-legend radar-legend--before"
                    aria-hidden="true"
                ></span
                >Developable characteristics</span
            >
        </div>
    </div>
</template>

<style scoped>
.radar-container {
    container-type: inline-size;
    padding: 0 0.5rem 2rem;
    font-family: var(--font-belanosima);
}
.radar-plot {
    position: relative;
    height: clamp(25rem, 90cqi, 37rem);
    max-width: 48rem;
    margin-inline: auto;
}
.radar-axis,
.radar-point {
    position: absolute;
    transform: translate(-50%, -50%);
    cursor: default;
    border-radius: 0.5rem;
    font-family: var(--font-belanosima);
}
.radar-axis {
    display: grid;
    place-items: center;
    width: clamp(5.5rem, 19cqi, 10rem);
    min-height: 44px;
    padding: 0.25rem;
    font-size: clamp(0.875rem, 2.6cqi, 1.125rem);
    line-height: 1.25;
    text-align: center;
}
button.radar-axis,
button.radar-point {
    cursor: pointer;
}
button.radar-axis:hover {
    text-decoration: underline;
    text-decoration-color: var(--accent);
    text-underline-offset: 0.2em;
}
.radar-axis:focus-visible,
.radar-point:focus-visible {
    outline: 2px solid var(--outline);
    outline-offset: 3px;
}
.radar-point {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    color: var(--fixed-color);
}
.radar-point--developable {
    color: var(--developable-color);
}
.radar-marker {
    width: 14px;
    height: 14px;
    border: 2px solid var(--secondary);
    border-radius: 50%;
    background: currentColor;
}
.radar-point--developable:not(.radar-point--before) .radar-marker {
    transform: rotate(45deg);
    border-radius: 2px;
}
.radar-point--before .radar-marker {
    width: 12px;
    height: 12px;
    background: var(--secondary);
    border-color: currentColor;
}
.radar-score {
    position: absolute;
    bottom: 34px;
    font-size: 1rem;
    line-height: 1;
    color: var(--on-secondary);
    background: var(--secondary);
    border-radius: 0.25rem;
    padding: 2px 3px;
}
.radar-score--below {
    top: 34px;
    bottom: auto;
}
.radar-tooltip {
    position: absolute;
    z-index: 30;
    isolation: isolate;
    font-family: var(--font-main);
    font-size: 0.875rem;
    line-height: 1.6;
    overflow-wrap: anywhere;
}
.radar-tooltip-shadow {
    position: absolute;
    inset: 0;
    z-index: -1;
    transform: translate(4px, 4px);
    border-radius: 0.75rem;
    background: var(--primary);
    pointer-events: none;
}
.radar-tooltip-content {
    position: relative;
    border-radius: 0.75rem;
    background: var(--surface-elevated);
    padding: 0.75rem 1rem;
    color: var(--on-surface);
    box-shadow: 0 8px 20px #0002;
    max-height: inherit;
    overflow-y: auto;
}
.radar-tooltip-title {
    margin: 0 0 0.4rem;
    font-family: var(--font-belanosima);
    font-size: 1.125rem;
    line-height: 1.3;
}
.radar-tooltip-score {
    margin: 0 0 0.25rem;
    font-family: var(--font-belanosima);
    font-size: 1rem;
}
.radar-tooltip-explanation {
    margin: 0;
    font-family: var(--font-main);
}
.radar-popover-enter-active,
.radar-popover-leave-active {
    transition:
        opacity 160ms ease,
        transform 160ms ease;
}
.radar-popover-enter-from,
.radar-popover-leave-to {
    opacity: 0;
    transform: translateY(6px) scale(0.975);
}
.radar-legends {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    column-gap: clamp(2rem, 7cqi, 4rem);
    row-gap: 1rem;
    padding: 1.25rem 0.5rem 0.5rem;
    font-size: 1rem;
    line-height: 1.4;
}
.radar-legend-item {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    white-space: nowrap;
}
.radar-legend {
    position: relative;
    display: inline-block;
    flex-shrink: 0;
    width: 2rem;
    border-top: 3px solid;
}
.radar-legend--fixed {
    border-color: var(--fixed-color);
}
.radar-legend--before,
.radar-legend--after {
    border-color: var(--developable-color);
}
.radar-legend--before {
    border-top-style: dashed;
}
.radar-legend--reference {
    width: 0.875rem;
    height: 0.875rem;
    border: 0;
    border-radius: 50%;
    background: var(--fixed-color);
}
@media (prefers-reduced-motion: reduce) {
    .radar-popover-enter-active,
    .radar-popover-leave-active {
        transition: none;
    }
    .radar-popover-enter-from,
    .radar-popover-leave-to {
        transform: none;
    }
}
</style>
