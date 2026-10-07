<template>
    <h5
        :id="props.id"
        class="mt-6 mb-2 scroll-mt-24 font-main text-lg leading-snug font-semibold text-balance wrap-anywhere text-on-surface sm:mt-7 sm:text-xl"
    >
        <a
            v-if="props.id && generate"
            :href="`#${props.id}`"
            class="rounded-sm text-inherit no-underline decoration-primary/60 decoration-2 underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
            <slot />
        </a>
        <slot v-else />
    </h5>
</template>

<script setup lang="ts">
import { computed, useRuntimeConfig } from "#imports";

const props = defineProps<{ id?: string }>();

const { headings } = useRuntimeConfig().public.mdc;
const generate = computed(
    () =>
        props.id &&
        ((typeof headings?.anchorLinks === "boolean" &&
            headings?.anchorLinks === true) ||
            (typeof headings?.anchorLinks === "object" &&
                headings?.anchorLinks?.h5)),
);
</script>
