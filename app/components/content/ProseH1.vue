<template>
    <h1
        :id="props.id"
        class="mt-10 mb-6 scroll-mt-24 font-lilita-one text-4xl leading-tight font-bold sm:text-5xl"
    >
        <a
            v-if="generate"
            :href="`#${props.id}`"
            class="text-inherit no-underline"
        >
            <slot />
        </a>
        <slot v-else />
    </h1>
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
                headings?.anchorLinks?.h1)),
);
</script>
