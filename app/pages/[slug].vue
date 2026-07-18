<script setup lang="ts">
definePageMeta({
    layout: "category",
});

import { Icon } from "@iconify/vue";

const route = useRoute();
const slug = computed(() => String(route.params.slug ?? ""));
const pagePath = computed(() => `/${slug.value}`);

const { data: page } = await useAsyncData(`content-${pagePath.value}`, () =>
    queryCollection("content").path(pagePath.value).first(),
);

const { data: allPages } = await useAsyncData("content-navigation", () =>
    queryCollection("content").select("path", "title", "description").all(),
);

const pages = computed(() => allPages.value ?? []);
const children = computed(() => categoryPages(pages.value, slug.value));
const displayPage = computed(() => page.value ?? syntheticCategoryPage.value);
const syntheticCategoryPage = computed(() => {
    if (page.value || !children.value.length) return null;

    return {
        path: pagePath.value,
        title: titleizeSlug(slug.value),
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
    title: () => pageSeoTitle(displayPage.value),
    description: () => pageDescription(displayPage.value),
});

const categoryNavNodes = computed(() =>
    buildCategoryNavTree(children.value, slug.value, pagePath.value),
);

const groupedNavNodes = computed(() =>
    categoryNavNodes.value.filter((node) => node.children?.length),
);

const overviewPath = computed(() => `${pagePath.value}/overview`);
const overviewNode = computed(() =>
    categoryNavNodes.value.find((node) => node.path === overviewPath.value),
);

const standaloneNavNodes = computed(() =>
    categoryNavNodes.value.filter(
        (node) =>
            !node.children?.length &&
            node.path &&
            node.path !== overviewPath.value,
    ),
);

function navDescription(path?: string) {
    if (!path) return "";

    const contentPage = children.value.find((item) => item.path === path);
    return contentPage ? pageDescription(contentPage) : "";
}

const contentLayout = useContentLayoutState();
watchEffect(() => {
    if (!displayPage.value) return;

    contentLayout.value = {
        page: displayPage.value,
        categoryTitle: displayPage.value.title ?? titleizeSlug(slug.value),
        categoryPath: pagePath.value,
        categoryNavNodes: categoryNavNodes.value,
        activePath: pagePath.value,
        showRightSidebar: false,
    };
});
</script>

<template>
    <article
        v-if="displayPage"
        class="flex min-w-0 flex-1 flex-col gap-10 px-4 pt-4 sm:px-6 lg:px-8 xl:px-12"
    >
        <nav
            class="flex min-w-0 flex-col gap-10"
            aria-label="Category documents"
        >
            <section
                v-for="node in groupedNavNodes"
                :key="node.id"
                class="flex min-w-0 flex-col gap-4"
            >
                <h2 class="font-belanosima text-3xl leading-tight">
                    <NuxtLink
                        v-if="node.path"
                        :to="node.path"
                        class="no-underline hover:underline"
                    >
                        {{ node.label }}
                    </NuxtLink>

                    <template v-else>
                        {{ node.label }}
                    </template>
                </h2>

                <div class="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <NuxtLink
                        v-for="child in node.children"
                        :key="child.id"
                        :to="child.path"
                        class="group flex min-h-36 min-w-0 flex-col gap-3 rounded-2xl border-2 border-surface-variant bg-secondary p-4 text-on-secondary no-underline transition hover:-translate-y-px hover:border-secondary focus-visible:-translate-y-px focus-visible:border-outline focus-visible:outline-none sm:p-5 lg:p-6"
                    >
                        <h3
                            class="font-belanosima text-2xl leading-tight wrap-anywhere"
                        >
                            {{ child.label }}
                        </h3>

                        <p
                            v-if="navDescription(child.path)"
                            class="font-main text-base leading-relaxed opacity-85"
                        >
                            {{ navDescription(child.path) }}
                        </p>
                    </NuxtLink>
                </div>
            </section>

            <section
                v-if="standaloneNavNodes.length"
                class="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                aria-label="Other category pages"
            >
                <NuxtLink
                    v-for="node in standaloneNavNodes"
                    :key="node.id"
                    :to="node.path"
                    class="group flex min-h-36 min-w-0 flex-col gap-3 rounded-2xl border-2 border-surface-variant bg-secondary p-4 text-on-secondary no-underline transition hover:-translate-y-px hover:border-secondary focus-visible:-translate-y-px focus-visible:border-outline focus-visible:outline-none sm:p-5 lg:p-6"
                >
                    <h2
                        class="font-belanosima text-2xl leading-tight wrap-anywhere"
                    >
                        {{ node.label }}
                    </h2>

                    <p
                        v-if="navDescription(node.path)"
                        class="font-main text-base leading-relaxed opacity-85"
                    >
                        {{ navDescription(node.path) }}
                    </p>
                </NuxtLink>
            </section>
            <NuxtLink
                v-if="overviewNode?.path"
                :to="overviewNode.path"
                class="inline-flex w-fit items-center gap-3 rounded-full bg-primary px-6 py-3 font-belanosima text-xl text-on-primary no-underline shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-outline sm:px-8 sm:py-4 sm:text-2xl"
            >
                Go to Overview
                <Icon icon="line-md:arrow-right" class="h-6 w-6" />
            </NuxtLink>
        </nav>
    </article>
</template>
