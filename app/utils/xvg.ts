export type XvgSeries = {
    name: string;
    values: Array<[number, number]>;
};

export type ParsedXvg = {
    title: string;
    subtitle: string;
    xAxisLabel: string;
    yAxisLabel: string;
    series: XvgSeries[];
};

const quotedValuePattern = /"([^"]*)"/;

function getQuotedValue(line: string) {
    return line.match(quotedValuePattern)?.[1]?.trim() ?? "";
}

export function parseXvg(xvgText: string, fallbackSeriesName = "RMSD"): ParsedXvg {
    const metadata = {
        title: "",
        subtitle: "",
        xAxisLabel: "",
        yAxisLabel: "",
    };
    const numericRows: number[][] = [];

    for (const rawLine of xvgText.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line) continue;

        if (line.startsWith("#")) continue;

        if (line.startsWith("@")) {
            if (line.includes(" title ")) metadata.title = getQuotedValue(line);
            if (line.includes(" subtitle ")) metadata.subtitle = getQuotedValue(line);
            if (line.includes(" xaxis ") && line.includes(" label ")) {
                metadata.xAxisLabel = getQuotedValue(line);
            }
            if (line.includes(" yaxis ") && line.includes(" label ")) {
                metadata.yAxisLabel = getQuotedValue(line);
            }
            continue;
        }

        const values = line
            .split(/\s+/)
            .map(Number)
            .filter((value) => Number.isFinite(value));

        if (values.length >= 2) numericRows.push(values);
    }

    const seriesCount = Math.max(
        1,
        numericRows.reduce((count, row) => Math.max(count, row.length - 1), 0),
    );

    const series = Array.from({ length: seriesCount }, (_, seriesIndex) => ({
        name:
            seriesCount === 1
                ? metadata.title || fallbackSeriesName
                : `${fallbackSeriesName} ${seriesIndex + 1}`,
        values: numericRows
            .filter((row) => Number.isFinite(row[seriesIndex + 1]))
            .map((row) => [row[0], row[seriesIndex + 1]] as [number, number]),
    }));

    return {
        title: metadata.title || fallbackSeriesName,
        subtitle: metadata.subtitle,
        xAxisLabel: metadata.xAxisLabel || "Time",
        yAxisLabel: metadata.yAxisLabel || fallbackSeriesName,
        series,
    };
}
