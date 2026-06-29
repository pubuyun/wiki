<script setup lang="ts">
import {
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuTrigger,
} from "reka-ui";
import { computed } from "vue";

interface DropdownLink {
    to: string;
    label: string;
}

const props = withDefaults(
    defineProps<{
        title: string;
        to?: string;
        links?: DropdownLink[];
    }>(),
    {
        links: () => [],
    },
);

const hasDropdown = computed(() => props.links.length > 0);
</script>

<template>
    <NavigationMenuItem class="relative inline-block">
        <NavigationMenuTrigger
            class="group inline-flex cursor-pointer list-none items-center gap-1 bg-transparent px-1 py-2 text-primary-deep outline-offset-4 select-none hover:text-primary-deep focus-visible:outline-2 focus-visible:outline-primary-deep dark:text-textcolor dark:hover:text-secondary"
        >
            <span
                class="decoration-2 underline-offset-2 group-hover:underline group-focus-visible:underline"
                >{{ title }}</span
            >
            <span
                class="text-lg transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180 group-data-[state=open]:rotate-180"
                aria-hidden="true"
                >&#9662;</span
            >
        </NavigationMenuTrigger>

        <NavigationMenuContent
            force-mount
            class="absolute top-full -left-1/3 z-50 max-h-0 min-w-max overflow-hidden rounded-2xl bg-primary-light text-primary-deep shadow-sm transition-[max-height] duration-500 ease-out data-[state=closed]:pointer-events-none! data-[state=closed]:max-h-0 data-[state=open]:pointer-events-auto! data-[state=open]:max-h-96 dark:text-textcolor"
        >
            <NavigationMenuLink v-for="link in links" :key="link.to" as-child>
                <NuxtLink
                    :to="link.to"
                    @pointerdown.stop
                    class="block px-4 py-2 text-xl text-primary-deep no-underline -outline-offset-2 first:rounded-t-2xl last:rounded-b-2xl hover:bg-primary-norm hover:text-textcolor focus-visible:bg-primary-norm focus-visible:text-textcolor focus-visible:outline-2 focus-visible:outline-primary-deep dark:text-textcolor dark:hover:text-textcolor dark:focus-visible:outline-primary-light"
                >
                    {{ link.label }}
                </NuxtLink>
            </NavigationMenuLink>
        </NavigationMenuContent>
    </NavigationMenuItem>
</template>
