<script setup lang="ts">
definePageMeta({
    layout: "category",
});

import { Icon } from "@iconify/vue";

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const slug = computed(() => String(route.params.slug ?? ""));
const pagePath = computed(() => `/${slug.value}`);

const { data: page } = await useContentPageData(pagePath);

const contentGraphPaths = new Set(runtimeConfig.public.contentGraphPaths);
const graphSrc = computed(() => {
    const candidate = page.value?.stem
        ? `/content/${page.value.stem}.json`
        : `/content/${slug.value}/index.json`;

    return contentGraphPaths.has(candidate) ? candidate : null;
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
</script>

<template>
    <article
        v-if="displayPage"
        class="flex min-w-0 flex-1 flex-col px-4 pt-4 sm:px-6 lg:px-8 xl:px-12"
    >
        <ContentGraph v-if="graphSrc" :src="graphSrc" class="mb-8" />

        <nav
            class="relative flex min-w-0 -translate-x-2 flex-col gap-10 pr-2 pb-4"
            aria-label="Category documents"
        >
            <div
                class="absolute inset-0 translate-x-2 translate-y-4 rounded-2xl bg-primary sm:rounded-3xl lg:rounded-4xl"
                aria-hidden="true"
            />
            <div
                class="relative flex min-w-0 flex-col gap-10 rounded-2xl bg-secondary p-4 text-on-secondary sm:rounded-3xl sm:p-6 lg:rounded-4xl lg:p-8"
            >
                <section
                    v-for="node in groupedNavNodes"
                    :key="node.id"
                    class="flex min-w-0 flex-col gap-8"
                >
                    <div v-if="node.path" class="w-full max-w-2xl self-center">
                        <NuxtLink
                            :to="node.path"
                            class="group flex min-h-32 w-full min-w-0 items-center gap-4 rounded-2xl bg-accent p-4 text-on-accent no-underline shadow-sm transition hover:-translate-y-1 hover:text-on-accent hover:shadow-lg focus-visible:-translate-y-1 focus-visible:text-on-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-outline sm:gap-6 sm:rounded-3xl sm:p-6"
                        >
                            <Icon
                                :icon="navIcon(node.path)"
                                class="size-12 shrink-0 sm:size-16"
                                aria-hidden="true"
                            />
                            <div class="min-w-0 flex-1">
                                <h2
                                    class="font-belanosima text-3xl leading-tight wrap-anywhere sm:text-4xl"
                                >
                                    {{ node.label }}
                                </h2>
                                <p
                                    v-if="navDescription(node.path)"
                                    class="mt-1 font-main text-base leading-relaxed opacity-85"
                                >
                                    {{ navDescription(node.path) }}
                                </p>
                            </div>
                            <Icon
                                icon="line-md:arrow-right"
                                class="size-7 shrink-0 transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1 sm:size-8"
                                aria-hidden="true"
                            />
                        </NuxtLink>
                    </div>

                    <h2
                        v-else
                        class="self-center text-center font-belanosima text-4xl leading-tight text-on-secondary sm:text-5xl"
                    >
                        {{ node.label }}
                    </h2>

                    <div
                        class="relative min-w-0 rounded-3xl border-4 border-accent px-4 pt-10 pb-4 sm:px-6 sm:pt-12 sm:pb-6 lg:px-8 lg:pb-8"
                    >
                        <span
                            aria-hidden="true"
                            class="absolute top-0 left-1/2 max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 truncate bg-secondary px-4 font-belanosima text-2xl leading-tight text-accent sm:px-6 sm:text-3xl"
                        >
                            {{ node.label }}
                        </span>
                        <div
                            class="grid min-w-0 gap-8 sm:grid-cols-2 xl:grid-cols-3"
                        >
                            <div
                                v-for="child in node.children"
                                :key="child.id"
                                class="relative isolate flex min-w-0"
                            >
                                <div
                                    aria-hidden="true"
                                    class="pointer-events-none absolute inset-0 -z-10 translate-x-2 translate-y-2 rounded-2xl bg-primary"
                                ></div>
                                <NuxtLink
                                    :to="child.path"
                                    class="group flex min-h-52 w-full min-w-0 flex-col rounded-2xl bg-surface-elevated p-4 text-on-surface no-underline shadow-sm transition hover:-translate-y-1 hover:border-primary hover:text-on-surface hover:shadow-lg focus-visible:-translate-y-1 focus-visible:border-outline focus-visible:text-on-surface focus-visible:outline-none sm:min-h-60 sm:p-5 lg:p-6"
                                >
                                    <img
                                        v-if="isIconUrl(navIcon(child.path))"
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
                                        v-if="navDescription(child.path)"
                                        class="mt-2 font-main text-base leading-relaxed opacity-85"
                                    >
                                        {{ navDescription(child.path) }}
                                    </p>
                                </NuxtLink>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    v-if="standaloneNavNodes.length"
                    class="my mb-6 grid min-w-0 gap-8 sm:grid-cols-2 xl:grid-cols-3"
                    aria-label="Other category pages"
                >
                    <div
                        v-for="node in standaloneNavNodes"
                        :key="node.id"
                        class="relative isolate flex min-w-0"
                    >
                        <div
                            aria-hidden="true"
                            class="pointer-events-none absolute inset-0 z-0 translate-x-2 translate-y-2 rounded-2xl bg-primary"
                        ></div>
                        <NuxtLink
                            :to="node.path"
                            class="group relative z-10 flex min-h-52 w-full min-w-0 flex-col rounded-2xl bg-surface-elevated p-4 text-on-surface no-underline shadow-sm transition hover:-translate-y-1 hover:border-primary hover:text-on-surface hover:shadow-lg focus-visible:-translate-y-1 focus-visible:border-outline focus-visible:text-on-surface focus-visible:outline-none sm:min-h-60 sm:p-5 lg:p-6"
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
                                class="mt-2 font-main text-base leading-relaxed opacity-85"
                            >
                                {{ navDescription(node.path) }}
                            </p>
                        </NuxtLink>
                    </div>
                </section>
                <NuxtLink
                    v-if="overviewNode?.path"
                    :to="overviewNode.path"
                    class="inline-flex w-fit items-center gap-3 rounded-full bg-accent px-6 py-3 font-belanosima text-xl text-on-accent no-underline shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-outline sm:px-8 sm:py-4 sm:text-2xl"
                >
                    Go to Overview
                    <Icon icon="line-md:arrow-right" class="h-6 w-6" />
                </NuxtLink>
            </div>
        </nav>
    </article>
</template>
