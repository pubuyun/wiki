<template>
    <div>
        <NuxtAnnouncer />
        <!-- 
            NuxtAnnouncer can announce messages to screen readers.
            const { polite, assertive } = useAnnouncer()

            async function submitForm () {
                try {
                    await $fetch('/api/contact', { method: 'POST', body: formData })
                    polite('Message sent successfully')
                } catch (error) {
                    assertive('Error: Failed to send message')
                }
            }
        -->
        <NuxtRouteAnnouncer />
        <!-- automatically announces route changes -->
        <Loading />
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { THEME_KEY } from "vue-echarts";
import { createWikiTheme } from "./styles/echarts";
import "./styles/opendyslexic.css";

const DARK_MODE_COOKIE = "wiki-dark-mode";
const COLORBLIND_MODE_COOKIE = "wiki-colorblind-mode";

const savedColorblindMode = useCookie<boolean>(COLORBLIND_MODE_COOKIE, {
    default: () => false,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
});
const colorblindMode = useState<boolean>(
    "colorblind-mode",
    () => savedColorblindMode.value,
);
const savedDarkMode = useCookie<boolean>(DARK_MODE_COOKIE, {
    default: () => true,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
});
const darkMode = useState<boolean>("dark-mode", () => savedDarkMode.value);
const dyslexiaMode = useState<boolean>("dyslexia-mode", () => false);

watch(colorblindMode, (enabled) => {
    savedColorblindMode.value = enabled;
});

watch(darkMode, (enabled) => {
    savedDarkMode.value = enabled;
});

const themeClass = computed(() =>
    [
        colorblindMode.value && "colorblind",
        darkMode.value && "dark",
        dyslexiaMode.value && "dyslexia",
    ]
        .filter(Boolean)
        .join(" "),
);

useHead({
    title: "GreatBay-SCIE - iGEM 2026",
    titleTemplate: "%s | GreatBay-SCIE - iGEM 2026",
    bodyAttrs: {
        class: themeClass,
    },
});

const chartTheme = computed(() =>
    createWikiTheme({
        dark: darkMode.value,
        colorblind: colorblindMode.value,
    }),
);

provide(THEME_KEY, chartTheme);
</script>
