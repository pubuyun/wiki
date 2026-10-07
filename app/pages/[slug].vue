<script setup lang="ts">
definePageMeta({
    layout: "category",
});

import { Icon } from "@iconify/vue";
import { contentTocLinks } from "~/utils/content-toc";

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const slug = computed(() => String(route.params.slug ?? ""));
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

const { data: allPages } = await useContentNavigationData();

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

function navDescription(path?: string) {
    if (!path) return "";

    const contentPage = children.value.find((item) => item.path === path);
    return contentPage ? pageDescription(contentPage) : "";
}

function navIcon(path?: string) {
    const contentPage = children.value.find((item) => item.path === path);
    const icon = contentPage?.meta?.icon ?? contentPage?.icon;

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
    <article
        v-if="displayPage"
        class="flex min-w-0 flex-1 flex-col px-4 pt-4 sm:px-6 lg:px-8 xl:px-12"
    >
        <ContentGraph
            v-if="graphView"
            :view="graphView"
            :full-height="graphView === 'model/index'"
            class="mb-8"
        />

        <div v-if="page" class="mb-8 flex min-w-0 gap-8">
            <ContentDocument :page="page" class="flex-1" />
            <aside
                v-if="tocLinks.length"
                class="contents"
                aria-label="Page contents"
            >
                <ContentBar
                    class="hidden lg:flex lg:flex-none"
                    :toc="tocLinks"
                />
            </aside>
        </div>

        <nav
            class="relative flex min-w-0 -translate-x-2 flex-col gap-10 pr-2 pb-4"
            aria-label="Category documents"
        >
            <div
                class="absolute inset-0 translate-x-2 translate-y-4 rounded-2xl bg-primary sm:rounded-3xl lg:rounded-4xl"
                aria-hidden="true"
            />
            <div
                class="relative grid min-w-0 gap-10 rounded-2xl bg-secondary p-4 text-on-secondary sm:grid-cols-2 sm:rounded-3xl sm:p-6 lg:rounded-4xl lg:p-8 xl:grid-cols-3"
            >
                <template v-for="node in categoryNavNodes" :key="node.id">
                    <section
                        v-if="node.children?.length"
                        class="col-span-full min-w-0"
                    >
                        <div
                            class="relative min-w-0 rounded-3xl border-4 border-accent px-4 pt-10 pb-4 sm:px-6 sm:pt-12 sm:pb-6 lg:px-8 lg:pb-8"
                        >
                            <h2
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
                            </h2>
                            <div
                                class="grid min-w-0 gap-8 sm:grid-cols-2 xl:grid-cols-3"
                            >
                                <template
                                    v-for="child in node.children"
                                    :key="child.id"
                                >
                                    <CategoryReferenceLink
                                        v-if="isReferenceTitle(child.label)"
                                        :to="child.path"
                                        :title="child.label"
                                        heading="h3"
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
                                                        navIcon(child.path),
                                                    )
                                                "
                                                :src="navIcon(child.path)"
                                                alt=""
                                                class="mb-8 size-14 object-contain sm:size-16"
                                            />
                                            <Icon
                                                v-else
                                                :icon="navIcon(child.path)"
                                                class="mb-8 size-14 shrink-0 sm:size-16"
                                                aria-hidden="true"
                                            />
                                            <h3
                                                class="mt-auto font-belanosima text-2xl leading-tight wrap-anywhere"
                                            >
                                                {{ child.label }}
                                            </h3>

                                            <p
                                                v-if="
                                                    navDescription(child.path)
                                                "
                                                class="mt-2 font-main text-base leading-relaxed"
                                            >
                                                {{ navDescription(child.path) }}
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
                            <h2
                                class="mt-auto font-belanosima text-2xl leading-tight wrap-anywhere"
                            >
                                {{ node.label }}
                            </h2>

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
        </nav>
    </article>
</template>
