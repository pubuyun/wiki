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

<style>
@import "./styles/main.css";
</style>

<script setup lang="ts">
import { wikiTheme } from "./styles/echarts";

const THEME_KEY = "theme";

const colorblindMode = useState<boolean>("colorblind-mode", () => false);
const darkMode = useState<boolean>("dark-mode", () => false);
const dyslexiaMode = useState<boolean>("dyslexia-mode", () => false);

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

provide(THEME_KEY, wikiTheme);
</script>
