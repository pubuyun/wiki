<script setup>
import { contentTocLinks, isCollapsibleParagraph } from "~/utils/content-toc";
import katexMainFont from "katex/dist/fonts/KaTeX_Main-Regular.woff2?url";
import katexMathFont from "katex/dist/fonts/KaTeX_Math-Italic.woff2?url";
import katexSizeFont from "katex/dist/fonts/KaTeX_Size2-Regular.woff2?url";

const props = defineProps({
    page: { type: Object, required: true },
});

// Navigation can refresh the same Nuxt Content record with new object identities.
// Keep its render tree until the document's actual revision changes.
const page = computed((previous) => {
    const next = props.page;
    return previous && JSON.stringify(previous) === JSON.stringify(next)
        ? previous
        : next;
});

useHead(() => ({
    link: JSON.stringify(page.value.body ?? {}).includes("katex")
        ? [katexMainFont, katexMathFont, katexSizeFont].map((href) => ({
              rel: "preload",
              as: "font",
              type: "font/woff2",
              crossorigin: "anonymous",
              href,
          }))
        : [],
}));

const tocLinks = computed(() => contentTocLinks(page.value.body));
const sections = computed(() => {
    const children = bodyChildren(page.value.body);
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

        if (isCollapsibleParagraph(child)) {
            result.push({
                id: nodeProps(child)?.id ?? `section-${result.length}`,
                heading: null,
                children: [child],
                collapsible: true,
            });
            currentSection = null;
            continue;
        }

        if (!currentSection) {
            currentSection = {
                id: result.length === 0 ? "intro" : `section-${result.length}`,
                heading: null,
                children: [],
            };
            result.push(currentSection);
        }

        currentSection.children.push(child);
    }

    // Keep renderer values stable across route/parent updates. Recreating these
    // objects makes ContentRenderer recreate its async component wrappers and
    // briefly removes already-rendered sections from the document.
    return result.map((section) => ({
        ...section,
        value: sectionValue(section.children),
        headingValue: section.heading ? sectionValue([section.heading]) : null,
    }));
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
        body: page.value.body?.value
            ? { ...page.value.body, value: children }
            : { ...page.value.body, children },
    };
}
</script>

<template>
    <div class="flex w-full max-w-full min-w-0 flex-col gap-4 sm:gap-6">
        <MobileContentBar v-if="tocLinks.length" :toc="tocLinks" />
        <section
            v-for="section in sections"
            :key="section.id"
            class="mb-4 flex w-full max-w-full min-w-0 flex-col gap-4 self-center font-main lg:max-w-[calc(75ch+3rem)]"
        >
            <ContentRenderer
                v-if="section.collapsible"
                :key="page.path"
                :value="section.value"
                class="content min-w-0 flex-1 text-on-surface"
            />
            <ContentRenderer
                v-if="section.heading && !section.collapsible"
                :value="section.headingValue"
                class="content overflow-wrap-anywhere min-w-0 flex-1 text-on-surface"
            />
            <div v-if="section.children.length && !section.collapsible">
                <ContentRenderer
                    :value="section.value"
                    class="content paragraph overflow-wrap-anywhere relative min-w-0 rounded-2xl bg-secondary p-4 text-on-secondary sm:rounded-3xl sm:p-5 lg:rounded-4xl lg:p-6"
                />
            </div>
        </section>
    </div>
</template>

<style scoped>
.overflow-wrap-anywhere {
    overflow-wrap: anywhere;
}

:deep(.content h3) {
    font-family: var(--font-main);
}

:deep(.paragraph > :is(h3, h4, h5):first-child) {
    margin-top: 0;
}
</style>
