<script setup lang="ts">
definePageMeta({
    layout: "category",
});

import StakeholdersGraph from "~/components/ContentComponents/human-practices/StakeholdersGraph.vue";
import { contentTocLinks } from "~/utils/content-toc";

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const slug = computed(() => String(route.params.slug ?? ""));
const categoryTitle = computed(() => titleizeSlug(slug.value));
const pagePath = computed(() => `/${slug.value}`);

const { data: page } = await useContentPageData(pagePath);
const tocLinks = computed(() => contentTocLinks(page.value?.body));

const contentGraphViews = new Set(runtimeConfig.public.contentGraphViews);
const graphView = computed(() => {
    const candidate = page.value?.stem
        ? page.value.stem
        : `${slug.value}/index`;

    return contentGraphViews.has(candidate) ? candidate : null;
});

const { data: allPages } = await useContentNavigationData(slug);

const pages = computed(() => allPages.value ?? []);
const children = computed(() => categoryPages(pages.value, slug.value));
const displayPage = computed(() => page.value ?? syntheticCategoryPage.value);
const syntheticCategoryPage = computed(() => {
    if (page.value || !children.value.length) return null;

    return {
        path: pagePath.value,
        title: categoryTitle.value,
        meta: {},
        body: { children: [], toc: { links: [] } },
    };
});

if (!displayPage.value) {
    throw createError({
        statusCode: 404,
        statusMessage: "Page not found",
        fatal: true,
    });
}

useSeoMeta({
    title: () => categoryTitle.value,
    description: () => pageDescription(displayPage.value),
});

</script>

<template>
    <article v-if="displayPage" class="flex min-w-0 flex-1 flex-col pt-2">
        <div
            v-if="slug === 'human-practices' || graphView"
            class="min-w-0 px-4 sm:px-6 lg:px-8 xl:px-12"
        >
            <StakeholdersGraph v-if="slug === 'human-practices'" class="mb-8" />
            <ContentGraph
                v-else-if="graphView"
                :view="graphView"
                :full-height="graphView === 'model/index'"
                class="mb-8"
            />
        </div>

        <div
            class="category-content-shell content-reading-container flex min-w-0 flex-col"
        >
            <div
                v-if="page"
                class="category-overview-layout content-reading-layout"
                :class="{ 'content-reading-layout--with-toc': tocLinks.length }"
            >
                <ContentDocument
                    :page="page"
                    class="flex-1"
                    :class="{
                        'category-overview-content--expanded': !tocLinks.length,
                    }"
                />
                <aside
                    v-if="tocLinks.length"
                    class="contents"
                    aria-label="Page contents"
                >
                    <ContentBar :toc="tocLinks" />
                </aside>
            </div>
        </div>
    </article>
</template>

<style scoped>
.category-overview-layout {
    --reading-body-width: inherit;
    --reading-column-gap: inherit;
    max-width: none;
}

.category-overview-layout.content-reading-layout--with-toc > :first-child {
    max-width: var(--reading-body-width);
}

.category-overview-content--expanded :deep(> section) {
    max-width: 100%;
}
</style>
