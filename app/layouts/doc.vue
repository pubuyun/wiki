<script setup>
import { contentTocLinks } from "~/utils/content-toc";
import { buildCategorySidebarNodes } from "~/utils/content-pages";

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
    buildCategorySidebarNodes(children.value, category.value, activePath.value),
);
const tocLinks = computed(() => contentTocLinks(page.value?.body));
const hasRightSidebar = computed(() => tocLinks.value.length > 0);

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
            <div class="min-w-0 flex-1 lg:px-8">
                <div
                    class="mx-auto mt-16 flex w-full min-w-0 gap-8 font-main sm:mt-20"
                    :class="
                        hasRightSidebar
                            ? 'doc-content-with-toc'
                            : 'lg:max-w-[calc(75ch+3rem)]'
                    "
                >
                    <slot />
                    <aside
                        v-if="hasRightSidebar"
                        class="contents"
                        aria-label="Page contents"
                    >
                        <ContentBar class="hidden lg:flex" :toc="tocLinks" />
                    </aside>
                </div>
            </div>
        </main>
        <LazyFooter hydrate-on-visible has-category-sidebar />
        <aside aria-label="Page utilities">
            <BackToTop />
        </aside>
        <ClickAnimation />
    </div>
</template>

<style scoped>
@media (width >= 64rem) {
    .doc-content-with-toc {
        --doc-body-width: calc(75ch + 3rem);
        --doc-toc-width: 16rem;
        display: grid;
        grid-template-columns: minmax(0, var(--doc-body-width)) var(
                --doc-toc-width
            );
        max-width: calc(var(--doc-body-width) + 2rem + var(--doc-toc-width));
    }
}

@media (width >= 80rem) {
    .doc-content-with-toc {
        --doc-toc-width: 20rem;
    }
}
</style>
