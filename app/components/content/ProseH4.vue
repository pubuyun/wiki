<template>
    <h4
        :id="props.id"
        class="mt-7 mb-3 scroll-mt-24 font-belanosima text-xl leading-snug font-semibold"
    >
        <a
            v-if="props.id && generate"
            :href="`#${props.id}`"
            class="text-inherit no-underline"
        >
            <slot />
        </a>
        <slot v-else />
    </h4>
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
                headings?.anchorLinks?.h4)),
);
</script>
