<template>
    <DialogRoot v-model:open="isSearchOpen" class="">
        <!-- Desktop / larger than lg -->
        <DialogTrigger
            aria-label="Open search dialog"
            class="flex size-9 shrink-0 items-center justify-center rounded-md text-primary-deep transition-colors hover:bg-primary-norm/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-deep sm:mr-8 sm:ml-5 sm:h-3/4 sm:max-w-48 sm:flex-1 sm:justify-start sm:rounded-full sm:bg-primary-norm sm:pr-3 sm:text-textcolor sm:hover:bg-primary-norm"
        >
            <div
                class="flex h-full w-full items-center justify-center gap-2 p-1 sm:justify-start"
            >
                <input
                    class="hidden h-full min-w-0 flex-1 rounded-full bg-textbg px-3 text-textcolor sm:block"
                    readonly
                    placeholder="Ctrl + K"
                    tabindex="-1"
                />
                <Icon
                    icon="lucide:search"
                    class="size-5 shrink-0 sm:text-textbg"
                    aria-hidden="true"
                />
            </div>
        </DialogTrigger>

        <!-- lg and lower -->
        <!-- <DialogTrigger
            aria-label="Open search dialog"
            class="z-100 hidden items-center gap-2 rounded-full bg-tertiary p-2 text-primary-deep shadow-md hover:bg-primary-norm focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:outline-none max-xl:inline-flex"
        >
            <Icon icon="lucide:search" class="h-3 w-3" aria-hidden="true" />
        </DialogTrigger> -->

        <DialogPortal>
            <DialogOverlay
                class="fixed top-0 left-0 z-30 h-full w-full bg-black opacity-50"
            />
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
                    class="fixed inset-0 z-100 h-dvh w-dvw overflow-hidden bg-tertiary p-4 shadow-lg sm:inset-auto sm:top-1/6 sm:left-1/2 sm:h-auto sm:max-h-[70vh] sm:w-1/2 sm:-translate-x-1/2 sm:rounded-2xl sm:p-6"
                >
                    <DialogTitle class="sr-only">
                        Search site content
                    </DialogTitle>
                    <div
                        v-auto-animate="{
                            duration: 220,
                            easing: 'ease-out',
                        }"
                        class="flex h-full max-h-[calc(100dvh-2rem)] w-full flex-col justify-start gap-2 sm:max-h-[calc(70vh-3rem)]"
                    >
                        <header
                            class="shrink-0 text-center text-2xl font-bold text-primary-deep"
                        >
                            <label for="site-search" class="sr-only">
                                Search site content
                            </label>
                            <div class="relative">
                                <input
                                    ref="searchInput"
                                    v-model="query"
                                    type="text"
                                    role="searchbox"
                                    id="site-search"
                                    autocomplete="off"
                                    placeholder="Search..."
                                    aria-describedby="search-result-count"
                                    class="h-12 w-full rounded border py-2 pr-12 pl-4 outline-none sm:h-10"
                                />
                                <button
                                    type="button"
                                    aria-label="Close search dialog"
                                    class="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-primary-deep transition-colors hover:bg-primary-norm/20 focus-visible:outline-2 focus-visible:outline-primary-deep"
                                    @click="isSearchOpen = false"
                                >
                                    <Icon
                                        icon="lucide:x"
                                        class="size-5"
                                        aria-hidden="true"
                                    />
                                </button>
                            </div>
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
                                class="pointer-events-none absolute top-0 left-0 z-10 h-8 w-full bg-linear-to-b from-tertiary to-transparent"
                            />

                            <ul
                                ref="resultsList"
                                v-auto-animate="{
                                    duration: 180,
                                    easing: 'ease-out',
                                }"
                                class="max-h-[calc(100dvh-8rem)] w-full scrollbar-thin scrollbar-thumb-primary-norm scrollbar-track-tertiary overflow-auto sm:max-h-[calc(70vh-9rem)]"
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
                                        class="site-search-result block rounded border border-transparent px-3 py-2"
                                        @click="handleResultClick($event, link)"
                                    >
                                        <article>
                                            <h3
                                                class="font-momo-trust-display text-lg"
                                            >
                                                {{ displayTitle(link) }}
                                            </h3>

                                            <p
                                                class="text-xs font-normal text-primary-deep"
                                                v-html="displayContent(link)"
                                            />
                                        </article>
                                    </NuxtLink>
                                </li>
                            </ul>

                            <div
                                v-if="canScrollDown"
                                class="pointer-events-none absolute bottom-0 left-0 z-10 h-8 w-full bg-linear-to-t from-tertiary to-transparent"
                            />
                        </div>
                        <p
                            v-else-if="query"
                            class="mt-4 text-center text-primary-deep"
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
} from "reka-ui";
import { Icon } from "@iconify/vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";

const isSearchOpen = ref(false);
const searchInput = ref(null);
const { scrollToHash } = useHashScroll();

const query = ref("");
const result = ref([]);
const { search, init: initSearch } = useSearchCollection("content", {
    immediate: false,
    minHeading: "h2",
    maxHeading: "h3",
});

const hasResults = computed(() => result.value.length > 0 && query.value);
let latestSearch = 0;

// Keyboard shortcut
function openSearchFromShortcut(event) {
    if (event.key.toLowerCase() !== "k" || (!event.ctrlKey && !event.metaKey)) {
        return;
    }

    event.preventDefault();
    isSearchOpen.value = true;
}

onMounted(() => {
    window.addEventListener("keydown", openSearchFromShortcut);
});

onBeforeUnmount(() => {
    window.removeEventListener("keydown", openSearchFromShortcut);
});

watch(isSearchOpen, async (open) => {
    if (!open) return;

    await nextTick();
    searchInput.value?.focus();
    initSearch();
});

function displayTitle(link) {
    if (link.level !== 3) return link.title;

    const h2Title = link.titles?.at(-1);
    return h2Title ? `${h2Title} > ${link.title}` : link.title;
}

function displayContent(link) {
    return link.snippets?.content ?? `${link.content.slice(0, 200)}...`;
}

async function handleResultClick(event, link) {
    const target = parseSearchTarget(link.id);
    if (!target) return;

    event.preventDefault();
    query.value = "";
    isSearchOpen.value = false;

    await navigateTo(target.fullPath);
    if (!target.hash) return;

    await scrollToSearchTarget(event, target.hash);
}

function parseSearchTarget(id) {
    if (!id) return null;

    try {
        const url = new URL(id, window.location.href);
        return {
            fullPath: `${url.pathname}${url.search}${url.hash}`,
            pathWithQuery: `${url.pathname}${url.search}`,
            hash: url.hash ? decodeHash(url.hash.slice(1)) : "",
        };
    } catch {
        const [pathWithQuery, hash = ""] = id.split("#");
        return {
            fullPath: id,
            pathWithQuery,
            hash: decodeHash(hash),
        };
    }
}

async function scrollToSearchTarget(event, hash) {
    for (let attempt = 0; attempt < 10; attempt += 1) {
        await nextTick();

        if (scrollToHash(event, hash)) {
            return;
        }

        await new Promise((resolve) => window.setTimeout(resolve, 50));
    }
}

function decodeHash(value) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
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
