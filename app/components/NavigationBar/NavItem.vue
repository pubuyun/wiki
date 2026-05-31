<template>
    <div class="group inline-block">
        <button
            class="inline-flex cursor-default items-center gap-1 px-1 py-2 text-2xl font-bold select-none"
        >
            <NuxtLink v-if="!links || to" :to="`/${to}`">
                {{ title }}
            </NuxtLink>
            <span v-else>{{ title }}</span>
            <span
                v-if="links && links.length > 0"
                class="text-lg transition-transform duration-200 group-hover:rotate-180"
                aria-hidden="true"
                >▼</span
            >
        </button>
        <div
            class="invisible absolute z-50 -translate-y-1 rounded-2xl bg-corn opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
        >
            <NuxtLink
                v-for="link in links"
                :key="link.to"
                :to="link.to"
                class="block px-4 py-2 text-xl text-cblue no-underline hover:bg-azure"
            >
                {{ link.label }}
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
interface DropdownLink {
    to: string;
    label: string;
}

defineProps<{
    title: string;
    to?: string;
    links?: DropdownLink[];
}>();
</script>
