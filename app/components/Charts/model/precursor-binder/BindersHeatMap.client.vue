<template>
    <figure
        class="w-full rounded border border-surface-bright bg-secondary p-4 text-on-secondary"
        style="min-width: 0; max-width: 100%"
    >
        <div
            v-if="errorMessage"
            class="flex min-h-72 items-center justify-center px-6 text-center text-sm"
            role="status"
        >
            {{ errorMessage }}
        </div>
        <template v-else>
            <div
                class="w-full"
                style="
                    min-width: 0;
                    max-width: 100%;
                    overflow-x: auto;
                    overscroll-behavior-inline: contain;
                    -webkit-overflow-scrolling: touch;
                "
                role="region"
                :aria-label="`${sourceLabel} binder heatmap; scroll horizontally to see all metrics`"
                tabindex="0"
            >
                <div
                    :style="{
                        width: '100%',
                        minWidth: '48rem',
                        height: `${chartHeight}px`,
                    }"
                >
                    <VChart
                        class="h-full w-full"
                        :option="chartOption"
                        autoresize
                    />
                </div>
            </div>
            <details class="mt-4 rounded-lg border border-outline p-3">
                <summary class="cursor-pointer font-semibold">
                    View binder data table
                </summary>
                <div
                    class="mt-3 max-w-full overflow-x-auto"
                    role="region"
                    :aria-label="`${sourceLabel} binder data`"
                    tabindex="0"
                >
                    <table class="w-full border-collapse text-sm">
                        <caption class="sr-only">
                            {{
                                sourceLabel
                            }}
                            binder metrics
                        </caption>
                        <thead>
                            <tr>
                                <th
                                    scope="col"
                                    class="border border-outline p-2"
                                >
                                    Binder
                                </th>
                                <th
                                    v-for="metric in metrics"
                                    :key="metric.key"
                                    scope="col"
                                    class="border border-outline p-2"
                                >
                                    {{ metric.label
                                    }}<template v-if="metric.unit">
                                        ({{ metric.unit }})</template
                                    >
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in rows" :key="row.name">
                                <th
                                    scope="row"
                                    class="border border-outline p-2 text-left"
                                >
                                    {{ row.shortName }}
                                </th>
                                <td
                                    v-for="metric in metrics"
                                    :key="metric.key"
                                    class="border border-outline p-2 text-right"
                                >
                                    {{
                                        formatValue(
                                            metricValue(row, metric),
                                            metric.digits,
                                        )
                                    }}
                                    <span class="sr-only"
                                        >,
                                        {{
                                            relativeStrength(row, metric, rows)
                                        }}</span
                                    >
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </details>
        </template>
        <figcaption class="sr-only">
            Heatmap comparing {{ rows.length }} {{ sourceLabel }} binders across
            seven prediction and stability metrics. Cell labels contain the
            original values.
        </figcaption>
    </figure>
</template>

<script setup lang="ts">
import type { CustomSeriesRenderItem, EChartsOption } from "echarts";

interface BinderRecord {
    name?: string;
    _id?: string;
    selected?: boolean;
    "pLDDT(%)"?: number;
    i_pAE?: number;
    ptm?: number;
    iptm?: number;
    conf_ranking_score?: number;
    cg3m3sh_deltag?: number;
    "Melting Temperature"?: number;
}

interface BinderRow {
    name: string;
    shortName: string;
    record: BinderRecord;
}

interface HeatmapDatum {
    name: string;
    shortName: string;
    metric: string;
    rawValue: number | null;
    value: [number, number, number, number | null];
    itemStyle?: { color: string };
}

interface MetricDefinition {
    key: keyof BinderRecord;
    label: string;
    unit: string;
    higherIsBetter: boolean;
    digits: number;
}

const props = defineProps<{
    binders: string;
}>();

const metrics: MetricDefinition[] = [
    {
        key: "pLDDT(%)",
        label: "pLDDT",
        unit: "%",
        higherIsBetter: true,
        digits: 2,
    },
    {
        key: "i_pAE",
        label: "i_pAE",
        unit: "Å",
        higherIsBetter: false,
        digits: 3,
    },
    {
        key: "ptm",
        label: "pTM",
        higherIsBetter: true,
        unit: "",
        digits: 3,
    },
    {
        key: "iptm",
        label: "ipTM",
        unit: "",
        higherIsBetter: true,
        digits: 3,
    },
    {
        key: "conf_ranking_score",
        label: "Ranking score",
        unit: "",
        higherIsBetter: true,
        digits: 3,
    },
    {
        key: "cg3m3sh_deltag",
        label: "ΔG",
        unit: "kcal/mol",
        higherIsBetter: false,
        digits: 2,
    },
    {
        key: "Melting Temperature",
        label: "Melting temp.",
        unit: "°C",
        higherIsBetter: true,
        digits: 2,
    },
];

const binderModules = import.meta.glob(
    "../../../../data/model/precursor-binder/**/*.json",
    {
        eager: true,
        import: "default",
    },
) as Record<string, BinderRecord>;

function canonicalDataPath(path: string): string {
    const normalised = path.trim().replaceAll("\\", "/").replace(/\/+$/, "");
    const modelIndex = normalised.indexOf("data/model/");

    if (modelIndex >= 0) {
        return `app/${normalised.slice(modelIndex)}`;
    }

    return `app/data/model/${normalised.replace(/^\/+/, "")}`;
}

function shortBinderName(name: string): string {
    const number = name.match(/(?:^|_)n_(\d+)/)?.[1];
    const id = name.match(/(?:^|_)id_(\d+)/)?.[1];
    const sequence = name.match(/_(mpnn|self)_seq(\d+)/i);
    const rfdiffusion = name.match(
        /_(l?cg3m3sh)_(\d+)_model_(\d+)\.cif_d(\d+)$/i,
    );

    if (number && id) {
        const sequenceLabel = sequence
            ? ` · ${sequence[1].toUpperCase()} ${sequence[2]}`
            : "";
        return `n${number} · id${id}${sequenceLabel}`;
    }

    if (rfdiffusion) {
        return `${rfdiffusion[1].toUpperCase()} ${rfdiffusion[2]} · M${rfdiffusion[3]} · D${rfdiffusion[4]}`;
    }

    return name.length > 34 ? `${name.slice(0, 31)}…` : name;
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

const binderSource = computed(() => props.binders?.trim().toLowerCase() ?? "");

const sourceLabel = computed(() =>
    binderSource.value === "proteina" ? "Proteina Complexa" : "RFdiffusion",
);

function sortRows(records: BinderRow[]): BinderRow[] {
    return records.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true }),
    );
}

const rows = computed<BinderRow[]>(() => {
    if (!(["proteina", "rosetta"] as string[]).includes(binderSource.value)) {
        return [];
    }

    const records: BinderRow[] = [];

    for (const [modulePath, record] of Object.entries(binderModules)) {
        const path = canonicalDataPath(modulePath);
        const match = path.match(
            /\/data\/model\/precursor-binder\/(proteina|rosetta)\/(selected|rejected)\/([^/]+)\.json$/i,
        );

        if (!match || match[1].toLowerCase() !== binderSource.value) continue;

        const name = record.name || record._id || match[3];
        records.push({
            name,
            shortName: shortBinderName(name),
            record,
        });
    }

    return sortRows(records);
});

const errorMessage = computed(() => {
    if (!(["proteina", "rosetta"] as string[]).includes(binderSource.value)) {
        return 'The binders parameter must be either "proteina" or "rosetta".';
    }
    if (rows.value.length === 0) {
        return `No binder JSON files were found for “${props.binders}”.`;
    }
    return "";
});

const chartHeight = computed(() => Math.max(580, rows.value.length * 31 + 268));

function metricValue(row: BinderRow, metric: MetricDefinition): number | null {
    const value = row.record[metric.key];
    return isFiniteNumber(value) ? value : null;
}

function formatValue(value: number | null, digits: number): string {
    if (value === null) return "—";
    return value.toFixed(digits).replace(/\.?0+$/, "");
}

function relativeStrength(
    row: BinderRow,
    metric: MetricDefinition,
    rows: BinderRow[],
) {
    const value = metricValue(row, metric);
    if (value === null) return "missing value";
    const values = rows
        .map((item) => metricValue(item, metric))
        .filter(isFiniteNumber);
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (min === max) return "equal within this data set";
    const score = (value - min) / (max - min);
    const strength = metric.higherIsBetter ? score : 1 - score;
    return strength >= 0.5
        ? "stronger within this data set"
        : "weaker within this data set";
}

function escapeHtml(value: string): string {
    return value.replace(
        /[&<>'"]/g,
        (character) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;",
            })[character] || character,
    );
}

function buildHeatmapData(rows: BinderRow[]): HeatmapDatum[] {
    const ranges = metrics.map((metric) => {
        const values = rows
            .map((row) => metricValue(row, metric))
            .filter(isFiniteNumber);

        return {
            min: values.length > 0 ? Math.min(...values) : 0,
            max: values.length > 0 ? Math.max(...values) : 0,
        };
    });

    return rows.flatMap((row, rowIndex) =>
        metrics.map((metric, metricIndex) => {
            const rawValue = metricValue(row, metric);
            const { min, max } = ranges[metricIndex];
            let score = -1;

            if (rawValue !== null) {
                score = max === min ? 0.5 : (rawValue - min) / (max - min);
                if (!metric.higherIsBetter) score = 1 - score;
            }

            return {
                name: row.name,
                shortName: row.shortName,
                metric: metric.label,
                rawValue,
                value: [metricIndex, rowIndex, score, rawValue],
                ...(rawValue === null
                    ? { itemStyle: { color: "#94a3b8" } }
                    : {}),
            };
        }),
    );
}

const renderRowSeparator: CustomSeriesRenderItem = (_, api) => {
    const rowIndex = Number(api.value(0));
    const start = api.coord([0, rowIndex]);
    const end = api.coord([metrics.length - 1, rowIndex]);
    const nextRow = api.coord([0, rowIndex + 1]);
    const cellSize = api.size?.([1, 1]);
    const cellWidth = Array.isArray(cellSize) ? cellSize[0] : 0;
    const separatorY = (start[1] + nextRow[1]) / 2;

    return {
        type: "line",
        shape: {
            x1: start[0] - cellWidth / 2,
            y1: separatorY,
            x2: end[0] + cellWidth / 2,
            y2: separatorY,
        },
        style: {
            stroke: "rgba(255,255,255,0.9)",
            lineWidth: 3,
        },
        silent: true,
    };
};

function buildOption(rows: BinderRow[]): EChartsOption {
    return {
        aria: {
            enabled: true,
            label: {
                description: `Heatmap comparing ${rows.length} ${sourceLabel.value} binders across ${metrics.length} metrics. A complete data table follows the chart.`,
            },
        },
        title: {
            text: `${sourceLabel.value} binder performance`,
            subtext: `${rows.length} binders`,
            left: "center",
        },
        tooltip: {
            position: "top",
            formatter: (params: unknown) => {
                const datum = (params as { data: HeatmapDatum }).data;
                const metric = metrics.find(
                    (item) => item.label === datum.metric,
                );

                return [
                    `<strong>${escapeHtml(datum.shortName)}</strong>`,
                    escapeHtml(datum.metric),
                    `Value: <strong>${formatValue(datum.rawValue, metric?.digits ?? 3)}</strong>`,
                ].join("<br>");
            },
        },
        grid: {
            top: 150,
            right: 34,
            bottom: 30,
            left: 34,
            containLabel: true,
        },
        xAxis: {
            type: "category",
            data: metrics.map((metric) =>
                metric.unit ? `${metric.label} / ${metric.unit}` : metric.label,
            ),
            position: "top",
            splitArea: { show: true },
            axisLabel: {
                interval: 0,
                rotate: 0,
                fontSize: 11,
                lineHeight: 14,
            },
        },
        yAxis: {
            type: "category",
            inverse: true,
            data: rows.map((row) => row.shortName),
            splitArea: { show: true },
            axisLabel: {
                width: 186,
                overflow: "truncate",
                margin: 8,
            },
        },
        visualMap: {
            min: 0,
            max: 1,
            dimension: 2,
            orient: "horizontal",
            left: "center",
            top: 88,
            itemWidth: 12,
            itemHeight: 180,
            text: ["Stronger", "Weaker"],
            precision: 2,
            formatter: (value: number) => value.toFixed(2),
            calculable: false,
            inRange: {
                color: ["#f4e6d7", "#e6c36a", "#58a88c", "#176b62"],
            },
        },
        series: [
            {
                name: "Binder metrics",
                type: "heatmap",
                data: buildHeatmapData(rows),
                label: {
                    show: true,
                    fontSize: 10,
                    formatter: (params: unknown) => {
                        const datum = (params as { data: HeatmapDatum }).data;
                        const metric = metrics.find(
                            (item) => item.label === datum.metric,
                        );
                        const textStyle =
                            datum.rawValue === null
                                ? "muted"
                                : datum.value[2] >= 0.9
                                  ? "light"
                                  : "dark";
                        return `{${textStyle}|${formatValue(datum.rawValue, metric?.digits ?? 3)}}`;
                    },
                    rich: {
                        light: { color: "#ffffff" },
                        dark: { color: "#102a43" },
                        muted: { color: "#102a43" },
                    },
                },
                itemStyle: {
                    borderColor: "rgba(255,255,255,0.45)",
                    borderWidth: 1,
                },
                emphasis: {
                    itemStyle: {
                        borderColor: "#102a43",
                        borderWidth: 2,
                        shadowBlur: 8,
                        shadowColor: "rgba(16,42,67,0.28)",
                    },
                },
            },
            {
                name: "Row separators",
                type: "custom",
                coordinateSystem: "cartesian2d",
                data: rows.slice(1).map((_, rowIndex) => [rowIndex]),
                encode: { y: 0 },
                renderItem: renderRowSeparator,
                silent: true,
                tooltip: { show: false },
                animation: false,
                z: 3,
            },
        ],
    };
}

const chartOption = computed<EChartsOption>(() => buildOption(rows.value));
</script>
