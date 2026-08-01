<template>
    <figure
        class="w-full overflow-hidden rounded border border-surface-bright bg-secondary p-4 text-on-secondary"
    >
        <div
            v-if="errorMessage"
            class="flex min-h-72 items-center justify-center px-6 text-center text-sm"
            role="status"
        >
            {{ errorMessage }}
        </div>
        <TabsRoot v-else default-value="cycle1" class="w-full">
            <TabsList
                class="mx-auto mb-4 flex w-fit gap-1 rounded-full border border-surface-bright bg-surface-elevated p-1 font-momo-trust-display"
                aria-label="Binder design cycles"
            >
                <TabsTrigger
                    v-for="cycle in cycles"
                    :key="cycle.value"
                    :value="cycle.value"
                    class="group flex items-center gap-2 rounded-full px-5 py-2 text-sm text-primary transition-colors outline-none hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-outline data-[state=active]:bg-primary data-[state=active]:text-on-primary"
                >
                    <span>{{ cycle.label }}</span>
                    <span
                        class="rounded-full bg-surface px-2 py-0.5 text-xs text-on-surface group-data-[state=active]:bg-on-primary/15 group-data-[state=active]:text-on-primary"
                    >
                        {{ rowsByCycle[cycle.value].length }}
                    </span>
                </TabsTrigger>
            </TabsList>

            <TabsContent
                v-for="cycle in cycles"
                :key="cycle.value"
                :value="cycle.value"
                class="outline-none focus-visible:ring-2 focus-visible:ring-outline"
            >
                <div
                    v-if="rowsByCycle[cycle.value].length === 0"
                    class="flex min-h-72 items-center justify-center px-6 text-center text-sm"
                    role="status"
                >
                    No {{ cycle.label }} binder JSON files were found for
                    {{ sourceLabel }}.
                </div>
                <VChart
                    v-else
                    class="w-full"
                    :style="{ height: `${chartHeight(cycle.value)}px` }"
                    :option="optionsByCycle[cycle.value]"
                    autoresize
                />
            </TabsContent>
        </TabsRoot>
        <figcaption class="sr-only">
            Cycle tabs containing heatmaps that compare {{ totalBinderCount }}
            {{ sourceLabel }} binders across seven prediction and stability
            metrics. Cell labels contain the original values.
        </figcaption>
    </figure>
</template>

<script setup lang="ts">
import type { EChartsOption } from "echarts";
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "reka-ui";

type Cycle = "cycle1" | "cycle2";

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
    metric: string;
    rawValue: number | null;
    value: [number, number, number, number | null];
    itemStyle?: { color: string };
}

interface MetricDefinition {
    key: keyof BinderRecord;
    label: string;
    higherIsBetter: boolean;
    digits: number;
}

const props = defineProps<{
    binders: string;
}>();

const cycles: { value: Cycle; label: string }[] = [
    { value: "cycle1", label: "Cycle 1" },
    { value: "cycle2", label: "Cycle 2" },
];

const metrics: MetricDefinition[] = [
    {
        key: "pLDDT(%)",
        label: "pLDDT",
        higherIsBetter: true,
        digits: 2,
    },
    { key: "i_pAE", label: "i_pAE", higherIsBetter: false, digits: 3 },
    { key: "ptm", label: "pTM", higherIsBetter: true, digits: 3 },
    { key: "iptm", label: "ipTM", higherIsBetter: true, digits: 3 },
    {
        key: "conf_ranking_score",
        label: "Ranking score",
        higherIsBetter: true,
        digits: 3,
    },
    {
        key: "cg3m3sh_deltag",
        label: "ΔG",
        higherIsBetter: false,
        digits: 2,
    },
    {
        key: "Melting Temperature",
        label: "Melting temp.",
        higherIsBetter: true,
        digits: 2,
    },
];

const binderModules = import.meta.glob("../../../../data/model/**/*.json", {
    eager: true,
    import: "default",
}) as Record<string, BinderRecord>;

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

    if (number && id) {
        const sequenceLabel = sequence
            ? ` · ${sequence[1].toUpperCase()} ${sequence[2]}`
            : "";
        return `n${number} · id${id}${sequenceLabel}`;
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

const rowsByCycle = computed<Record<Cycle, BinderRow[]>>(() => {
    const records: Record<Cycle, BinderRow[]> = {
        cycle1: [],
        cycle2: [],
    };

    if (!(["proteina", "rosetta"] as string[]).includes(binderSource.value)) {
        return records;
    }

    for (const [modulePath, record] of Object.entries(binderModules)) {
        const path = canonicalDataPath(modulePath);
        const match = path.match(
            /\/data\/model\/(cycle1|cycle2)\/(proteina|rosetta)\/(selected|rejected)\/([^/]+)\.json$/i,
        );

        if (!match || match[2].toLowerCase() !== binderSource.value) continue;

        const cycle = match[1].toLowerCase() as Cycle;
        const name = record.name || record._id || match[4];
        records[cycle].push({
            name,
            shortName: shortBinderName(name),
            record,
        });
    }

    return {
        cycle1: sortRows(records.cycle1),
        cycle2: sortRows(records.cycle2),
    };
});

const errorMessage = computed(() => {
    if (!(["proteina", "rosetta"] as string[]).includes(binderSource.value)) {
        return 'The binders parameter must be either "proteina" or "rosetta".';
    }
    if (
        rowsByCycle.value.cycle1.length === 0 &&
        rowsByCycle.value.cycle2.length === 0
    ) {
        return `No binder JSON files were found for “${props.binders}”.`;
    }
    return "";
});

const totalBinderCount = computed(
    () => rowsByCycle.value.cycle1.length + rowsByCycle.value.cycle2.length,
);

function chartHeight(cycle: Cycle): number {
    return Math.max(
        580,
        Math.min(1020, rowsByCycle.value[cycle].length * 31 + 268),
    );
}

function metricValue(row: BinderRow, metric: MetricDefinition): number | null {
    const value = row.record[metric.key];
    return isFiniteNumber(value) ? value : null;
}

function formatValue(value: number | null, digits: number): string {
    if (value === null) return "—";
    return value.toFixed(digits).replace(/\.?0+$/, "");
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

function buildOption(cycle: Cycle, rows: BinderRow[]): EChartsOption {
    const cycleLabel = cycles.find((item) => item.value === cycle)?.label;

    return {
        title: {
            text: `${cycleLabel} binder performance`,
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
                    `<strong>${escapeHtml(datum.name)}</strong>`,
                    escapeHtml(datum.metric),
                    `Value: <strong>${formatValue(datum.rawValue, metric?.digits ?? 3)}</strong>`,
                ].join("<br>");
            },
        },
        grid: {
            top: 150,
            right: 34,
            bottom: 30,
            left: 210,
            containLabel: false,
        },
        xAxis: {
            type: "category",
            data: metrics.map((metric) => metric.label),
            position: "top",
            splitArea: { show: true },
            axisLabel: {
                interval: 0,
                rotate: 0,
                fontSize: 11,
                lineHeight: 14,
                formatter: (value: string) =>
                    value
                        .replace("Ranking score", "Ranking\nscore")
                        .replace("Melting temp.", "Melting\ntemp."),
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
            },
        },
        visualMap: {
            min: 0,
            max: 1,
            dimension: 2,
            orient: "horizontal",
            left: "center",
            top: 76,
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
                                : datum.value[2] >= 0.65
                                  ? "light"
                                  : "dark";
                        return `{${textStyle}|${formatValue(datum.rawValue, metric?.digits ?? 3)}}`;
                    },
                    rich: {
                        light: { color: "#ffffff" },
                        dark: { color: "#102a43" },
                        muted: { color: "#ffffff" },
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
        ],
    };
}

const optionsByCycle = computed<Record<Cycle, EChartsOption>>(() => ({
    cycle1: buildOption("cycle1", rowsByCycle.value.cycle1),
    cycle2: buildOption("cycle2", rowsByCycle.value.cycle2),
}));
</script>
