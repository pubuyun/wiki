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
    queryCollection("content")
        .select("path", "title", "description", "meta")
        .all(),
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
        class="flex min-w-0 flex-1 flex-col px-4 pt-4 sm:px-6 lg:px-8 xl:px-12"
    >
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
                    <h2
                        class="w-fit max-w-full self-center rounded-3xl bg-primary px-4 py-2 text-center font-belanosima text-4xl leading-tight text-on-primary shadow-sm sm:px-6 sm:text-5xl"
                    >
                        <NuxtLink
                            v-if="node.path"
                            :to="node.path"
                            class="no-underline hover:text-on-primary hover:underline"
                        >
                            {{ node.label }}
                        </NuxtLink>

                        <template v-else>
                            {{ node.label }}
                        </template>
                    </h2>

                    <div
                        class="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                    >
                        <NuxtLink
                            v-for="child in node.children"
                            :key="child.id"
                            :to="child.path"
                            class="group flex min-h-52 min-w-0 flex-col rounded-2xl border-2 border-outline bg-surface-elevated p-4 text-on-surface no-underline shadow-sm transition hover:-translate-y-1 hover:border-primary hover:text-on-surface hover:shadow-lg focus-visible:-translate-y-1 focus-visible:border-outline focus-visible:text-on-surface focus-visible:outline-none sm:min-h-60 sm:p-5 lg:p-6"
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
                        class="group flex min-h-52 min-w-0 flex-col rounded-2xl border-2 border-outline bg-surface-elevated p-4 text-on-surface no-underline shadow-sm transition hover:-translate-y-1 hover:border-primary hover:text-on-surface hover:shadow-lg focus-visible:-translate-y-1 focus-visible:border-outline focus-visible:text-on-surface focus-visible:outline-none sm:min-h-60 sm:p-5 lg:p-6"
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
                </section>
                <NuxtLink
                    v-if="overviewNode?.path"
                    :to="overviewNode.path"
                    class="inline-flex w-fit items-center gap-3 rounded-full bg-primary px-6 py-3 font-belanosima text-xl text-on-primary no-underline shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-outline sm:px-8 sm:py-4 sm:text-2xl"
                >
                    Go to Overview
                    <Icon icon="line-md:arrow-right" class="h-6 w-6" />
                </NuxtLink>
            </div>
        </nav>
    </article>
</template>
