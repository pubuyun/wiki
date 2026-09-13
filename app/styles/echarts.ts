export interface WikiThemeMode {
    dark?: boolean;
    highContrast?: boolean;
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
    highContrastLight: {
        primary: "#0046a8",
        onPrimary: "#ffffff",
        secondary: "#ffffff",
        onSecondary: "#000000",
        surface: "#ffffff",
        onSurface: "#000000",
        surfaceBright: "#f2f2f2",
        surfaceElevated: "#e6e6e6",
        outline: "#000000",
        outlineVariant: "#595959",
        series: [
            "#0046a8",
            "#006b3c",
            "#a23b00",
            "#6b21a8",
            "#9b1c31",
            "#4d4d4d",
        ],
    },
    highContrastDark: {
        primary: "#66b2ff",
        onPrimary: "#000000",
        secondary: "#000000",
        onSecondary: "#ffffff",
        surface: "#000000",
        onSurface: "#ffffff",
        surfaceBright: "#1a1a1a",
        surfaceElevated: "#262626",
        outline: "#ffffff",
        outlineVariant: "#b3b3b3",
        series: [
            "#66b2ff",
            "#ffd60a",
            "#68d391",
            "#ff8c42",
            "#e879f9",
            "#ffffff",
        ],
    },
} satisfies Record<string, WikiChartColors>;

function selectPalette({ dark = false, highContrast = false }: WikiThemeMode) {
    if (highContrast) {
        return dark ? palettes.highContrastDark : palettes.highContrastLight;
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
