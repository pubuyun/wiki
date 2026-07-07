<script setup>
definePageMeta({
    layout: "doc",
    key: (route) => route.fullPath,
});

const route = useRoute();
const category = computed(() => String(route.params.category ?? ""));
const categoryPath = computed(() => `/${category.value}`);
const activePath = computed(() => normalizeContentPath(route.path));

const { data: page } = await useAsyncData(`content-${activePath.value}`, () =>
    queryCollection("content").path(activePath.value).first(),
);

const { data: allPages } = await useAsyncData("content-navigation", () =>
    queryCollection("content").select("path", "title", "description").all(),
);

const pages = computed(() => allPages.value ?? []);
const children = computed(() => categoryPages(pages.value, category.value));
const currentPageIndex = computed(() =>
    children.value.findIndex((item) => item.path === activePath.value),
);
const previousPage = computed(() =>
    currentPageIndex.value > 0
        ? children.value[currentPageIndex.value - 1]
        : null,
);
const nextPage = computed(() =>
    currentPageIndex.value >= 0 &&
    currentPageIndex.value < children.value.length - 1
        ? children.value[currentPageIndex.value + 1]
        : null,
);
const currentFolderCards = computed(() => {
    const prefix = `${activePath.value}/`;

    return pages.value
        .filter((item) => {
            if (!item.path?.startsWith(prefix)) return false;

            const relativePath = item.path.slice(prefix.length);
            return Boolean(relativePath) && !relativePath.includes("/");
        })
        .sort((a, b) => a.path.localeCompare(b.path));
});
const categoryRootPage = computed(() =>
    pages.value.find((item) => item.path === categoryPath.value),
);
const categoryTitle = computed(
    () => categoryRootPage.value?.title ?? titleizeSlug(category.value),
);
const categoryNavNodes = computed(() =>
    buildCategoryNavTree(children.value, category.value, activePath.value),
);
const sections = computed(() => {
    const children = bodyChildren(page.value?.body);
    const result = [];
    let currentSection = null;

    for (const child of children) {
        if (nodeTag(child) === "h2") {
            currentSection = {
                id: nodeProps(child)?.id ?? `section-${result.length}`,
                heading: child,
                children: [],
            };
            result.push(currentSection);
            continue;
        }

        if (!currentSection) {
            currentSection = {
                id: "intro",
                heading: null,
                children: [],
            };
            result.push(currentSection);
        }

        currentSection.children.push(child);
    }

    return result;
});

if (!page.value || !children.value.length) {
    throw createError({
        statusCode: 404,
        statusMessage: "Page not found",
        fatal: true,
    });
}

useSeoMeta({
    title: () => pageSeoTitle(page.value),
    description: () => pageDescription(page.value),
});

const contentLayout = useContentLayoutState();
watchEffect(() => {
    if (!page.value) return;

    contentLayout.value = {
        page: page.value,
        categoryTitle: categoryTitle.value,
        categoryPath: categoryPath.value,
        categoryNavNodes: categoryNavNodes.value,
        activePath: activePath.value,
        showRightSidebar: true,
    };
});

function bodyChildren(body) {
    return body?.children ?? body?.value ?? [];
}

function nodeTag(node) {
    return Array.isArray(node) ? node[0] : node?.tag;
}

function nodeProps(node) {
    return Array.isArray(node) ? node[1] : node?.props;
}

function sectionValue(children) {
    if (!page.value) return {};

    return {
        ...page.value,
        body: bodyWithChildren(page.value.body, children),
    };
}

function bodyWithChildren(body, children) {
    if (body?.value) {
        return {
            ...body,
            value: children,
        };
    }

    return {
        ...body,
        children,
    };
}

</script>

<template>
    <article
        v-if="page"
        class="mt-16 flex w-full max-w-[100vw] min-w-0 flex-1 flex-col gap-4 overflow-x-visible px-4 sm:mt-20 sm:gap-6 sm:px-6 lg:px-0"
    >   
         <h1 class="sr-only">
            {{ pageTitle(page) }}
        </h1>


        <ClientOnly>
            <MobileContentBar
                v-if="page.body?.toc?.links?.length"
                :toc="page.body.toc.links"
            />
        </ClientOnly>
        <section
            v-for="section in sections"
            :key="section.id"
            class="mb-4 flex max-w-full min-w-0 flex-col gap-4"
        >
            <ContentRenderer
                v-if="section.heading"
                :value="sectionValue([section.heading])"
                class="content overflow-wrap-anywhere min-w-0 flex-1 text-on-surface"
            />
            <div
                v-if="section.children.length"
                class="relative -translate-x-2 pr-2"
            >
                <div
                    class="absolute inset-0 translate-x-2 translate-y-4 rounded-2xl bg-primary sm:rounded-3xl lg:rounded-4xl"
                    aria-hidden="true"
                />
                <ContentRenderer
                    :value="sectionValue(section.children)"
                    class="content paragraph overflow-wrap-anywhere relative min-w-0 rounded-2xl bg-secondary p-4 text-on-secondary sm:rounded-3xl sm:p-5 lg:rounded-4xl lg:p-6"
                />
            </div>
        </section>
        <section
            v-if="currentFolderCards.length"
            class="grid max-w-full min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            aria-label="Current folder documents"
        >
            <NuxtLink
                v-for="doc in currentFolderCards"
                :key="doc.path"
                :to="doc.path"
                class="group flex min-h-36 min-w-0 flex-col gap-3 rounded-2xl border-2 border-surface-variant bg-secondary p-4 text-on-secondary no-underline transition hover:-translate-y-px hover:border-secondary hover:text-on-secondary focus-visible:-translate-y-px focus-visible:border-outline focus-visible:text-on-secondary focus-visible:outline-none sm:rounded-3xl sm:p-5 lg:rounded-4xl lg:p-6"
            >
                <h2
                    class="font-belanosima text-2xl leading-tight wrap-anywhere"
                >
                    {{ doc.title }}
                </h2>
                <p
                    v-if="pageDescription(doc)"
                    class="font-main text-base leading-relaxed text-on-secondary/85 transition group-hover:text-on-secondary/85"
                >
                    {{ pageDescription(doc) }}
                </p>
            </NuxtLink>
        </section>
        <nav
            v-if="previousPage || nextPage"
            class="my-6 grid gap-3 sm:grid-cols-2"
            aria-label="Docs pages"
        >
            <NuxtLink
                v-if="previousPage"
                class="my-1 flex min-w-0 flex-col gap-1 rounded-2xl border-2 border-surface-variant bg-secondary p-4 text-on-secondary no-underline transition hover:-translate-y-px hover:border-secondary hover:text-on-secondary focus-visible:-translate-y-px focus-visible:border-outline focus-visible:text-on-secondary focus-visible:outline-none"
                :to="previousPage.path"
            >
                <div class="font-main text-sm opacity-70">Previous</div>
                <div
                    class="font-belanosima text-lg leading-tight wrap-anywhere"
                >
                    {{ pageTitle(previousPage) }}
                </div>
            </NuxtLink>
            <span v-else aria-hidden="true" />
            <NuxtLink
                v-if="nextPage"
                class="my-1 flex min-w-0 flex-col items-end gap-1 rounded-2xl border-2 border-surface-variant bg-secondary p-4 text-right text-on-secondary no-underline transition hover:-translate-y-px hover:border-secondary hover:text-on-secondary focus-visible:-translate-y-px focus-visible:border-outline focus-visible:text-on-secondary focus-visible:outline-none"
                :to="nextPage.path"
            >
                <div class="font-main text-sm opacity-70">Next</div>
                <div
                    class="font-belanosima text-lg leading-tight wrap-anywhere"
                >
                    {{ pageTitle(nextPage) }}
                </div>
            </NuxtLink>
        </nav>
    </article>
</template>

<style scoped>
.overflow-wrap-anywhere {
    overflow-wrap: anywhere;
}
</style>
