<script setup>
const route = useRoute();
const category = computed(() => String(route.params.category ?? ""));
const categoryPath = computed(() => `/${category.value}`);
const activePath = computed(() => normalizeContentPath(route.path));

const { data: page } = await useContentPageData(activePath);
const { data: allPages } = await useContentNavigationData();

const pages = computed(() => allPages.value ?? []);
const children = computed(() => categoryPages(pages.value, category.value));
const categoryRootPage = computed(() =>
    pages.value.find((item) => item.path === categoryPath.value),
);
const categoryTitle = computed(
    () => categoryRootPage.value?.title ?? titleizeSlug(category.value),
);
const categoryNavNodes = computed(() =>
    buildCategoryNavTree(children.value, category.value, activePath.value),
);
const hasRightSidebar = computed(
    () => page.value?.body?.toc?.links?.length > 0,
);

const contentLayout = useContentLayoutState();
watchEffect(() => {
    contentLayout.value = {
        page: page.value,
        categoryTitle: categoryTitle.value,
        categoryPath: categoryPath.value,
        categoryNavNodes: categoryNavNodes.value,
        activePath: activePath.value,
        showRightSidebar: true,
    };
});
</script>

<template>
    <div class="relative z-0 flex min-h-screen flex-col">
        <header class="fixed top-0 z-100 flex w-full flex-col">
            <NavigationBar />
        </header>
        <main
            class="flex h-full flex-1 flex-row gap-8 bg-surface text-on-surface"
            :class="{ 'lg:pr-8': !hasRightSidebar }"
        >
            <aside
                v-if="page"
                class="contents"
                aria-label="Category navigation"
            >
                <CategoryBar
                    class="hidden lg:flex"
                    :title="categoryTitle"
                    :title-to="categoryPath"
                    :nodes="categoryNavNodes"
                    :active-path="activePath"
                />
            </aside>

            <aside
                v-if="hasRightSidebar"
                class="contents"
                aria-label="Page contents"
            >
                <ContentBar
                    class="order-last hidden lg:flex"
                    :toc="page.body.toc.links"
                />
            </aside>

            <AccessibilityMenu />
            <slot />
        </main>
        <LazyFooter hydrate-on-visible has-category-sidebar />
        <aside aria-label="Page utilities">
            <BackToTop />
        </aside>
        <ClickAnimation />
    </div>
</template>
