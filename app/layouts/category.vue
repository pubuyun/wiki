<script setup>
const contentLayout = useContentLayoutState();

const page = computed(() => contentLayout.value.page);
const categoryTitle = computed(() => contentLayout.value.categoryTitle);
const categoryPath = computed(() => contentLayout.value.categoryPath);
const categoryNavNodes = computed(() => contentLayout.value.categoryNavNodes);
const activePath = computed(() => contentLayout.value.activePath);
const hasRightSidebar = computed(
    () =>
        contentLayout.value.showRightSidebar &&
        page.value?.body?.toc?.links?.length > 0,
);
</script>

<template>
    <div class="relative z-0 flex min-h-screen flex-col">
        <header class="fixed top-0 z-100 flex w-full flex-col">
            <NavigationBar scroll-opacity />
        </header>
        <main class="flex flex-1 bg-surface text-on-surface">
            <CategoryBar
                v-if="page"
                class="hidden lg:flex"
                :title="categoryTitle"
                :title-to="categoryPath"
                :nodes="categoryNavNodes"
                :active-path="activePath"
            />

            <div class="flex min-w-0 flex-1 flex-col">
                <Banner
                    v-if="page"
                    :title="page.title"
                    :imgSrc="page.meta?.banner"
                />

                <div
                    class="flex min-w-0 flex-1 flex-row gap-8 py-20"
                    :class="hasRightSidebar ? 'lg:pr-0' : ''"
                >
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

                    <slot />
                </div>
            </div>
        </main>
        <Footer />
        <aside aria-label="Page utilities">
            <BackToTop />
        </aside>
        <ClickAnimation />
    </div>
</template>
