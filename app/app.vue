<template>
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
</template>

<style>
@import "./styles/main.css";
</style>

<script setup lang="ts">
import { wikiTheme } from "./styles/echarts";

provide(THEME_KEY, wikiTheme);
</script>
