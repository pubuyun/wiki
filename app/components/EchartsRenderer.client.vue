<script setup lang="ts">
import "#build/echarts.mjs";
import * as echarts from "echarts/core";
import type { EChartsOption } from "echarts";
import VChart from "vue-echarts";
import { parseEchartsOption } from "~/utils/echarts-option";

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
        const option = parseEchartsOption(props.option, echarts);
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

watch(parsed, () => {
    renderError.value = "";
});
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
    <p v-if="parsed.error || renderError" role="alert" class="m-0 p-4 text-sm">
        Unable to render chart: {{ parsed.error || renderError }}
    </p>
    <VChart
        v-else-if="parsed.option"
        :theme="chartTheme"
        :option="parsed.option"
        :init-options="{ renderer }"
        :update-options="{ notMerge: true }"
        :style="{ height: chartHeight, width: '100%' }"
        :aria-label="label"
        autoresize
    />
</template>
