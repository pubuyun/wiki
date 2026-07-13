<script setup>
const contentLayout = useContentLayoutState();

const page = computed(() => contentLayout.value.page);
const categoryTitle = computed(() => contentLayout.value.categoryTitle);
const categoryPath = computed(() => contentLayout.value.categoryPath);
const categoryNavNodes = computed(() => contentLayout.value.categoryNavNodes);
const activePath = computed(() => contentLayout.value.activePath);
const hasRightSidebar = computed(
    () => page.value?.body?.toc?.links?.length > 0,
);
</script>

<template>
    <div class="relative z-0 flex min-h-screen flex-col">
        <header class="fixed top-0 z-100 flex w-full flex-col">
            <NavigationBar />
        </header>
        <main
            class="flex h-full flex-1 flex-row gap-8 bg-surface text-on-surface"
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
        <Footer />
        <aside aria-label="Page utilities">
            <BackToTop />
        </aside>
        <ClickAnimation />
    </div>
</template>
