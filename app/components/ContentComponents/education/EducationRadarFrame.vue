<script setup lang="ts">
defineProps<{ comparison?: boolean }>();
const theme = useWikiChartTheme();
const darkMode = useState<boolean>("dark-mode", () => true);
</script>

<template>
    <div
        class="radar-container"
        :style="{
            '--fixed-color': theme.color[0],
            '--developable-color': theme.color[darkMode ? 1 : 2],
        }"
    >
        <div class="radar-plot"><slot /></div>
        <div class="radar-legends" role="group" aria-label="Chart legend">
            <span class="radar-legend-item"
                ><span
                    class="radar-legend radar-legend--fixed"
                    :class="{ 'radar-legend--reference': comparison }"
                    aria-hidden="true"
                ></span
                >Fixed characteristics</span
            >
            <template v-if="comparison">
                <span class="radar-legend-item"
                    ><span
                        class="radar-legend radar-legend--before"
                        aria-hidden="true"
                    ></span
                    >Before activity</span
                >
                <span class="radar-legend-item"
                    ><span
                        class="radar-legend radar-legend--after"
                        aria-hidden="true"
                    ></span
                    >After activity</span
                >
            </template>
            <span v-else class="radar-legend-item"
                ><span
                    class="radar-legend radar-legend--before"
                    aria-hidden="true"
                ></span
                >Developable characteristics</span
            >
        </div>
    </div>
</template>

<style scoped>
.radar-container {
    container-type: inline-size;
    padding: 0 0.5rem 2rem;
    font-family: var(--font-belanosima);
}
.radar-plot {
    position: relative;
    height: clamp(21.25rem, 76.5cqi, 31.45rem);
    max-width: 48rem;
    margin-inline: auto;
}
.radar-legends {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    column-gap: clamp(2rem, 7cqi, 4rem);
    row-gap: 1rem;
    padding: 1.25rem 0.5rem 0.5rem;
    font-size: 1rem;
    line-height: 1.4;
}
.radar-legend-item {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    white-space: nowrap;
}
.radar-legend {
    position: relative;
    display: inline-block;
    flex-shrink: 0;
    width: 2rem;
    border-top: 3px solid;
}
.radar-legend--fixed {
    border-color: var(--fixed-color);
}
.radar-legend--before,
.radar-legend--after {
    border-color: var(--developable-color);
}
.radar-legend--before {
    border-top-style: dashed;
}
.radar-legend--reference {
    width: 0.875rem;
    height: 0.875rem;
    border: 0;
    border-radius: 50%;
    background: var(--fixed-color);
}
</style>
