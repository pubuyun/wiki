<script setup>
import { buildCategorySidebarNodes } from "~/utils/content-pages";

const route = useRoute();
const category = computed(() => String(route.params.category ?? ""));
const categoryPath = computed(() => `/${category.value}`);
const activePath = computed(() => normalizeContentPath(route.path));

const { data: page } = await useContentPageData(activePath);
const { data: allPages } = await useContentNavigationData();

const pages = computed(() => allPages.value ?? []);
const children = computed(() => categoryPages(pages.value, category.value));
const categoryTitle = computed(() => titleizeSlug(category.value));
const categoryNavNodes = computed(() =>
    buildCategorySidebarNodes(children.value, category.value, activePath.value),
);

const contentLayout = useContentLayoutState();
watchEffect(() => {
    contentLayout.value = {
        pageTitle: page.value?.title ?? "",
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
            class="flex h-full flex-1 flex-row bg-surface text-on-surface"
        >
            <aside
                v-if="page"
                class="contents"
                aria-label="Category navigation"
            >
                <CategoryBar
                    class="hidden shrink-0 lg:flex"
                    :title="categoryTitle"
                    :title-to="categoryPath"
                    :nodes="categoryNavNodes"
                    :active-path="activePath"
                />
            </aside>

            <AccessibilityMenu />
            <div
                class="content-reading-container mt-16 min-w-0 flex-1 sm:mt-20 lg:px-8"
            >
                <slot />
            </div>
        </main>
        <LazyFooter hydrate-on-visible has-category-sidebar />
        <aside aria-label="Page utilities">
            <BackToTop />
        </aside>
        <ClickAnimation />
    </div>
</template>
