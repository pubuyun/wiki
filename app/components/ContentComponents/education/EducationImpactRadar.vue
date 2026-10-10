<script setup lang="ts">
import {
    readEducationImpact,
    type FixedTargetProfile,
    type EducationImpactProfile,
} from "~/utils/target-profile";

const props = withDefaults(
    defineProps<{
        fixed: FixedTargetProfile;
        impact: EducationImpactProfile;
        explanation?: string;
        title?: string;
    }>(),
    { title: "Education Activity Impact", explanation: "" },
);

const id = useId();
const parsed = computed(() => {
    try {
        return {
            ...readEducationImpact(props.fixed, props.impact),
            error: "",
        };
    } catch (error) {
        return {
            dimensions: [],
            beforeDimensions: [],
            error:
                error instanceof Error
                    ? error.message
                    : "Invalid education impact data.",
        };
    }
});
</script>

<template>
    <figure
        class="education-impact not-prose my-8 min-w-0 text-on-secondary"
        :aria-labelledby="`${id}-title`"
    >
        <figcaption class="radar-caption">
            <p :id="`${id}-title`" class="radar-title">{{ title }}</p>
        </figcaption>
        <p v-if="parsed.error" role="alert" class="m-0 p-4">
            Unable to render education impact: {{ parsed.error }}
        </p>
        <template v-else>
            <ClientOnly>
                <LazyContentComponentsEducationRadarChart
                    :dimensions="parsed.dimensions"
                    :before-dimensions="parsed.beforeDimensions"
                    :label="title"
                />
                <template #fallback>
                    <p
                        role="status"
                        class="m-0 flex min-h-80 items-center justify-center"
                    >
                        Loading education impact chart…
                    </p>
                </template>
            </ClientOnly>
            <ContentComponentsEducationRadarTextAlternative
                :dimensions="parsed.dimensions"
                :before-dimensions="parsed.beforeDimensions"
                :explanation="explanation"
            />
        </template>
    </figure>
</template>

<style scoped>
.education-impact {
    overflow-wrap: anywhere;
}
.radar-caption {
    padding: 0.5rem 1rem 0;
    text-align: center;
}
.radar-title {
    margin: 0;
    font-family: var(--font-belanosima);
    font-size: clamp(1.5rem, 4vw, 2rem);
    line-height: 1.3;
}
</style>
