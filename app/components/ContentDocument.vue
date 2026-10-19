<script setup>
import { contentTocLinks, isCollapsibleParagraph } from "~/utils/content-toc";
import { numberDocumentFigures } from "~/utils/document-figures";
import katexMainFont from "katex/dist/fonts/KaTeX_Main-Regular.woff2?url";
import katexMathFont from "katex/dist/fonts/KaTeX_Math-Italic.woff2?url";
import katexSizeFont from "katex/dist/fonts/KaTeX_Size2-Regular.woff2?url";

const props = defineProps({
    page: { type: Object, required: true },
    showHeader: { type: Boolean, default: true },
    headingLevel: { type: Number, default: 1 },
    navigationPages: { type: Array, default: () => [] },
    numberFigures: { type: Boolean, default: true },
});

// Navigation can refresh the same Nuxt Content record with new object identities.
// Keep its render tree until the document's actual revision changes.
const page = computed((previous) => {
    const next = props.page;
    return previous && JSON.stringify(previous) === JSON.stringify(next)
        ? previous
        : next;
});

const stageTitle = computed(() =>
    page.value.path?.startsWith("/human-practices/stage-")
        ? pageTitle(page.value).match(/^(Stage \d+)\s+(.+)$/)
        : null,
);

const breadcrumbs = computed(() => {
    const segments = page.value.path.split("/").filter(Boolean);
    const items = [
        { label: titleizeSlug(segments[0]), path: `/${segments[0]}` },
    ];

    for (let index = 1; index < segments.length - 1; index++) {
        const path = `/${segments.slice(0, index + 1).join("/")}`;
        const ancestor = props.navigationPages.find(
            (item) => item.path === path,
        );
        items.push({
            label: ancestor?.title || titleizeSlug(segments[index]),
            path: ancestor?.path,
        });
    }

    return [...items, { label: pageTitle(page.value), current: true }];
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
const numberedBody = computed(() =>
    props.numberFigures
        ? numberDocumentFigures(page.value.body ?? {})
        : (page.value.body ?? {}),
);
const sections = computed(() => {
    const children = bodyChildren(numberedBody.value);
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
        <header
            v-if="showHeader"
            class="mb-2 flex w-full min-w-0 flex-col gap-3 self-center pt-2 pb-4 lg:max-w-[calc(75ch+3rem)]"
        >
            <nav aria-label="Breadcrumb" class="font-belanosima text-base">
                <ol class="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <template
                        v-for="(crumb, index) in breadcrumbs"
                        :key="index"
                    >
                        <li
                            v-if="index"
                            aria-hidden="true"
                            class="text-on-surface/50"
                        >
                            /
                        </li>
                        <li :aria-current="crumb.current ? 'page' : undefined">
                            <NuxtLink
                                v-if="crumb.path"
                                :to="crumb.path"
                                class="rounded-sm text-on-surface/80 transition-colors hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-outline"
                            >
                                {{ crumb.label }}
                            </NuxtLink>
                            <span v-else class="text-on-surface">{{
                                crumb.label
                            }}</span>
                        </li>
                    </template>
                </ol>
            </nav>
            <component
                :is="`h${headingLevel}`"
                class="font-momo-trust-display text-3xl leading-tight wrap-anywhere text-on-surface sm:text-4xl"
            >
                <template v-if="stageTitle"
                    >{{ stageTitle[1] }}<br />{{ stageTitle[2] }}</template
                >
                <template v-else>{{ pageTitle(page) }}</template>
            </component>
        </header>
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
