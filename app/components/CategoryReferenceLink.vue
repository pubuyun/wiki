<script setup lang="ts">
import { Icon } from "@iconify/vue";

withDefaults(
    defineProps<{
        to?: string;
        title: string;
        heading?: "h2" | "h3";
    }>(),
    { heading: "h2" },
);
</script>

<template>
    <NuxtLink
        :to="to"
        class="group col-span-full flex min-w-0 items-center gap-3 border-t-2 border-outline/40 px-1 py-4 text-on-secondary no-underline transition hover:text-on-secondary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-outline"
    >
        <Icon
            icon="lucide:book-open"
            class="size-5 shrink-0"
            aria-hidden="true"
        />
        <component
            :is="heading"
            class="min-w-0 font-belanosima text-xl leading-tight wrap-anywhere underline underline-offset-4"
        >
            {{ title }}
        </component>
        <Icon
            icon="lucide:arrow-right"
            class="ml-auto size-5 shrink-0 transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1"
            aria-hidden="true"
        />
    </NuxtLink>
</template>
