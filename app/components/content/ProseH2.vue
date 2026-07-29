<template>
    <h2
        :id="props.id"
        :class="
            isFootNote
                ? 'flex scroll-mt-24 flex-col items-stretch px-2'
                : 'flex scroll-mt-24 flex-row items-center justify-center gap-8'
        "
    >
        <!-- 这个h2必须在最外层 -->
        <span
            v-if="isFootNote"
            class="font-momo-trust-display text-4xl leading-tight text-primary"
        >
            <a
                v-if="props.id && generate"
                :href="`#${props.id}`"
                class="text-inherit no-underline"
                @click="scrollToHash($event, props.id)"
            >
                <slot />
            </a>
            <span v-else>
                <slot />
            </span>
        </span>
        <span v-else class="flex h-min rounded-4xl bg-primary">
            <span
                class="mx-6 my-1.5 flex items-center justify-center text-center font-momo-trust-display text-4xl text-on-primary"
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
            :class="
                isFootNote
                    ? 'mt-2 w-full border-t-3 border-primary'
                    : 'my-10 flex-1 border-3 border-t-2 border-primary'
            "
        />
    </h2>
</template>

<script setup lang="ts">
import { computed, useRuntimeConfig } from "#imports";

const props = defineProps<{ id?: string }>();
const { scrollToHash } = useHashScroll();

const isFootNote = computed(() =>
    ["footnote", "footnotes"].includes(
        (props.id ?? "").replace(/[-_\s]/g, "").toLowerCase(),
    ),
);

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
