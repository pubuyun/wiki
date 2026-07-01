<template>
    <NuxtLink
        :href="props.href"
        :target="props.target"
        class="hover:decoration-text-emphasized/60 font-semibold text-accent-primary underline decoration-accent-primary/30 decoration-2 underline-offset-4 transition-colors hover:text-accent-primary/80"
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
