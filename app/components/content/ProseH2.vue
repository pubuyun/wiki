<template>
    <h2
        :id="props.id"
        class="flex scroll-mt-24 flex-row items-center justify-center gap-8"
    >
        <!-- 这个h2必须在最外层 -->
        <span class="flex h-min rounded-4xl bg-tertiary">
            <span
                class="mx-6 my-1.5 flex items-center justify-center text-center font-momo-trust-display text-4xl text-primary-dark"
            >
                <a
                    v-if="props.id && generate"
                    :href="`#${props.id}`"
                    class="p-2 text-inherit no-underline"
                    @click="scrollToHash($event, props.id)"
                >
                    <slot />
                </a>
                <span v-else>
                    <slot />
                </span>
            </span>
        </span>
        <span
            aria-hidden="true"
            class="my-10 flex-1 border-3 border-t-2 border-tertiary"
        />
    </h2>
</template>

<script setup lang="ts">
import { computed, useRuntimeConfig } from "#imports";

const props = defineProps<{ id?: string }>();
const { scrollToHash } = useHashScroll();

const { headings } = useRuntimeConfig().public.mdc;
const generate = computed(
    () =>
        props.id &&
        ((typeof headings?.anchorLinks === "boolean" &&
            headings?.anchorLinks === true) ||
            (typeof headings?.anchorLinks === "object" &&
                headings?.anchorLinks?.h2)),
);
</script>
