<template>
    <div
        class="flex w-full flex-col rounded border border-surface-tint bg-secondary p-4 text-on-secondary"
        :class="heightClass"
    >
        <div
            v-if="errorMessage"
            class="flex flex-1 items-center justify-center text-sm"
        >
            {{ errorMessage }}
        </div>
        <div
            v-else-if="pending"
            class="flex flex-1 items-center justify-center text-sm"
        >
            Loading RMSD data...
        </div>
        <VChart v-else class="min-h-72 flex-1" :option="option" autoresize />
    </div>
</template>

<script setup lang="ts">
import type { EChartsOption } from "echarts";
import { parseXvg } from "~/utils/xvg";

const props = withDefaults(
    defineProps<{
        xvg?: string | string[];
        src?: string | string[];
        title?: string;
        seriesName?: string | string[];
        heightClass?: string;
    }>(),
    {
        title: "",
        heightClass: "min-h-80",
    },
);

const heightClass = computed(() => props.heightClass);

const fetchedXvg = ref<string[]>([]);
const pending = ref(false);
const errorMessage = ref("");

function toArray<T>(value: T | T[] | undefined): T[] {
    if (value === undefined) return [];
    return Array.isArray(value) ? value : [value];
}

const xvgInputs = computed(() => toArray(props.xvg).filter(Boolean));
const srcInputs = computed(() => toArray(props.src).filter(Boolean));
const seriesNames = computed(() => toArray(props.seriesName));

watchEffect(async () => {
    errorMessage.value = "";
    fetchedXvg.value = [];

    if (xvgInputs.value.length > 0 || srcInputs.value.length === 0) return;

    pending.value = true;
    try {
        fetchedXvg.value = await Promise.all(
            srcInputs.value.map((src) =>
                $fetch<string>(src, { responseType: "text" }),
            ),
        );
    } catch (error) {
        errorMessage.value =
            error instanceof Error
                ? error.message
                : "Failed to load RMSD data.";
    } finally {
        pending.value = false;
    }
});

const parsedItems = computed(() => {
    const inputs =
        xvgInputs.value.length > 0 ? xvgInputs.value : fetchedXvg.value;

    return inputs.map((xvg, index) =>
        parseXvg(xvg, seriesNames.value[index] || `RMSD ${index + 1}`),
    );
});

const firstParsed = computed(
    () => parsedItems.value[0] ?? parseXvg("", "RMSD"),
);

const allSeries = computed(() =>
    parsedItems.value.flatMap((parsed, parsedIndex) =>
        parsed.series.map((series, seriesIndex) => ({
            ...series,
            name:
                seriesNames.value[parsedIndex] ||
                (parsed.series.length === 1
                    ? series.name
                    : `${parsed.title} ${seriesIndex + 1}`),
        })),
    ),
);

const xAxisRange = computed(() => {
    let min = Infinity;
    let max = -Infinity;

    for (const series of allSeries.value) {
        for (const [x] of series.values) {
            min = Math.min(min, x);
            max = Math.max(max, x);
        }
    }

    return Number.isFinite(min) && Number.isFinite(max) ? { min, max } : null;
});

const option = computed<EChartsOption>(() => ({
    title: {
        text: props.title || firstParsed.value.title,
        subtext: firstParsed.value.subtitle,
        left: "center",
    },
    legend: {
        top: firstParsed.value.subtitle ? 56 : 36,
        type: "scroll",
    },
    tooltip: {
        trigger: "axis",
        valueFormatter: (value) =>
            typeof value === "number" ? value.toFixed(3) : String(value),
    },
    toolbox: {
        show: true,
        right: 16,
        feature: {
            dataZoom: {
                xAxisIndex: 0,
                yAxisIndex: "none",
            },
            restore: {},
            saveAsImage: {},
        },
    },
    dataZoom: [
        {
            type: "inside",
            xAxisIndex: 0,
            filterMode: "none",
        },
        {
            type: "slider",
            xAxisIndex: 0,
            filterMode: "none",
            bottom: 12,
        },
    ],
    grid: {
        top: firstParsed.value.subtitle ? 104 : 84,
        right: 28,
        bottom: 90,
        left: 64,
        containLabel: true,
    },
    xAxis: {
        type: "value",
        min: xAxisRange.value?.min,
        max: xAxisRange.value?.max,
        name: firstParsed.value.xAxisLabel,
        nameLocation: "middle",
        nameGap: 32,
    },
    yAxis: {
        type: "value",
        name: firstParsed.value.yAxisLabel,
        nameLocation: "middle",
        nameGap: 44,
        scale: true,
    },
    series: allSeries.value.map((series) => ({
        name: series.name,
        type: "line",
        data: series.values,
        showSymbol: false,
        smooth: false,
        lineStyle: {
            width: 2,
        },
        emphasis: {
            focus: "series",
        },
    })),
}));
</script>
