<template>
    <nav
        :class="contentBarClass"
        :data-content-bar-collapsed="collapsed"
        aria-labelledby="toc-title"
    >
        <h2 class="sr-only" id="toc-title">Table of contents</h2>
        <div
            v-if="contentTextRendered"
            class="absolute top-4 right-18 left-0 z-10 flex h-16 items-center justify-center text-primary-deep lg:text-xl xl:text-3xl"
            :class="contentTextClass"
            aria-hidden="true"
        >
            Contents
        </div>
        <button
            type="button"
            :class="collapseButtonClass"
            :aria-controls="contentId"
            :aria-expanded="!collapsed"
            :aria-label="
                collapsed
                    ? 'Expand table of contents'
                    : 'Collapse table of contents'
            "
            @click="collapsed = !collapsed"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="-6 -7 18 14"
                class="h-16 w-24 transition-transform duration-300"
                :class="collapsed && 'rotate-180'"
                aria-hidden="true"
            >
                <path d="M9 6 0 0 9-6Z" fill="currentColor" />
                <path
                    d="M-6 0 5-7 5.393-6.024-4 0 5.479 6.01 5 7-6 0Z"
                    fill="currentColor"
                />
            </svg>
        </button>

        <div
            v-if="contentTextRendered"
            :id="contentId"
            class="max-h-full min-h-0 w-full flex-1 scrollbar-none overflow-y-auto"
            :class="contentTextClass"
            :aria-hidden="!contentTextVisible"
            ref="contentScroll"
            @scroll="updateScrollGradients"
        >
            <AccordionRoot
                v-model="expandedItems"
                type="multiple"
                class="w-full"
            >
                <template v-for="child in toc" :key="child.id">
                    <AccordionItem
                        v-if="child.children?.length"
                        :value="child.id"
                        class="overflow-hidden text-white"
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
                            <ul class="ml-8 space-y-2">
                                <li
                                    v-for="value in child.children"
                                    :key="value.id"
                                    class="flex justify-center"
                                >
                                    <div
                                        class="flex w-4/5 -translate-x-4 items-center"
                                    >
                                        <span
                                            class="h-2 w-2 shrink-0 rounded-full bg-white"
                                            aria-hidden="true"
                                        />
                                        <a
                                            :href="`#${value.id}`"
                                            :class="h3Class(value.id)"
                                            :data-content-bar-h3-id="value.id"
                                            @click="
                                                scrollToHash($event, value.id)
                                            "
                                        >
                                            {{ value.text }}
                                        </a>
                                    </div>
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
            v-if="contentTextVisible && canScrollUp"
            class="pointer-events-none absolute top-18 z-10 h-8 w-full bg-linear-to-b from-primary-norm to-transparent"
        />

        <!-- bottom gradient -->
        <div
            v-if="contentTextVisible && canScrollDown"
            class="pointer-events-none absolute bottom-10 z-10 h-8 w-full bg-linear-to-t from-primary-norm to-transparent"
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
    "group m-2 flex w-[calc(100%-1rem)] items-stretch focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none md:text-lg lg:text-xl xl:text-2xl";
const h2DecorationStyle =
    "w-1 shrink-0 transition-[margin,width,background-color] duration-300 ease-out";
const activeH2DecorationStyle = "-ml-2 w-1 bg-primary-deep";
const h2TextStyle =
    "flex flex-1 items-center justify-start rounded-2xl px-4 py-2 text-left transition-[margin,border-radius,color,background-color] duration-300 ease-out";
const activeH2TextStyle = "-mr-2 rounded-none bg-secondary text-primary-dark";
const h3Style =
    "block pl-4 text-left font-belanosima hover:text-secondary md:text-md lg:text-lg xl:text-xl";
const activeH3Style =
    "text-secondary underline decoration-2 decoration-secondary underline-offset-4";
const scrollSpyActivationOffset = 8;
const hashScrollLockDuration = 2400;
const contentBarTransitionDuration = 300;
const contentId = "content-bar-toc";
const expandedContentBarClass = "w-1/6 pt-18 pb-10";
const collapsedContentBarClass = "h-24 w-18 pt-6 pb-6";

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
const collapsed = ref(false);
const contentTextRendered = ref(!collapsed.value);
const contentTextVisible = ref(!collapsed.value);
const expandedItems = ref<string[]>([]);
const activeH2Id = ref<string>();
const activeH3Id = ref<string>();
const contentScroll = ref<HTMLDivElement | null>(null);
const canScrollUp = ref(false);
const canScrollDown = ref(false);
let hashScrollUntil = 0;
let stopScrollSpy: (() => void) | undefined;
let contentTextRevealTimer: ReturnType<typeof setTimeout> | undefined;
let syncingExpandedItems = false;
let preserveUserExpandedItemsAfterHashScroll = false;

const contentBarClass = computed(() => [
    "sticky top-34 mb-6 max-h-[calc(100vh-11rem)] flex-col overflow-hidden rounded-r-[3.5em] bg-primary-norm  font-momo-trust-display shadow-lg transition-[width,height,padding,translate] duration-300 ease-out",
    collapsed.value ? collapsedContentBarClass : expandedContentBarClass,
    collapsed.value ? "-translate-x-6 hover:translate-x-0" : "translate-x-0",
]);
const collapseButtonClass = computed(() => [
    "absolute top-4 right-4 z-20 flex h-16 w-14 items-center justify-center rounded-full text-secondary transition-colors duration-300 hover:text-primary-light focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
]);
const contentTextClass = computed(() => [
    "transition-opacity duration-200 ease-out",
    contentTextVisible.value ? "opacity-100" : "opacity-0",
]);

function clearContentTextRevealTimer() {
    if (contentTextRevealTimer) {
        clearTimeout(contentTextRevealTimer);
        contentTextRevealTimer = undefined;
    }
}

function hideContentText() {
    clearContentTextRevealTimer();
    contentTextVisible.value = false;
    contentTextRendered.value = false;
}

function revealContentTextAfterResize() {
    clearContentTextRevealTimer();
    contentTextVisible.value = false;
    contentTextRendered.value = false;

    contentTextRevealTimer = setTimeout(async () => {
        contentTextRendered.value = true;
        await nextTick();
        requestAnimationFrame(() => {
            contentTextVisible.value = true;
            updateScrollGradients();
        });
    }, contentBarTransitionDuration);
}

function updateScrollGradients() {
    const el = contentScroll.value;
    if (!el) return;

    const scrollTop = el.scrollTop;
    const clientHeight = el.clientHeight;
    const scrollHeight = el.scrollHeight;

    canScrollUp.value = scrollTop > 0;
    canScrollDown.value = scrollTop + clientHeight < scrollHeight - 1;
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
    return [
        h2TextStyle,
        activeH2Id.value === id
            ? activeH2TextStyle
            : "group-hover:bg-primary-light group-hover:text-primary-dark",
    ];
}

function h3Class(id: string) {
    return [h3Style, activeH3Id.value === id && activeH3Style];
}

async function keepActiveH3InView(id: string) {
    if (collapsed.value) return;

    await nextTick();
    const scroller = contentScroll.value;
    const link = findContentBarH3Link(id);
    if (!scroller || !link) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const linkCenter = linkRect.top + linkRect.height / 2;
    const scrollerCenter = scrollerRect.top + scrollerRect.height / 2;

    scroller.scrollBy({
        top: linkCenter - scrollerCenter,
        behavior: "smooth",
    });
}

function findContentBarH3Link(id: string) {
    const escapedId =
        typeof CSS !== "undefined" && CSS.escape ? CSS.escape(id) : id;

    return contentScroll.value?.querySelector<HTMLElement>(
        `[data-content-bar-h3-id="${escapedId}"]`,
    );
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

async function syncExpandedItems(ids: string[]) {
    syncingExpandedItems = true;
    expandedItems.value = ids;
    await nextTick();
    syncingExpandedItems = false;
}

function setActiveHeading(
    id: string,
    isH3: boolean,
    shouldSyncExpandedItems = true,
) {
    const currentH2Id = parentH2For(id);
    activeH2Id.value = currentH2Id;
    activeH3Id.value = isH3 ? id : undefined;

    if (
        shouldSyncExpandedItems &&
        currentH2Id &&
        (expandedItems.value[0] !== currentH2Id ||
            expandedItems.value.length > 1)
    ) {
        void syncExpandedItems([currentH2Id]);
    }
}

function updateActiveHeading() {
    if (Date.now() < hashScrollUntil) return;

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

    setActiveHeading(
        current.id,
        current.tagName.toLowerCase() === "h3",
        !preserveUserExpandedItemsAfterHashScroll,
    );
    preserveUserExpandedItemsAfterHashScroll = false;
}

function lockToHashScrollDestination(id: string) {
    const target = document.getElementById(id);
    const isH3 = target?.tagName.toLowerCase() === "h3";

    hashScrollUntil = Date.now() + hashScrollLockDuration;
    preserveUserExpandedItemsAfterHashScroll = false;
    setActiveHeading(id, isH3);
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
        window.setTimeout(update, hashScrollLockDuration + 50);
    };
    const updateForHashScroll = (event: Event) => {
        const { id } = (event as CustomEvent<{ id?: string }>).detail ?? {};
        if (id) {
            lockToHashScrollDestination(id);
        }
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("hashchange", updateAfterAnchorScroll);
    window.addEventListener("wiki:hash-scroll", updateForHashScroll);
    stopScrollSpy = () => {
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
        window.removeEventListener("hashchange", updateAfterAnchorScroll);
        window.removeEventListener("wiki:hash-scroll", updateForHashScroll);
    };

    update();
}

watch(contentScroll, (newVal) => {
    if (newVal) {
        updateScrollGradients();
    }
});
watch(collapsed, (isCollapsed) => {
    if (isCollapsed) {
        hideContentText();
    } else {
        revealContentTextAfterResize();
    }
});
watch(expandedItems, () => {
    if (!syncingExpandedItems && Date.now() < hashScrollUntil) {
        preserveUserExpandedItemsAfterHashScroll = true;
    }
});
watch(activeH3Id, async (id) => {
    if (id) {
        await keepActiveH3InView(id);
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
    clearContentTextRevealTimer();
    stopScrollSpy?.();
});
</script>
<style>
@keyframes content-bar-slide-down {
    from {
        height: 0;
        border-bottom-width: 2px;
    }
    to {
        height: var(--radix-accordion-content-height);
        border-bottom-width: 0px;
    }
}

@keyframes content-bar-slide-up {
    from {
        height: var(--radix-accordion-content-height);
        border-bottom-width: 2px;
    }
    to {
        height: 0;
        border-bottom-width: 0px;
    }
}
</style>
