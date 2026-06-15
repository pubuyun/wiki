<template>
    <NuxtLink
        :href="props.href"
        :target="props.target"
        class="text-primary-norm decoration-primary-norm/30 hover:text-primary-norm/80 font-semibold underline decoration-2 underline-offset-4 transition-colors hover:decoration-primary-dark/60"
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
