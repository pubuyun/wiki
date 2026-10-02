import type { EChartsOption } from "echarts";

/** Evaluate JavaScript from trusted, repository-authored content on the client. */
export function parseEchartsOption(
    source: string | EChartsOption,
    echarts: unknown,
): EChartsOption {
    let option: unknown = source;

    if (typeof source === "string") {
        const expression = source
            .trim()
            .replace(/^(?:(?:const|let|var)\s+)?option\s*=\s*/, "")
            .replace(/;\s*$/, "");

        if (!expression) {
            throw new Error(
                "Provide an ECharts configuration: option = {...}.",
            );
        }

        // Keep functions and expressions intact, including echarts.graphic helpers.
        // This is executable JavaScript, not a sandbox for untrusted submissions.
        option = new Function(
            "echarts",
            `"use strict"; return (${expression}\n);`,
        )(echarts);
    }

    if (!option || typeof option !== "object" || Array.isArray(option)) {
        throw new Error("The ECharts option must be an object.");
    }

    return option as EChartsOption;
}
