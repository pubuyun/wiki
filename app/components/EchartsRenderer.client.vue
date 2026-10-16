<script setup lang="ts">
import { graphic } from "echarts/core";
import type { EChartsOption } from "echarts";
import VChart from "vue-echarts";
import { parseEchartsOption } from "~/utils/echarts-option";
import { loadEchartsFeatures } from "~/utils/echarts-features";

const props = withDefaults(
    defineProps<{
        option: string | EChartsOption;
        height?: string | number;
        renderer?: "svg" | "canvas";
        label?: string;
        description?: string;
    }>(),
    {
        height: 400,
        renderer: "svg",
        label: "ECharts chart",
    },
);

const renderError = ref("");
const chartTheme = useWikiChartTheme();
const parsed = computed(() => {
    try {
        const option = parseEchartsOption(props.option, { graphic });
        return {
            option: {
                ...option,
                aria: {
                    enabled: true,
                    ...option.aria,
                    label: {
                        ...(props.description
                            ? { description: props.description }
                            : {}),
                        ...option.aria?.label,
                    },
                },
            },
            error: "",
        };
    } catch (error) {
        return {
            option: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Invalid chart configuration.",
        };
    }
});

const readyOption = shallowRef<EChartsOption | null>(null);
const chartRenderer = ref(props.renderer);
let loadGeneration = 0;

watch(
    [() => parsed.value.option, () => props.renderer],
    async ([option, renderer]) => {
        const generation = ++loadGeneration;
        renderError.value = "";
        if (!option) {
            readyOption.value = null;
            return;
        }

        try {
            await loadEchartsFeatures(option, renderer);
            if (generation !== loadGeneration) return;
            chartRenderer.value = renderer;
            readyOption.value = option;
        } catch (error) {
            if (generation !== loadGeneration) return;
            renderError.value =
                error instanceof Error
                    ? error.message
                    : "Unable to load chart.";
        }
    },
    { immediate: true },
);
onBeforeUnmount(() => loadGeneration++);
onErrorCaptured((error) => {
    renderError.value = error.message;
    return false;
});

const chartHeight = computed(() =>
    typeof props.height === "number" || /^\d+$/.test(props.height)
        ? `${props.height}px`
        : props.height,
);
</script>

<template>
    <p
        v-if="parsed.error || renderError"
        role="alert"
        class="m-0 p-4 text-sm"
        :style="{ height: chartHeight }"
    >
        Unable to render chart: {{ parsed.error || renderError }}
    </p>
    <VChart
        v-else-if="readyOption"
        :key="chartRenderer"
        :theme="chartTheme"
        :option="readyOption"
        :init-options="{ renderer: chartRenderer }"
        :update-options="{ notMerge: true }"
        :style="{ height: chartHeight, width: '100%' }"
        :aria-label="label"
        autoresize
    />
    <p
        v-else
        role="status"
        class="m-0 flex items-center justify-center"
        :style="{ height: chartHeight }"
    >
        Loading chart...
    </p>
</template>
