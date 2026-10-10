<script setup lang="ts">
import { readTargetProfile, type TargetProfile } from "~/utils/target-profile";

const props = withDefaults(
    defineProps<{
        profile: TargetProfile;
        explanation?: string;
        title?: string;
    }>(),
    { title: "Target Profile Radar", explanation: "" },
);

const id = useId();
const parsed = computed(() => {
    try {
        return { dimensions: readTargetProfile(props.profile), error: "" };
    } catch (error) {
        return {
            dimensions: [],
            error:
                error instanceof Error
                    ? error.message
                    : "Invalid target profile.",
        };
    }
});
</script>

<template>
    <figure
        class="target-profile not-prose my-8 min-w-0 text-on-secondary"
        :aria-labelledby="`${id}-title`"
    >
        <figcaption class="radar-caption">
            <p :id="`${id}-title`" class="radar-title">
                {{ title }}
            </p>
        </figcaption>

        <p v-if="parsed.error" role="alert" class="m-0 p-4 sm:p-6">
            Unable to render target profile: {{ parsed.error }}
        </p>
        <template v-else>
            <ClientOnly>
                <LazyContentComponentsEducationRadarChart
                    :dimensions="parsed.dimensions"
                    :label="title"
                />
                <template #fallback>
                    <p
                        role="status"
                        class="m-0 flex min-h-80 items-center justify-center"
                    >
                        Loading target profile chart…
                    </p>
                </template>
            </ClientOnly>

            <ContentComponentsEducationRadarTextAlternative
                :dimensions="parsed.dimensions"
                :explanation="explanation"
            />
        </template>
    </figure>
</template>

<style scoped>
.target-profile {
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
