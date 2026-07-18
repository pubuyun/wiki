<template>
    <DialogRoot v-model:open="isSearchOpen" class="">
        <!-- Desktop / larger than lg -->
        <DialogTrigger
            aria-label="Open search dialog"
            class="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface text-on-surface transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline sm:mr-8 sm:ml-5 sm:h-3/4 sm:max-w-48 sm:flex-1 sm:justify-start sm:rounded-full sm:pr-3"
        >
            <div
                class="flex h-full w-full items-center justify-center gap-2 p-1 sm:justify-start"
            >
                <span
                    class="hidden h-full min-w-0 flex-1 items-center rounded-full bg-secondary px-3 text-sm text-on-secondary/60 sm:flex"
                    aria-hidden="true"
                >
                    Ctrl + K
                </span>
                <Icon
                    icon="lucide:search"
                    class="size-5 shrink-0"
                    aria-hidden="true"
                />
            </div>
        </DialogTrigger>

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
                    class="fixed inset-x-0 top-0 z-100 h-fit max-h-[calc(100dvh-1rem)] w-dvw overflow-hidden rounded-b-2xl bg-surface-elevated p-4 text-on-surface shadow-lg sm:inset-auto sm:top-16 sm:left-1/2 sm:h-auto sm:max-h-[min(48rem,calc(100dvh-4rem))] sm:w-200 sm:max-w-[calc(100dvw-2rem)] sm:-translate-x-1/2 sm:rounded-2xl sm:p-6"
                >
                    <DialogTitle class="sr-only">
                        Search site content
                    </DialogTitle>
                    <div
                        v-auto-animate="{
                            duration: 220,
                            easing: 'ease-out',
                        }"
                        class="flex h-auto max-h-[calc(100dvh-2rem)] w-full flex-col justify-start gap-2 sm:max-h-[min(45rem,calc(100dvh-7rem))]"
                    >
                        <div
                            class="shrink-0 text-center text-2xl font-bold text-on-surface"
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
                                    class="h-12 w-full rounded border border-surface-variant bg-secondary py-2 pr-12 pl-4 text-on-secondary outline-none placeholder:text-on-secondary/60 focus:border-secondary sm:h-10"
                                />
                                <button
                                    type="button"
                                    aria-label="Close search dialog"
                                    class="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-on-surface transition-colors hover:bg-secondary hover:text-on-secondary focus-visible:outline-2 focus-visible:outline-outline"
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
                        </div>

                        <div
                            v-if="hasResults"
                            class="relative mt-2 min-h-0 w-full flex-1"
                        >
                            <div
                                v-if="canScrollUp"
                                class="pointer-events-none absolute top-0 left-0 z-10 h-8 w-full bg-linear-to-b from-surface-elevated to-transparent"
                            />

                            <ul
                                ref="resultsList"
                                v-auto-animate="{
                                    duration: 180,
                                    easing: 'ease-out',
                                }"
                                class="site-search-results-scroll max-h-[calc(100dvh-8rem)] w-full overflow-auto sm:max-h-[min(39rem,calc(100dvh-13rem))]"
                                @scroll="updateScrollGradients"
                                aria-label="Search results"
                            >
                                <li
                                    v-for="categoryGroup of groupedResults"
                                    :key="categoryGroup.key"
                                    class="w-full px-2 py-2 sm:px-4"
                                >
                                    <section
                                        class="flex min-w-0 flex-col gap-2"
                                        :aria-label="`${categoryGroup.label} search results`"
                                    >
                                        <div
                                            class="px-3 text-base font-bold tracking-wide text-on-surface uppercase"
                                        >
                                            {{ categoryGroup.label }}
                                        </div>

                                        <div
                                            v-for="documentGroup of categoryGroup.documents"
                                            :key="documentGroup.key"
                                            class="min-w-0"
                                        >
                                            <NuxtLink
                                                :to="documentGroup.key"
                                                class="site-search-result group bg-surface-bright flex min-h-12 min-w-0 items-center gap-2 rounded border border-transparent px-3 py-2 text-on-surface transition-colors hover:bg-secondary hover:text-on-secondary"
                                                @click="
                                                    handleDocumentClick(
                                                        $event,
                                                        documentGroup.key,
                                                    )
                                                "
                                            >
                                                <Icon
                                                    icon="lucide:file-text"
                                                    class="size-5 shrink-0 text-on-surface/70 transition-colors group-hover:text-on-secondary/80"
                                                    aria-hidden="true"
                                                />
                                                <span
                                                    class="truncate text-sm font-semibold"
                                                >
                                                    {{ documentGroup.label }}
                                                </span>
                                                <Icon
                                                    icon="lucide:corner-down-left"
                                                    class="ml-auto size-4 shrink-0 text-on-surface/45 transition-colors group-hover:text-on-secondary/65"
                                                    aria-hidden="true"
                                                />
                                            </NuxtLink>

                                            <ul
                                                class="mt-1 flex min-w-0 flex-col gap-1"
                                                :aria-label="`${documentGroup.label} results`"
                                            >
                                                <li
                                                    v-for="link of documentGroup.links"
                                                    :key="link.searchId"
                                                    class="min-w-0"
                                                >
                                                    <NuxtLink
                                                        :to="link.id"
                                                        class="site-search-result group bg-surface-bright flex min-w-0 items-center gap-2 rounded border border-transparent px-3 py-2 transition-colors hover:bg-secondary hover:text-on-secondary"
                                                        @click="
                                                            handleResultClick(
                                                                $event,
                                                                link,
                                                            )
                                                        "
                                                    >
                                                        <svg
                                                            class="ml-5 h-9 w-5 shrink-0 text-on-surface/45 transition-colors group-hover:text-on-secondary/65 sm:ml-7"
                                                            viewBox="0 0 24 54"
                                                            aria-hidden="true"
                                                        >
                                                            <g
                                                                stroke="currentColor"
                                                                fill="none"
                                                                fill-rule="evenodd"
                                                                stroke-linecap="round"
                                                                stroke-linejoin="round"
                                                            >
                                                                <path
                                                                    d="M8 6v21M20 27H8.3"
                                                                />
                                                            </g>
                                                        </svg>
                                                        <Icon
                                                            :icon="
                                                                isTitleHit(link)
                                                                    ? 'lucide:hash'
                                                                    : 'lucide:align-left'
                                                            "
                                                            class="size-5 shrink-0 text-on-surface/65 transition-colors group-hover:text-on-secondary/80"
                                                            aria-hidden="true"
                                                        />
                                                        <span
                                                            class="flex min-w-0 flex-1 flex-col gap-0.5"
                                                        >
                                                            <span
                                                                class="min-w-0 truncate text-xs font-normal text-on-surface/90 transition-colors group-hover:text-on-secondary/90"
                                                            >
                                                                <template
                                                                    v-for="(
                                                                        segment,
                                                                        index
                                                                    ) of displayHitSegments(
                                                                        link,
                                                                    )"
                                                                    :key="index"
                                                                >
                                                                    <span
                                                                        :class="
                                                                            segment.matched
                                                                                ? 'font-semibold text-primary underline decoration-primary decoration-2 underline-offset-3'
                                                                                : ''
                                                                        "
                                                                    >
                                                                        {{
                                                                            segment.text
                                                                        }}
                                                                    </span>
                                                                </template>
                                                            </span>
                                                            <span
                                                                class="truncate text-[0.7rem] text-on-surface/60 transition-colors group-hover:text-on-secondary/70"
                                                            >
                                                                <template
                                                                    v-for="(
                                                                        segment,
                                                                        index
                                                                    ) of displayPathSegments(
                                                                        link,
                                                                        documentGroup.label,
                                                                    )"
                                                                    :key="index"
                                                                >
                                                                    <span
                                                                        :class="
                                                                            segment.matched
                                                                                ? 'font-semibold text-primary underline decoration-primary decoration-2 underline-offset-3'
                                                                                : ''
                                                                        "
                                                                    >
                                                                        {{
                                                                            segment.text
                                                                        }}
                                                                    </span>
                                                                </template>
                                                            </span>
                                                        </span>
                                                        <Icon
                                                            icon="lucide:corner-down-left"
                                                            class="size-4 shrink-0 text-on-surface/45 transition-colors group-hover:text-on-secondary/65"
                                                            aria-hidden="true"
                                                        />
                                                    </NuxtLink>
                                                </li>
                                            </ul>
                                        </div>
                                    </section>
                                </li>
                            </ul>

                            <div
                                v-if="canScrollDown"
                                class="pointer-events-none absolute bottom-0 left-0 z-10 h-8 w-full bg-linear-to-t from-surface-elevated to-transparent"
                            />
                        </div>
                        <p
                            v-else-if="searchIndexLoading && query"
                            class="mt-4 text-center text-on-surface"
                            aria-live="polite"
                        >
                            Searching...
                        </p>
                        <p
                            v-else-if="query"
                            class="mt-4 text-center text-on-surface"
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
    DialogContent,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from "reka-ui";
import { Icon } from "@iconify/vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import { siteNavGroups } from "~/utils/site-navigation";

const isSearchOpen = ref(false);
const searchInput = ref(null);
const { scrollToHash } = useHashScroll();

const query = ref("");
const result = ref([]);
const searchResultLimit = 20;
const searchSections = shallowRef([]);
const searchIndex = shallowRef(null);
const searchIndexLoading = ref(false);
let searchIndexPromise = null;
let searchRevision = 0;

const searchDocuments = computed(() => {
    return (searchSections.value ?? []).map((section, index) => ({
        ...section,
        searchId: `${section.id}:${index}`,
    }));
});

async function loadSearchIndex() {
    if (searchIndex.value) return searchIndex.value;
    if (searchIndexPromise) return searchIndexPromise;

    searchIndexLoading.value = true;
    searchIndexPromise = Promise.all([
        import("fuse.js"),
        queryCollectionSearchSections("content", {
            minHeading: "h2",
            maxHeading: "h3",
        }),
    ])
        .then(([{ default: Fuse }, sections]) => {
            searchSections.value = sections ?? [];
            searchIndex.value = new Fuse(searchDocuments.value, {
                includeMatches: true,
                ignoreLocation: true,
                threshold: 0.35,
                keys: [
                    {
                        name: "title",
                        weight: 2,
                    },
                    {
                        name: "content",
                        weight: 1,
                    },
                ],
            });
            return searchIndex.value;
        })
        .finally(() => {
            searchIndexLoading.value = false;
        });

    return searchIndexPromise;
}

const hasResults = computed(() => result.value.length > 0 && query.value);
const categoryLabels = new Map(
    siteNavGroups.flatMap((group) =>
        group.links.map((link) => [normalizeContentPath(link.to), link.label]),
    ),
);
const groupedResults = computed(() => groupSearchResults(result.value));

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
    await loadSearchIndex();
});

function isTitleHit(link) {
    return link.matches?.some((match) => match.key === "title") ?? false;
}

function displayHitSegments(link) {
    const field = isTitleHit(link) ? "title" : "content";
    const value = field === "title" ? link.title : link.content;
    const text = field === "title" ? value : `${value?.slice(0, 200) ?? ""}...`;
    return matchedSegments(text, matchForField(link, field)?.indices);
}

function displayPathSegments(link, documentLabel) {
    if (!isTitleHit(link)) {
        return [{ text: documentLabel, matched: false }];
    }

    const parentTitle = link.level > 2 ? link.titles?.at(-1) : "";
    const path = parentTitle
        ? `${documentLabel} > ${parentTitle}`
        : documentLabel;
    return [{ text: path, matched: false }];
}

function matchForField(link, field) {
    return link.matches?.find((match) => match.key === field);
}

function matchedSegments(text, indices = []) {
    if (!indices.length) {
        return [{ text, matched: false }];
    }

    const segments = [];
    let cursor = 0;

    for (const [rawStart, rawEnd] of indices) {
        const start = Math.max(0, rawStart);
        const end = Math.min(text.length - 1, rawEnd);
        if (start > end || start >= text.length) continue;

        if (start > cursor) {
            segments.push({
                text: text.slice(cursor, start),
                matched: false,
            });
        }

        segments.push({
            text: text.slice(start, end + 1),
            matched: true,
        });
        cursor = end + 1;
    }

    if (cursor < text.length) {
        segments.push({
            text: text.slice(cursor),
            matched: false,
        });
    }

    return segments.filter((segment) => segment.text);
}

function searchWithFuse(searchTerm) {
    if (!searchIndex.value) return [];

    return searchIndex.value
        .search(searchTerm)
        .slice(0, searchResultLimit)
        .map(({ item, matches, score }) => ({
            ...item,
            matches,
            score,
        }));
}

function groupSearchResults(links) {
    const categoryGroups = [];
    const categoryLookup = new Map();

    for (const link of links) {
        const target = parseSearchTarget(link.id);
        if (!target) continue;

        const pathSegments = target.pathWithQuery
            .split("?")[0]
            .split("/")
            .filter(Boolean);
        const categorySlug = pathSegments[0] ?? "";
        const categoryPath = categorySlug ? `/${categorySlug}` : "/";
        const categoryKey = categoryPath;
        const documentPath = `/${pathSegments.join("/")}`;
        const documentKey = documentPath || link.id;

        let categoryGroup = categoryLookup.get(categoryKey);
        if (!categoryGroup) {
            categoryGroup = {
                key: categoryKey,
                label:
                    categoryLabels.get(categoryPath) ??
                    titleizePathSegment(categorySlug || "Search results"),
                documents: [],
                documentLookup: new Map(),
            };
            categoryLookup.set(categoryKey, categoryGroup);
            categoryGroups.push(categoryGroup);
        }

        let documentGroup = categoryGroup.documentLookup.get(documentKey);
        if (!documentGroup) {
            documentGroup = {
                key: documentKey,
                label: displayDocumentPath(pathSegments),
                links: [],
            };
            categoryGroup.documentLookup.set(documentKey, documentGroup);
            categoryGroup.documents.push(documentGroup);
        }

        documentGroup.links.push(link);
    }

    return categoryGroups.map(({ documentLookup, ...categoryGroup }) => ({
        ...categoryGroup,
        documents: categoryGroup.documents,
    }));
}

function displayDocumentPath(pathSegments) {
    const documentSegments = pathSegments.slice(1);

    if (!documentSegments.length) {
        return titleizePathSegment(pathSegments[0] ?? "Page");
    }

    return documentSegments.map(titleizePathSegment).join(" > ");
}

function titleizePathSegment(value) {
    return safeDecode(value)
        .split(/[-\s]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function safeDecode(value) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

async function handleResultClick(event, link) {
    const target = parseSearchTarget(link.id);
    if (!target) return;

    event.preventDefault();
    closeSearch();

    await navigateTo(target.fullPath);
    if (!target.hash) return;

    await scrollToSearchTarget(event, target.hash);
}

async function handleDocumentClick(event, path) {
    event.preventDefault();
    closeSearch();

    await navigateTo(path);
}

function closeSearch() {
    query.value = "";
    isSearchOpen.value = false;
}

function parseSearchTarget(id) {
    if (!id) return null;

    try {
        const url = new URL(id, window.location.href);
        return {
            fullPath: `${url.pathname}${url.search}${url.hash}`,
            pathWithQuery: `${url.pathname}${url.search}`,
            hash: url.hash ? safeDecode(url.hash.slice(1)) : "",
        };
    } catch {
        const [pathWithQuery, hash = ""] = id.split("#");
        return {
            fullPath: id,
            pathWithQuery,
            hash: safeDecode(hash),
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

watch(query, async (value) => {
    const searchTerm = value.trim();
    const revision = ++searchRevision;

    if (!searchTerm) {
        result.value = [];
        return;
    }

    try {
        await loadSearchIndex();
    } catch (error) {
        console.error("Failed to load search index.", error);
        result.value = [];
        return;
    }

    if (revision === searchRevision) {
        result.value = searchWithFuse(searchTerm);
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

<style scoped>
.site-search-results-scroll {
    scrollbar-color: var(--secondary) var(--surface-elevated);
    scrollbar-width: thin;
}

.site-search-results-scroll::-webkit-scrollbar {
    width: 0.5rem;
}

.site-search-results-scroll::-webkit-scrollbar-track {
    background: var(--surface-elevated);
}

.site-search-results-scroll::-webkit-scrollbar-thumb {
    background: var(--secondary);
    border-radius: 999px;
}

.site-search-results-scroll::-webkit-scrollbar-thumb:hover {
    background: var(--primary);
}
</style>
