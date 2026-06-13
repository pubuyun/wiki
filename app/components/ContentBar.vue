<template>
    <nav
        class="sticky top-34 mb-6 max-h-[calc(100vh-11rem)] flex-col overflow-hidden rounded-r-[3.5em] bg-azure font-momo-trust-display shadow-lg"
        aria-labelledby="toc-title"
    >
        <h2 class="sr-only" id="toc-title">Table of contents</h2>

        <div
            class="max-h-full min-h-0 w-full flex-1 scrollbar-none overflow-y-auto"
            ref="contentScroll"
            @scroll="updateScrollGradients"
        >
            <AccordionRoot
                v-model="expandedItems"
                type="multiple"
                class="w-full"
                @update:model-value="keepExpandedContentVisible"
            >
                <template v-for="child in toc" :key="child.id">
                    <AccordionItem
                        v-if="child.children?.length"
                        :value="child.id"
                        class="overflow-hidden"
                    >
                        <AccordionHeader class="flex">
                            <AccordionTrigger :class="h2Class()">
                                <span
                                    :class="h2DecorationClass(child.id)"
                                    aria-hidden="true"
                                />
                                <span :class="h2TextClass(child.id)">
                                    {{ child.text }}
                                </span>
                            </AccordionTrigger>
                        </AccordionHeader>
                        <AccordionContent
                            class="content-bar-accordion-content overflow-hidden data-[state=closed]:animate-[content-bar-slide-up_500ms_ease-in] data-[state=open]:animate-[content-bar-slide-down_500ms_ease-out]"
                        >
                            <ul
                                class="mr-6 ml-24 list-disc space-y-2 py-2 marker:text-2xl marker:text-white"
                            >
                                <li
                                    v-for="value in child.children"
                                    :key="value.id"
                                >
                                    <a
                                        :href="`#${value.id}`"
                                        :class="h3Class(value.id)"
                                        @click="scrollToHash($event, value.id)"
                                    >
                                        {{ value.text }}
                                    </a>
                                </li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                    <a
                        v-else
                        :href="`#${child.id}`"
                        :class="h2Class()"
                        @click="scrollToHash($event, child.id)"
                    >
                        <span
                            :class="h2DecorationClass(child.id)"
                            aria-hidden="true"
                        />
                        <span :class="h2TextClass(child.id)">
                            {{ child.text }}
                        </span>
                    </a>
                </template>
            </AccordionRoot>
        </div>
        <!-- top gradient -->
        <div
            v-if="canScrollUp"
            class="pointer-events-none absolute top-0 right-0 left-0 z-10 h-8 rounded-t-lg bg-linear-to-b from-azure to-transparent"
        />

        <!-- bottom gradient -->
        <div
            v-if="canScrollDown"
            class="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-8 rounded-b-lg bg-linear-to-t from-azure to-transparent"
        />
    </nav>
</template>
<script setup lang="ts">
import {
    AccordionContent,
    AccordionHeader,
    AccordionItem,
    AccordionRoot,
    AccordionTrigger,
} from "radix-vue";

const h2Style =
    "group flex w-full items-stretch text-4xl text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none";
const h2DecorationStyle = "w-4 shrink-0 transition-colors duration-300";
const activeH2DecorationStyle = "bg-cblue";
const h2TextStyle =
    "flex flex-1 items-center justify-center rounded-full px-4 py-3 text-center transition-colors duration-300 group-hover:bg-spray group-hover:text-cblue";
const activeH2TextStyle = "text-cblue";
const h3Style =
    "block text-left font-momo-trust-display text-white hover:text-corn lg:text-lg xl:text-xl";
const activeH3Style =
    "text-sun underline decoration-2 decoration-sun underline-offset-4";
const scrollSpyActivationOffset = 8;

interface ToCLink {
    id: string;
    depth: number;
    text: string;
    children?: ToCLink[];
}
const props = defineProps<{
    toc: ToCLink[];
}>();

const { scrollToHash } = useHashScroll();
const expandedItems = ref<string[]>([]);
const activeH2Id = ref<string>();
const activeH3Id = ref<string>();
const contentScroll = ref<HTMLDivElement | null>(null);
const canScrollUp = ref(false);
const canScrollDown = ref(false);
let stopScrollSpy: (() => void) | undefined;

function updateScrollGradients() {
    const el = contentScroll.value;
    if (!el) return;

    const scrollTop = el.scrollTop;
    const clientHeight = el.clientHeight;
    const scrollHeight = el.scrollHeight;

    canScrollUp.value = scrollTop > 0;
    canScrollDown.value = scrollTop + clientHeight < scrollHeight - 1;
}
async function keepExpandedContentVisible() {
    await nextTick();
    contentScroll.value
        ?.querySelector(".content-bar-accordion-content[data-state='open']")
        ?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest",
        });
}
function h2Class() {
    return h2Style;
}

function h2DecorationClass(id: string) {
    return [
        h2DecorationStyle,
        activeH2Id.value === id && activeH2DecorationStyle,
    ];
}

function h2TextClass(id: string) {
    return [h2TextStyle, activeH2Id.value === id && activeH2TextStyle];
}

function h3Class(id: string) {
    return [h3Style, activeH3Id.value === id && activeH3Style];
}

function collectArticleHeadings() {
    return [
        ...document.querySelectorAll<HTMLElement>("main h2[id], main h3[id]"),
    ];
}

function parentH2For(id: string) {
    if (props.toc.some((link) => link.id === id)) {
        return id;
    }

    return props.toc.find((link) =>
        link.children?.some((child) => child.id === id),
    )?.id;
}

function updateActiveHeading() {
    const headings = collectArticleHeadings();
    if (!headings.length) return;

    const scrollLine =
        window.scrollY + getScrollPaddingTop() + scrollSpyActivationOffset;
    let current = headings[0]!;
    for (const heading of headings) {
        if (headingStartOffset(heading) <= scrollLine) {
            current = heading;
        }
    }

    const currentId = current.id;
    const currentH2Id = parentH2For(currentId);
    activeH2Id.value = currentH2Id;
    activeH3Id.value =
        current.tagName.toLowerCase() === "h3" ? currentId : undefined;

    if (
        currentH2Id &&
        (expandedItems.value[0] !== currentH2Id ||
            expandedItems.value.length > 1)
    ) {
        expandedItems.value = [currentH2Id];
    }
}

function getScrollPaddingTop() {
    const value = getComputedStyle(document.documentElement).scrollPaddingTop;
    return Number.parseFloat(value) || 0;
}

function headingStartOffset(heading: HTMLElement) {
    const scrollMarginTop =
        Number.parseFloat(getComputedStyle(heading).scrollMarginTop) || 0;

    return (
        heading.getBoundingClientRect().top + window.scrollY - scrollMarginTop
    );
}

function setupScrollSpy() {
    stopScrollSpy?.();
    const update = () => updateActiveHeading();
    const updateAfterAnchorScroll = () => {
        requestAnimationFrame(update);
        window.setTimeout(update, 300);
        window.setTimeout(update, 700);
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("hashchange", updateAfterAnchorScroll);
    stopScrollSpy = () => {
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
        window.removeEventListener("hashchange", updateAfterAnchorScroll);
    };

    update();
}

watch(contentScroll, (newVal) => {
    if (newVal) {
        updateScrollGradients();
    }
});
watch(
    () => props.toc,
    async () => {
        await nextTick();
        setupScrollSpy();
    },
    { deep: true },
);
onMounted(async () => {
    await nextTick();
    setupScrollSpy();
});
onBeforeUnmount(() => {
    stopScrollSpy?.();
});
</script>
<style>
@keyframes content-bar-slide-down {
    from {
        height: 0;
    }
    to {
        height: var(--radix-accordion-content-height);
    }
}

@keyframes content-bar-slide-up {
    from {
        height: var(--radix-accordion-content-height);
    }
    to {
        height: 0;
    }
}
</style>
