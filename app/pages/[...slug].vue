<script setup>
const route = useRoute();

const { data: page } = await useAsyncData(`content-${route.path}`, () =>
    queryCollection("content").path(route.path).first(),
);

if (!page.value) {
    throw createError({
        statusCode: 404,
        statusMessage: "Page not found",
        fatal: true,
    });
}

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
    <div v-if="page" class="flex flex-1 flex-col">
        <Banner v-if="page" :title="page.title" :imgSrc="page.meta?.banner" />
        <div
            class="content-layout flex h-full flex-1 flex-row bg-primary-deep p-10 text-white lg:pl-0"
        >
            <aside class="contents">
                <ContentBar
                    class="hidden lg:block"
                    :toc="page.body.toc.links"
                />
            </aside>
            <main class="flex flex-1 flex-col gap-6">
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
                        class="content flex-1 rounded-4xl bg-white p-6 text-primary-deep"
                    />
                </section>
            </main>
        </div>
    </div>
</template>

<style>
.content-layout {
    gap: 3.75rem;
    transition: gap 300ms ease-out;
}

.content-layout:has([data-content-bar-collapsed="true"]) {
    gap: 2rem;
}
</style>
