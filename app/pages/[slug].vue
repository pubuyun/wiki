<script setup lang="ts">
definePageMeta({
    layout: "content",
});

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

const categoryNavNodes = computed(() =>
    buildCategoryNavTree(children.value, slug.value, pagePath.value),
);

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
    <main v-if="displayPage">
        <ul>
            <li v-for="node in categoryNavNodes" :key="node.id">
                <NuxtLink v-if="node.path" :to="node.path">
                    {{ node.label }}
                </NuxtLink>
                <template v-else>
                    {{ node.label }}
                </template>
                <ul v-if="node.children?.length" class="ml-4">
                    <li v-for="child in node.children" :key="child.id">
                        <NuxtLink :to="child.path">
                            {{ child.label }}
                        </NuxtLink>
                    </li>
                </ul>
            </li>
        </ul>
        <ContentRenderer :value="displayPage" />
    </main>
</template>
