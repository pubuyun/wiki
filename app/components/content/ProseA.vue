<template>
    <NuxtLink
        :href="props.href"
        :target="props.target"
        class="font-semibold text-surface-tint underline decoration-surface-tint/30 decoration-2 underline-offset-4 transition-colors hover:text-surface-tint/80 hover:decoration-on-secondary/60"
        @click="scrollToHash($event, props.href)"
    >
        <slot />
    </NuxtLink>
</template>

<script setup lang="ts">
import type { PropType } from "vue";

const props = defineProps({
    href: {
        type: String,
        default: "",
    },
    target: {
        type: String as PropType<
            | "_blank"
            | "_parent"
            | "_self"
            | "_top"
            | (string & object)
            | null
            | undefined
        >,
        default: undefined,
        required: false,
    },
});

const { scrollToHash } = useHashScroll();
</script>
