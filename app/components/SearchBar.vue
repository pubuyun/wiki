<script setup>
import MiniSearch from "minisearch";

const query = ref("");
const { data } = await useAsyncData("search", () =>
    queryCollectionSearchSections("content"),
);

const miniSearch = new MiniSearch({
    fields: ["title", "content"],
    storeFields: ["title", "content"],
    searchOptions: {
        prefix: true,
        fuzzy: 0.2,
    },
});

// Add data to the MiniSearch instance
miniSearch.addAll(toValue(data.value) ?? []);
const result = computed(() => miniSearch.search(toValue(query)));
</script>

<template>
    <div class="search-bar w-1/4 flex-col">
        <input
            v-model="query"
            placeholder="Search..."
            class="h-full w-full rounded border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <ul
            class="absolute mt-1 max-h-60 w-1/4 overflow-auto border bg-white"
            :class="result.length > 0 ? 'block' : 'hidden'"
        >
            <li v-for="link of result" :key="link.id" class="mt-2">
                <NuxtLink :to="link.id" @click="query = ''">
                    <div>
                        {{ link.title }}
                        <p class="text-xs text-gray-500">{{ link.content }}</p>
                    </div>
                </NuxtLink>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from "radix-vue";
import { Icon } from "@iconify/vue";
</script>
