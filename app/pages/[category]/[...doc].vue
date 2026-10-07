<script setup>
import { Icon } from "@iconify/vue";
definePageMeta({
    layout: "doc",
    key: (route) => route.fullPath,
});

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const category = computed(() => String(route.params.category ?? ""));
const activePath = computed(() => normalizeContentPath(route.path));

const { data: page } = await useContentPageData(activePath);
const contentGraphViews = new Set(runtimeConfig.public.contentGraphViews);
const graphView = computed(() => {
    const candidate = page.value?.stem
        ? page.value.stem
        : activePath.value.replace(/^\//, "");

    return contentGraphViews.has(candidate) ? candidate : null;
});

const { data: allPages } = await useContentNavigationData();

const pages = computed(() => allPages.value ?? []);
const children = computed(() => categoryPages(pages.value, category.value));
const currentPageIndex = computed(() =>
    children.value.findIndex((item) => item.path === activePath.value),
);
const previousPage = computed(() =>
    currentPageIndex.value > 0
        ? children.value[currentPageIndex.value - 1]
        : null,
);
const nextPage = computed(() =>
    currentPageIndex.value >= 0 &&
    currentPageIndex.value < children.value.length - 1
        ? children.value[currentPageIndex.value + 1]
        : null,
);
const currentFolderCards = computed(() => {
    const prefix = `${activePath.value}/`;

    return pages.value
        .filter((item) => {
            if (!item.path?.startsWith(prefix)) return false;

            const relativePath = item.path.slice(prefix.length);
            return Boolean(relativePath) && !relativePath.includes("/");
        })
        .sort(compareContentPages);
});
if (!page.value || !children.value.length) {
    throw createError({
        statusCode: 404,
        statusMessage: "Page not found",
        fatal: true,
    });
}

useSeoMeta({
    title: () => pageSeoTitle(page.value),
    description: () => pageDescription(page.value),
});
</script>

<template>
    <article
        v-if="page"
        class="flex w-full max-w-[100vw] min-w-0 flex-1 flex-col gap-4 overflow-x-visible px-4 sm:gap-6 sm:px-6 lg:max-w-[calc(75ch+3rem)] lg:px-0"
    >
        <h1 class="sr-only">
            {{ pageTitle(page) }}
        </h1>

        <ContentGraph v-if="graphView" :view="graphView" />

        <ContentDocument :page="page" />
        <section
            v-if="currentFolderCards.length"
            class="grid max-w-full min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            aria-label="Current folder documents"
        >
            <NuxtLink
                v-for="doc in currentFolderCards"
                :key="doc.path"
                :to="doc.path"
                class="group flex min-h-36 min-w-0 flex-col gap-3 rounded-2xl border-2 border-outline bg-secondary p-4 text-on-secondary no-underline transition hover:-translate-y-px hover:border-secondary hover:text-on-secondary focus-visible:-translate-y-px focus-visible:border-outline focus-visible:text-on-secondary focus-visible:outline-none sm:rounded-3xl sm:p-5 lg:rounded-4xl lg:p-6"
            >
                <h2
                    class="font-belanosima text-2xl leading-tight wrap-anywhere"
                >
                    {{ doc.title }}
                </h2>
                <p
                    v-if="pageDescription(doc)"
                    class="font-main text-base leading-relaxed text-on-secondary/85 transition group-hover:text-on-secondary/85"
                >
                    {{ pageDescription(doc) }}
                </p>
            </NuxtLink>
        </section>
        <nav
            v-if="previousPage || nextPage"
            class="my-6"
            aria-label="Docs pages"
        >
            <div class="px-6">
                <div
                    class="w-full border-t-2 border-outline"
                    aria-hidden="true"
                />

                <div class="mt-2 grid grid-cols-2 gap-3">
                    <NuxtLink
                        v-if="previousPage"
                        class="group flex min-w-0 flex-col items-start gap-1 text-left text-on-surface no-underline transition hover:-translate-y-px hover:underline focus-visible:-translate-y-px focus-visible:underline"
                        :to="previousPage.path"
                    >
                        <div
                            class="relative font-momo-trust-display text-sm text-on-surface"
                        >
                            <Icon
                                icon="lucide:chevron-left"
                                class="absolute top-1/2 right-full size-5 -translate-x-1 -translate-y-1/2"
                                aria-hidden="true"
                            />
                            <span>Previous</span>
                        </div>

                        <div
                            class="font-belanosima text-lg leading-tight wrap-anywhere"
                        >
                            {{ pageTitle(previousPage) }}
                        </div>
                    </NuxtLink>

                    <span v-else aria-hidden="true" />

                    <NuxtLink
                        v-if="nextPage"
                        class="group flex min-w-0 flex-col items-end gap-1 text-right text-on-surface no-underline transition hover:-translate-y-px hover:underline focus-visible:-translate-y-px focus-visible:underline"
                        :to="nextPage.path"
                    >
                        <div
                            class="relative font-momo-trust-display text-sm text-on-surface"
                        >
                            <span>Next</span>
                            <Icon
                                icon="lucide:chevron-right"
                                class="absolute top-1/2 left-full size-5 translate-x-1 -translate-y-1/2"
                                aria-hidden="true"
                            />
                        </div>

                        <div
                            class="font-belanosima text-lg leading-tight wrap-anywhere"
                        >
                            {{ pageTitle(nextPage) }}
                        </div>
                    </NuxtLink>
                </div>
            </div>
        </nav>
    </article>
</template>
