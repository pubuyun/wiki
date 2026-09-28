<script setup lang="ts">
import {
    CollapsibleContent,
    CollapsibleRoot,
    CollapsibleTrigger,
} from "reka-ui";

defineProps<{
    title: string;
    id?: string;
}>();
</script>

<template>
    <CollapsibleRoot
        :default-open="false"
        :unmount-on-hide="false"
        class="flex min-w-0 flex-col gap-4"
    >
        <h2
            :id="id"
            class="flex scroll-mt-24 flex-row items-center justify-center gap-3 sm:gap-8"
        >
            <CollapsibleTrigger
                class="group flex h-min max-w-full min-w-0 rounded-4xl bg-accent text-on-accent transition-colors hover:bg-accent/90 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-outline"
            >
                <span
                    class="mx-3 my-1.5 flex min-w-0 items-center justify-center gap-2 p-2 text-center font-momo-trust-display text-3xl break-words sm:mx-6 sm:gap-3 sm:text-4xl"
                >
                    {{ title }}
                    <svg
                        class="size-7 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <path d="m5 7.5 5 5 5-5" />
                    </svg>
                </span>
            </CollapsibleTrigger>
            <span
                aria-hidden="true"
                class="my-10 min-w-3 flex-1 border-3 border-t-2 border-accent"
            />
        </h2>

        <CollapsibleContent class="relative -translate-x-2 pr-2">
            <div
                class="absolute inset-0 translate-x-2 translate-y-4 rounded-2xl bg-primary sm:rounded-3xl lg:rounded-4xl"
                aria-hidden="true"
            />
            <div
                class="content paragraph overflow-wrap-anywhere relative min-w-0 rounded-2xl bg-secondary p-4 text-on-secondary sm:rounded-3xl sm:p-5 lg:rounded-4xl lg:p-6"
            >
                <slot />
            </div>
        </CollapsibleContent>
    </CollapsibleRoot>
</template>

<style scoped>
.overflow-wrap-anywhere {
    overflow-wrap: anywhere;
}
</style>
