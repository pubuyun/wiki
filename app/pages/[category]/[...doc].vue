<script setup lang="ts">
definePageMeta({
    layout: "doc",
});

const route = useRoute();
const category = computed(() => String(route.params.category ?? ""));
const activePath = computed(() => normalizeContentPath(route.path));

const { data: page } = await useAsyncData(`content-${activePath.value}`, () =>
    queryCollection("content").path(activePath.value).first(),
);

const { data: allPages } = await useAsyncData("content-navigation", () =>
    queryCollection("content").all(),
);

const pages = computed(() => allPages.value ?? []);
const children = computed(() => categoryPages(pages.value, category.value));
const categoryRootPage = computed(() =>
    pages.value.find((item) => item.path === `/${category.value}`),
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

const contentLayout = useContentLayoutState();
watchEffect(() => {
    if (!page.value) return;

    contentLayout.value = {
        page: page.value,
        categoryTitle: categoryTitle.value,
        categoryNavNodes: categoryNavNodes.value,
        activePath: activePath.value,
        showRightSidebar: true,
    };
});

function bodyChildren(body: any) {
    return body?.children ?? body?.value ?? [];
}

function nodeTag(node: any) {
    return Array.isArray(node) ? node[0] : node?.tag;
}

function nodeProps(node: any) {
    return Array.isArray(node) ? node[1] : node?.props;
}

function sectionValue(children: any[]) {
    if (!page.value) return {};

    return {
        ...page.value,
        body: bodyWithChildren(page.value.body, children),
    };
}

function bodyWithChildren(body: any, children: any[]) {
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
    <main v-if="page" class="mt-20 flex flex-1 flex-col gap-6">
        <section
            v-for="section in sections"
            :key="section.id"
            class="flex flex-col gap-4"
        >
            <ContentRenderer
                v-if="section.heading"
                :value="sectionValue([section.heading])"
                class="content flex-1 text-white"
            />
            <ContentRenderer
                v-if="section.children.length"
                :value="sectionValue(section.children)"
                class="content paragraph flex-1 rounded-4xl bg-textbg p-6 text-textcolor"
            />
        </section>
    </main>
</template>
