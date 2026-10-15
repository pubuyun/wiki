<script setup lang="ts">
definePageMeta({
    layout: "category",
});

import { Icon } from "@iconify/vue";
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

const categoryNavNodes = computed(() =>
    buildCategoryNavTree(children.value, slug.value, pagePath.value),
);

function navDescription(path?: string) {
    if (!path) return "";

    const contentPage = children.value.find((item) => item.path === path);
    return contentPage ? pageDescription(contentPage) : "";
}

function navIcon(path?: string) {
    const contentPage = children.value.find((item) => item.path === path);
    const icon = contentPage?.icon;

    return typeof icon === "string" && icon.trim()
        ? icon.trim()
        : "lucide:file-text";
}

function isIconUrl(icon: string) {
    return /^(?:https?:)?\/\//.test(icon) || icon.startsWith("/");
}

function isReferenceTitle(title: string) {
    return /^references?$/i.test(title.trim());
}
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
                <ContentDocument :page="page" class="flex-1" />
                <aside
                    v-if="tocLinks.length"
                    class="contents"
                    aria-label="Page contents"
                >
                    <ContentBar :toc="tocLinks" />
                </aside>
            </div>

            <nav
                v-if="categoryNavNodes.length"
                class="category-documents flex min-w-0 flex-col"
                aria-label="Category documents"
            >
                <h2
                    class="mb-6 font-belanosima text-3xl text-on-surface sm:text-4xl"
                >
                    Explore {{ categoryTitle }}
                </h2>
                <div class="relative min-w-0 pb-4">
                    <div
                        class="absolute inset-0 translate-x-2 translate-y-4 rounded-2xl bg-primary sm:rounded-3xl lg:rounded-4xl"
                        aria-hidden="true"
                    />
                    <div
                        class="relative grid min-w-0 gap-10 rounded-2xl bg-secondary p-4 text-on-secondary sm:grid-cols-2 sm:rounded-3xl sm:p-6 lg:rounded-4xl lg:p-8 xl:grid-cols-3"
                    >
                        <template
                            v-for="node in categoryNavNodes"
                            :key="node.id"
                        >
                            <section
                                v-if="node.children?.length"
                                class="col-span-full min-w-0"
                            >
                                <div
                                    class="relative min-w-0 rounded-3xl border-4 border-accent px-4 pt-10 pb-4 sm:px-6 sm:pt-12 sm:pb-6 lg:px-8 lg:pb-8"
                                >
                                    <h3
                                        class="absolute top-0 left-1/2 max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 bg-secondary px-4 text-center font-belanosima text-2xl leading-tight wrap-anywhere text-accent sm:px-6 sm:text-3xl"
                                    >
                                        <NuxtLink
                                            v-if="node.path"
                                            :to="node.path"
                                            class="text-accent underline underline-offset-4 hover:text-accent focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-outline"
                                        >
                                            {{ node.label }}
                                        </NuxtLink>
                                        <span v-else>{{ node.label }}</span>
                                    </h3>
                                    <div
                                        class="grid min-w-0 gap-8 sm:grid-cols-2 xl:grid-cols-3"
                                    >
                                        <template
                                            v-for="child in node.children"
                                            :key="child.id"
                                        >
                                            <CategoryReferenceLink
                                                v-if="
                                                    isReferenceTitle(
                                                        child.label,
                                                    )
                                                "
                                                :to="child.path"
                                                :title="child.label"
                                                heading="h4"
                                            />
                                            <div
                                                v-else
                                                class="relative isolate flex min-w-0"
                                            >
                                                <div
                                                    aria-hidden="true"
                                                    class="pointer-events-none absolute inset-0 -z-10 translate-x-2 translate-y-2 rounded-2xl bg-primary"
                                                ></div>
                                                <NuxtLink
                                                    :to="child.path"
                                                    class="group flex min-h-52 w-full min-w-0 flex-col rounded-2xl bg-surface-elevated p-4 text-on-surface no-underline shadow-sm transition hover:-translate-y-1 hover:border-primary hover:text-on-surface hover:shadow-lg focus-visible:-translate-y-1 focus-visible:border-outline focus-visible:text-on-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-outline sm:min-h-60 sm:p-5 lg:p-6"
                                                >
                                                    <img
                                                        v-if="
                                                            isIconUrl(
                                                                navIcon(
                                                                    child.path,
                                                                ),
                                                            )
                                                        "
                                                        :src="
                                                            navIcon(child.path)
                                                        "
                                                        alt=""
                                                        class="mb-8 size-14 object-contain sm:size-16"
                                                    />
                                                    <Icon
                                                        v-else
                                                        :icon="
                                                            navIcon(child.path)
                                                        "
                                                        class="mb-8 size-14 shrink-0 sm:size-16"
                                                        aria-hidden="true"
                                                    />
                                                    <h4
                                                        class="mt-auto font-belanosima text-2xl leading-tight wrap-anywhere"
                                                    >
                                                        {{ child.label }}
                                                    </h4>

                                                    <p
                                                        v-if="
                                                            navDescription(
                                                                child.path,
                                                            )
                                                        "
                                                        class="mt-2 font-main text-base leading-relaxed"
                                                    >
                                                        {{
                                                            navDescription(
                                                                child.path,
                                                            )
                                                        }}
                                                    </p>
                                                </NuxtLink>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </section>

                            <CategoryReferenceLink
                                v-else-if="isReferenceTitle(node.label)"
                                :to="node.path"
                                :title="node.label"
                                heading="h3"
                            />
                            <div v-else class="relative isolate flex min-w-0">
                                <div
                                    aria-hidden="true"
                                    class="pointer-events-none absolute inset-0 z-0 translate-x-2 translate-y-2 rounded-2xl bg-primary"
                                ></div>
                                <NuxtLink
                                    :to="node.path"
                                    class="group relative z-10 flex min-h-52 w-full min-w-0 flex-col rounded-2xl bg-surface-elevated p-4 text-on-surface no-underline shadow-sm transition hover:-translate-y-1 hover:border-primary hover:text-on-surface hover:shadow-lg focus-visible:-translate-y-1 focus-visible:border-outline focus-visible:text-on-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-outline sm:min-h-60 sm:p-5 lg:p-6"
                                >
                                    <img
                                        v-if="isIconUrl(navIcon(node.path))"
                                        :src="navIcon(node.path)"
                                        alt=""
                                        class="mb-8 size-14 object-contain sm:size-16"
                                    />
                                    <Icon
                                        v-else
                                        :icon="navIcon(node.path)"
                                        class="mb-8 size-14 shrink-0 sm:size-16"
                                        aria-hidden="true"
                                    />
                                    <h3
                                        class="mt-auto font-belanosima text-2xl leading-tight wrap-anywhere"
                                    >
                                        {{ node.label }}
                                    </h3>

                                    <p
                                        v-if="navDescription(node.path)"
                                        class="mt-2 font-main text-base leading-relaxed"
                                    >
                                        {{ navDescription(node.path) }}
                                    </p>
                                </NuxtLink>
                            </div>
                        </template>
                    </div>
                </div>
            </nav>
        </div>
    </article>
</template>

<style scoped>
.category-overview-layout {
    --reading-body-width: inherit;
    --reading-toc-width: inherit;
    --reading-column-gap: inherit;
    max-width: none;
}

.category-overview-layout > :first-child {
    max-width: var(--reading-body-width);
}

.category-documents {
    margin-top: clamp(3rem, 6cqi, 5rem);
    border-top: 1px solid var(--outline-variant);
    padding-top: clamp(2rem, 4cqi, 3rem);
}
</style>
