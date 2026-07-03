<script setup>
import ColorblindModeToggle from "~/components/NavigationBar/ColorblindModeToggle.vue";

const contentLayout = useContentLayoutState();

const page = computed(() => contentLayout.value.page);
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
        <main class="flex flex-1 flex-col">
            <ClientOnly>
                <Banner
                    v-if="page"
                    :title="page.title"
                    :imgSrc="page.meta?.banner"
                />
            </ClientOnly>
            <div
                class="flex h-full flex-1 flex-row gap-8 bg-surface py-20 text-on-surface"
                :class="hasRightSidebar ? 'lg:pr-0' : ''"
            >
                <ClientOnly>
                    <aside class="contents">
                        <ContentBar
                            v-if="hasRightSidebar"
                            class="order-last hidden lg:flex"
                            :toc="page.body.toc.links"
                        />
                    </aside>
                </ClientOnly>
                <div class="flex-1">
                    <slot />
                </div>
            </div>
        </main>
        <Footer />
        <ColorblindModeToggle />
        <BackToTop />
        <ClickAnimation />
    </div>
</template>
