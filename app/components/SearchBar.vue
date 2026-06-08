<template>
    <DialogRoot v-model:open="isSearchOpen" class="">
        <!-- Desktop / larger than lg -->
        <DialogTrigger
            aria-label="Open search dialog"
            class="mr-8 ml-5 h-1/2 max-w-96 flex-1 rounded-full bg-cblue pr-3 max-xl:hidden"
        >
            <div class="flex h-full items-center gap-2 p-1 text-white">
                <input
                    class="h-full flex-1 rounded-full bg-white"
                    readonly
                    tabindex="-1"
                />
                <Icon icon="lucide:search" class="h-5 w-5" aria-hidden="true" />
            </div>
        </DialogTrigger>

        <!-- lg and lower -->
        <DialogTrigger
            aria-label="Open search dialog"
            class="z-100 hidden items-center gap-2 rounded-full bg-sun px-4 py-4 text-cblue shadow-md hover:bg-azure focus:ring-2 focus:ring-bermuda focus:ring-offset-2 focus:outline-none max-xl:inline-flex"
        >
            <Icon icon="lucide:search" class="h-5 w-5" aria-hidden="true" />
        </DialogTrigger>

        <DialogPortal>
            <Transition
                enter-active-class="transition-opacity duration-200 ease-out"
                enter-from-class="opacity-0"
                leave-active-class="transition-opacity duration-150 ease-in"
                leave-to-class="opacity-0"
            >
                <DialogOverlay
                    class="fixed top-0 left-0 z-30 h-full w-full bg-black opacity-50"
                />
            </Transition>
            <Transition
                enter-active-class="transition-opacity duration-300 ease-out overflow-hidden"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="transition-[max-height,opacity] duration-400 ease-in overflow-hidden"
                leave-from-class="max-h-[70vh] opacity-100"
                leave-to-class="max-h-0 opacity-0"
            >
                <DialogContent
                    v-if="isSearchOpen"
                    class="fixed top-1/6 left-1/2 z-100 max-h-[70vh] w-1/2 -translate-x-1/2 overflow-hidden rounded-2xl bg-corn p-6 shadow-lg"
                >
                    <DialogTitle class="sr-only">
                        Search site content
                    </DialogTitle>
                    <div
                        class="flex max-h-[calc(70vh-3rem)] w-full flex-col justify-start gap-2"
                    >
                        <header
                            class="shrink-0 text-center text-2xl font-bold text-cblue"
                        >
                            <label for="site-search" class="sr-only">
                                Search site content
                            </label>
                            <input
                                v-model="query"
                                type="search"
                                id="site-search"
                                autocomplete="off"
                                placeholder="Search..."
                                aria-describedby="search-result-count"
                                class="h-10 w-full rounded border px-4 py-2 outline-none"
                            />
                            <p
                                id="search-result-count"
                                class="sr-only"
                                aria-live="polite"
                            >
                                {{ result.length }} search result{{
                                    result.length === 1 ? "" : "s"
                                }}
                                found.
                            </p>
                        </header>

                        <div
                            v-if="hasResults"
                            class="relative mt-2 min-h-0 w-full flex-1"
                        >
                            <div
                                v-if="canScrollUp"
                                class="pointer-events-none absolute top-0 left-0 z-10 h-8 w-full bg-linear-to-b from-corn to-transparent"
                            />

                            <ul
                                ref="resultsList"
                                class="max-h-[calc(70vh-9rem)] w-full scrollbar-thin scrollbar-thumb-azure scrollbar-track-corn overflow-auto"
                                @scroll="updateScrollGradients"
                                aria-label="Search results"
                            >
                                <li
                                    v-for="link of result"
                                    :key="link.id"
                                    class="mt-2 w-full px-4 py-2"
                                >
                                    <NuxtLink
                                        :to="link.id"
                                        @click="
                                            query = '';
                                            isSearchOpen = false;
                                        "
                                    >
                                        <article>
                                            <h3
                                                class="font-momo-trust-display text-lg"
                                            >
                                                {{ displayTitle(link) }}
                                            </h3>

                                            <p
                                                class="text-xs font-normal text-cblue"
                                                v-html="displayContent(link)"
                                            />
                                        </article>
                                    </NuxtLink>
                                </li>
                            </ul>

                            <div
                                v-if="canScrollDown"
                                class="pointer-events-none absolute bottom-0 left-0 z-10 h-8 w-full bg-linear-to-t from-corn to-transparent"
                            />
                        </div>
                        <p
                            v-else-if="query"
                            class="mt-4 text-center text-cblue"
                            aria-live="polite"
                        >
                            No results found.
                        </p>
                    </div>
                </DialogContent>
            </Transition>
        </DialogPortal>
    </DialogRoot>
</template>

<script setup>
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

const isSearchOpen = ref(false);

const query = ref("");
const result = ref([]);
const { search } = useSearchCollection("content", {
    minHeading: "h2",
    maxHeading: "h3",
});

const hasResults = computed(() => result.value.length > 0 && query.value);
let latestSearch = 0;

function displayTitle(link) {
    if (link.level !== 3) return link.title;

    const h2Title = link.titles?.at(-1);
    return h2Title ? `${h2Title} > ${link.title}` : link.title;
}

function displayContent(link) {
    return link.snippets?.content ?? `${link.content.slice(0, 200)}...`;
}

watch(query, async (value) => {
    const currentSearch = ++latestSearch;
    const searchTerm = value.trim();

    if (!searchTerm) {
        result.value = [];
        return;
    }

    const searchResult = await search(searchTerm, {
        limit: 50,
        snippet: {
            columns: ["content"],
            around: 40,
            tag: "strong",
        },
    });

    if (currentSearch === latestSearch) {
        result.value = searchResult;
    }
    console.log(searchResult);
});

// Scroll gradient logic
const resultsList = ref(null);
const canScrollUp = ref(false);
const canScrollDown = ref(false);

function updateScrollGradients() {
    const el = resultsList.value;
    if (!el) return;

    const scrollTop = el.scrollTop;
    const clientHeight = el.clientHeight;
    const scrollHeight = el.scrollHeight;

    canScrollUp.value = scrollTop > 0;
    canScrollDown.value = scrollTop + clientHeight < scrollHeight - 1;
}
watch(
    result,
    async () => {
        await nextTick();
        updateScrollGradients();
    },
    { flush: "post" },
);
</script>
