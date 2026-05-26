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
    <div class="search-bar flex-col">
        <input
            v-model="query"
            placeholder="Search..."
            class="h-full border rounded w-auto px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <ul class="absolute bg-white border mt-1 w-120 max-h-60 overflow-auto">
            <li v-for="link of result" :key="link.id" class="mt-2">
                <NuxtLink :to="link.id" @click="query = ''">
                    <div>
                        {{
                            link.title
                        }}
                        <p class="text-gray-500 text-xs">{{ link.content }}</p>
                    </div>
                </NuxtLink>
            </li>
            
        </ul>
    </div>
</template>
