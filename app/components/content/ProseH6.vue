<template>
    <h6
        :id="props.id"
        class="mt-6 mb-2 scroll-mt-24 font-main text-sm leading-snug font-bold text-balance wrap-anywhere text-on-surface dark:text-primary"
    >
        <a
            v-if="props.id && generate"
            :href="`#${props.id}`"
            class="text-inherit no-underline"
        >
            <slot />
        </a>
        <slot v-else />
    </h6>
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
                headings?.anchorLinks?.h6)),
);
</script>
