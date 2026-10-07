<script setup>
import { contentTocLinks, isCollapsibleParagraph } from "~/utils/content-toc";
import katexMainFont from "katex/dist/fonts/KaTeX_Main-Regular.woff2?url";
import katexMathFont from "katex/dist/fonts/KaTeX_Math-Italic.woff2?url";
import katexSizeFont from "katex/dist/fonts/KaTeX_Size2-Regular.woff2?url";

const props = defineProps({
    page: { type: Object, required: true },
});

useHead(() => ({
    link: JSON.stringify(props.page.body ?? {}).includes("katex")
        ? [katexMainFont, katexMathFont, katexSizeFont].map((href) => ({
              rel: "preload",
              as: "font",
              type: "font/woff2",
              crossorigin: "anonymous",
              href,
          }))
        : [],
}));

const tocLinks = computed(() => contentTocLinks(props.page.body));
const sections = computed(() => {
    const children = bodyChildren(props.page.body);
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
        ...props.page,
        body: props.page.body?.value
            ? { ...props.page.body, value: children }
            : { ...props.page.body, children },
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
                :value="sectionValue(section.children)"
                class="content min-w-0 flex-1 text-on-surface"
            />
            <ContentRenderer
                v-if="section.heading && !section.collapsible"
                :value="sectionValue([section.heading])"
                class="content overflow-wrap-anywhere min-w-0 flex-1 text-on-surface"
            />
            <div v-if="section.children.length && !section.collapsible">
                <ContentRenderer
                    :value="sectionValue(section.children)"
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
