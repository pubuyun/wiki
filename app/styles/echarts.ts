export interface WikiThemeMode {
    dark?: boolean;
    colorblind?: boolean;
}

interface WikiChartColors {
    primary: string;
    onPrimary: string;
    secondary: string;
    onSecondary: string;
    surface: string;
    onSurface: string;
    surfaceBright: string;
    surfaceElevated: string;
    outline: string;
    outlineVariant: string;
    series: string[];
}

const palettes = {
    light: {
        primary: "#2b6cbf",
        onPrimary: "#ffffff",
        secondary: "#f7fafc",
        onSecondary: "#3f3730",
        surface: "#e5f0f8",
        onSurface: "#334e5f",
        surfaceBright: "#eff9fe",
        surfaceElevated: "#9ed3f3",
        outline: "#58798c",
        outlineVariant: "#8fb5c9",
        series: [
            "#2b6cbf",
            "#2f8f83",
            "#b8873f",
            "#b85c5c",
            "#6f5aa8",
            "#4f7c3a",
        ],
    },
    dark: {
        primary: "#a8d9f9",
        onPrimary: "#03316d",
        secondary: "#0a4296",
        onSecondary: "#f8ffff",
        surface: "#03316d",
        onSurface: "#f8ffff",
        surfaceBright: "#2f85f5",
        surfaceElevated: "#2e6dbf",
        outline: "#f8ffff",
        outlineVariant: "#2e6dbf",
        series: [
            "#a8d9f9",
            "#ffa300",
            "#7ee0c3",
            "#ff9f9f",
            "#d6b5ff",
            "#f8ffff",
        ],
    },
    colorblindLight: {
        primary: "#e69f00",
        onPrimary: "#153866",
        secondary: "#f8ffff",
        onSecondary: "#153866",
        surface: "#0083cc",
        onSurface: "#f8ffff",
        surfaceBright: "#0072b2",
        surfaceElevated: "#0072b2",
        outline: "#0072b2",
        outlineVariant: "#0072b299",
        series: [
            "#e69f00",
            "#0072b2",
            "#009e73",
            "#d55e00",
            "#cc79a7",
            "#56b4e9",
            "#f0e442",
        ],
    },
    colorblindDark: {
        primary: "#e69f00",
        onPrimary: "#000000",
        secondary: "#f8ffff",
        onSecondary: "#000000",
        surface: "#000000",
        onSurface: "#f0e442",
        surfaceBright: "#56b4e9",
        surfaceElevated: "#0072b2",
        outline: "#e69f00",
        outlineVariant: "#f0e44299",
        series: [
            "#e69f00",
            "#56b4e9",
            "#009e73",
            "#f0e442",
            "#d55e00",
            "#cc79a7",
            "#0072b2",
        ],
    },
} satisfies Record<string, WikiChartColors>;

function selectPalette({ dark = false, colorblind = false }: WikiThemeMode) {
    if (colorblind) {
        return dark ? palettes.colorblindDark : palettes.colorblindLight;
    }

    return dark ? palettes.dark : palettes.light;
}

export function createWikiTheme(mode: WikiThemeMode = {}) {
    const colors = selectPalette(mode);
    const mutedText = colors.outline;
    const gridLine = colors.outlineVariant;

    const axis = {
        axisLine: { lineStyle: { color: colors.outline } },
        axisTick: { lineStyle: { color: colors.outline } },
        axisLabel: { color: colors.onSecondary },
        nameTextStyle: { color: colors.onSecondary },
        splitLine: { lineStyle: { color: gridLine, opacity: 0.55 } },
        splitArea: {
            areaStyle: {
                color: [colors.secondary, colors.surface],
                opacity: 0.32,
            },
        },
    };

    return {
        color: colors.series,
        backgroundColor: "transparent",
        textStyle: {
            color: colors.onSecondary,
            fontFamily: '"Belanosima", sans-serif',
        },
        title: {
            textStyle: {
                color: colors.onSecondary,
                fontFamily: '"Momo Trust Display", sans-serif',
                fontWeight: 400,
            },
            subtextStyle: { color: mutedText },
        },
        legend: {
            textStyle: { color: colors.onSecondary },
            pageTextStyle: { color: colors.onSecondary },
            pageIconColor: colors.primary,
            pageIconInactiveColor: colors.outlineVariant,
        },
        tooltip: {
            backgroundColor: colors.surfaceBright,
            borderColor: colors.outline,
            borderWidth: 1,
            textStyle: { color: colors.onSurface },
            axisPointer: {
                lineStyle: { color: colors.primary },
                crossStyle: { color: colors.primary },
                label: {
                    color: colors.onPrimary,
                    backgroundColor: colors.primary,
                },
            },
        },
        axisPointer: {
            lineStyle: { color: colors.primary },
            crossStyle: { color: colors.primary },
            label: {
                color: colors.onPrimary,
                backgroundColor: colors.primary,
            },
        },
        categoryAxis: axis,
        valueAxis: axis,
        timeAxis: axis,
        logAxis: axis,
        toolbox: {
            iconStyle: { borderColor: colors.onSecondary },
            emphasis: { iconStyle: { borderColor: colors.primary } },
        },
        dataZoom: {
            backgroundColor: colors.surface,
            dataBackground: {
                lineStyle: { color: colors.outline },
                areaStyle: { color: colors.surfaceElevated },
            },
            selectedDataBackground: {
                lineStyle: { color: colors.primary },
                areaStyle: { color: colors.primary },
            },
            fillerColor: `${colors.primary}33`,
            borderColor: colors.outlineVariant,
            handleStyle: {
                color: colors.surfaceBright,
                borderColor: colors.primary,
            },
            moveHandleStyle: { color: colors.primary },
            textStyle: { color: colors.onSecondary },
        },
        visualMap: {
            color: [colors.primary, colors.surfaceElevated, colors.surface],
            textStyle: { color: colors.onSecondary },
        },
        line: {
            symbol: "circle",
            symbolSize: 5,
            lineStyle: { width: 2 },
            emphasis: { focus: "series" },
        },
    };
}

export const wikiTheme = createWikiTheme();
