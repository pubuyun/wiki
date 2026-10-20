<script setup lang="ts">
definePageMeta({
    layout: "category",
});

import StakeholdersGraph from "~/components/ContentComponents/human-practices/StakeholdersGraph.vue";
import TimeLine from "~/components/ContentComponents/human-practices/TimeLine.vue";
import ProseH2 from "~/components/content/ProseH2.vue";
import { contentTocLinks } from "~/utils/content-toc";
import { numberDocumentFigures } from "~/utils/document-figures";

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const slug = computed(() => String(route.params.slug ?? ""));
const categoryTitle = computed(() => titleizeSlug(slug.value));
const pagePath = computed(() => `/${slug.value}`);

const { data: page } = await useContentPageData(pagePath);
const tocLinks = computed(() => {
    const links = contentTocLinks(page.value?.body);
    if (
        slug.value === "human-practices" &&
        !links.some((link) => link.id === "timeline")
    ) {
        links.push({ id: "timeline", depth: 2, text: "Timeline" });
    }
    return links;
});

// Keep the Education summary in Markdown, but render it outside the reading column.
const educationConclusion = computed(() => {
    if (slug.value !== "education" || !page.value) return null;
    const body = page.value.body as {
        children?: unknown[];
        value?: unknown[];
    };
    const nodes = body?.children ?? body?.value ?? [];
    const index = nodes.findIndex((node) => {
        const tag = Array.isArray(node)
            ? node[0]
            : (node as { tag?: string })?.tag;
        return tag === "content-components-education-age-timeline";
    });
    if (index < 0) return null;
    const withNodes = (children: unknown[]) => ({
        ...page.value!,
        body: body.value ? { ...body, value: children } : { ...body, children },
    });
    return {
        main: withNodes(nodes.slice(0, index)),
        content: withNodes(nodes.slice(index)),
    };
});
const documentPage = computed(
    () =>
        humanPracticesOverview.value?.main ??
        educationConclusion.value?.main ??
        page.value,
);

// Keep the stakeholder graph outside the document's reading column.
const humanPracticesOverview = computed(() => {
    if (slug.value !== "human-practices" || !page.value) return null;
    const body = numberDocumentFigures(page.value.body) as {
        children?: unknown[];
        value?: unknown[];
    };
    const nodes = body?.children ?? body?.value ?? [];
    const index = nodes.findIndex(
        (node) =>
            (Array.isArray(node)
                ? node[0]
                : (node as { tag?: string })?.tag) ===
            "content-components-human-practices-stakeholders-graph",
    );
    if (index < 0) return null;
    const withNodes = (children: unknown[]) => ({
        ...page.value!,
        body: body.value ? { ...body, value: children } : { ...body, children },
    });
    return {
        main: withNodes(nodes.slice(0, index)),
    };
});

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
            v-if="slug === 'education' || graphView"
            class="min-w-0 px-4 sm:px-6 lg:px-8 xl:px-12"
        >
            <ContentComponentsEducationActivityGraph
                v-if="slug === 'education'"
                class="mb-8 w-full"
            />
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
            <template v-if="humanPracticesOverview">
                <StakeholdersGraph class="my-8" />
            </template>
            <div
                v-if="page"
                class="category-overview-layout content-reading-layout"
                :class="{ 'content-reading-layout--with-toc': tocLinks.length }"
            >
                <ContentDocument
                    :page="documentPage"
                    :navigation-pages="pages"
                    :show-header="children.length > 0"
                    :heading-level="2"
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
            <CategoryExplore
                v-if="children.length > 1"
                :pages="children"
                :category-slug="slug"
                :category-title="categoryTitle"
                class="mt-10 sm:mt-14"
            />
            <section
                v-if="humanPracticesOverview"
                class="mt-10 min-w-0 sm:mt-14"
                aria-labelledby="timeline"
            >
                <ProseH2 id="timeline">Timeline</ProseH2>
                <TimeLine class="mt-6 w-full" />
            </section>
        </div>

        <section
            v-if="educationConclusion"
            class="education-conclusion mt-6 mb-4 min-w-0 px-4 font-main sm:px-6 lg:px-8 xl:px-12"
            aria-label="Education outreach summary"
        >
            <ContentRenderer
                :value="educationConclusion.content"
                class="content paragraph min-w-0 rounded-2xl bg-secondary p-4 text-on-secondary sm:rounded-3xl sm:p-5 lg:rounded-4xl lg:p-6"
            />
        </section>
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

.education-conclusion :deep(figure > button),
.education-conclusion :deep(figure img) {
    width: 100%;
}
</style>
