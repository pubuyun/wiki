<script setup>
import { buildCategorySidebarNodes } from "~/utils/content-pages";

const route = useRoute();
const category = computed(() => String(route.params.slug ?? ""));
const categoryPath = computed(() => `/${category.value}`);
const activePath = categoryPath;

const { data: contentPage } = await useContentPageData(categoryPath);
const { data: allPages } = await useContentNavigationData();

const pages = computed(() => allPages.value ?? []);
const children = computed(() => categoryPages(pages.value, category.value));
const page = computed(() => {
    if (contentPage.value) return contentPage.value;
    if (!children.value.length) return null;

    return {
        path: categoryPath.value,
        title: titleizeSlug(category.value),
        meta: {},
        body: { children: [], toc: { links: [] } },
    };
});
const categoryTitle = computed(() => titleizeSlug(category.value));
const categoryNavNodes = computed(() =>
    buildCategorySidebarNodes(children.value, category.value, activePath.value),
);
const contentLayout = useContentLayoutState();

watchEffect(() => {
    contentLayout.value = {
        pageTitle: categoryTitle.value,
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
        <SkipToContent />
        <header class="fixed top-0 z-100 flex w-full flex-col">
            <NavigationBar />
        </header>

        <main
            id="main-content"
            tabindex="-1"
            class="flex flex-1 bg-surface text-on-surface"
        >
            <CategoryBar
                v-if="page"
                class="hidden lg:flex"
                :title="categoryTitle"
                :title-to="categoryPath"
                :nodes="categoryNavNodes"
                :active-path="activePath"
            />

            <div
                class="category-page flex min-w-0 flex-1 flex-col pt-12 sm:pt-10 lg:pt-11 xl:pt-14"
            >
                <Banner
                    v-if="page"
                    :title="categoryTitle"
                    :img-src="page.meta?.banner"
                    :img-width="page.meta?.bannerWidth"
                    :img-height="page.meta?.bannerHeight"
                    :img-position="page.meta?.bannerPosition"
                    :img-mobile-position="page.meta?.bannerMobilePosition"
                    :img-fit="page.meta?.bannerFit"
                    :img-background="page.meta?.bannerBackground"
                />
                <div
                    class="category-reading-region flex min-w-0 flex-1 flex-col pb-20"
                >
                    <slot />
                </div>
            </div>
        </main>

        <LazyFooter hydrate-on-visible has-category-sidebar />

        <aside aria-label="Page utilities">
            <AccessibilityMenu />
            <BackToTop />
        </aside>

        <ClickAnimation />
    </div>
</template>

<style scoped>
.category-page {
    --category-header-height: 3rem;
}

@media (min-width: 40rem) {
    .category-page {
        --category-header-height: 2.5rem;
    }
}

@media (min-width: 64rem) {
    .category-page {
        --category-header-height: 2.75rem;
    }
}

@media (min-width: 80rem) {
    .category-page {
        --category-header-height: 3.5rem;
    }
}

.category-reading-region {
    padding-top: 0.75rem;
}
</style>
