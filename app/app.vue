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
        <div class="fixed right-4 bottom-4 z-50">
            <ColorblindModeToggle />
        </div>
    </div>
</template>

<style>
@import "./styles/main.css";
</style>

<script setup lang="ts">
import ColorblindModeToggle from "./components/NavigationBar/ColorblindModeToggle.vue";
import { wikiTheme } from "./styles/echarts";

const THEME_KEY = "theme";

const colorblindMode = useState<boolean>("colorblind-mode", () => false);
const darkMode = useState<boolean>("dark-mode", () => false);

const themeClass = computed(() =>
    [colorblindMode.value && "colorblind", darkMode.value && "dark"]
        .filter(Boolean)
        .join(" "),
);

useHead({
    bodyAttrs: {
        class: themeClass,
    },
});

provide(THEME_KEY, wikiTheme);
</script>
