import type { EChartsOption } from "echarts";

const seriesLoaders = {
    line: () => import("./echarts/line.ts"),
    bar: () => import("./echarts/bar.ts"),
    heatmap: () => import("./echarts/heatmap.ts"),
    custom: () => import("./echarts/custom.ts"),
    radar: () => import("./echarts/radar.ts"),
};

export async function loadEchartsFeatures(
    option: EChartsOption,
    renderer: "svg" | "canvas",
) {
    const loaders: Array<() => Promise<unknown>> = [
        () => import("./echarts/base.ts"),
        renderer === "canvas"
            ? () => import("./echarts/canvas.ts")
            : () => import("./echarts/svg.ts"),
    ];
    const series = Array.isArray(option.series)
        ? option.series
        : [option.series];
    const types = new Set(series.map((item) => item?.type).filter(Boolean));

    for (const type of types) {
        const loader = Object.hasOwn(seriesLoaders, type!)
            ? seriesLoaders[type as keyof typeof seriesLoaders]
            : undefined;
        if (!loader) throw new Error(`Unsupported chart series: ${type}.`);
        loaders.push(loader);
    }
    if (option.dataZoom != null)
        loaders.push(() => import("./echarts/zoom.ts"));
    if (option.visualMap != null)
        loaders.push(() => import("./echarts/visual-map.ts"));
    if (option.graphic != null)
        loaders.push(() => import("./echarts/graphic.ts"));

    await Promise.all(loaders.map((load) => load()));
}
