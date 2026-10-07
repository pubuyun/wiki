import { createWikiTheme } from "~/styles/echarts";

/** Keep chart dependencies inside chart components, with the shared site modes. */
export function useWikiChartTheme() {
    const darkMode = useState<boolean>("dark-mode", () => true);
    const highContrastMode = useState<boolean>(
        "high-contrast-mode",
        () => false,
    );

    return computed(() =>
        createWikiTheme({
            dark: darkMode.value,
            highContrast: highContrastMode.value,
        }),
    );
}
