<template>
    <nav
        :class="sidebarClass"
        :data-category-sidebar-collapsed="collapsed"
        aria-labelledby="category-sidebar-title"
    >
        <h2 class="sr-only" id="category-sidebar-title">Category navigation</h2>
        <NuxtLink
            v-if="!collapsed"
            to="/"
            class="icon-section absolute top-0 left-4 z-10 flex h-11 shrink-0 items-center gap-4 font-righteous xl:h-14"
            aria-label="Go to homepage"
        >
            <BrandIcon />
            <span
                class="text-primary-deep lg:text-2xl xl:text-4xl dark:text-textcolor"
                aria-hidden="true"
            >
                Expelliodor
            </span>
        </NuxtLink>
        <div
            v-if="contentRendered"
            class="absolute top-14 right-3 left-3 z-10 flex min-h-9 items-center justify-center gap-2 text-secondary xl:top-16"
            :class="contentClass"
        >
            <NuxtLink
                :to="titleTo"
                class="category-sidebar-title min-w-0 rounded-md px-2 py-1 font-semibold transition-colors hover:bg-primary-light hover:text-primary-dark focus-visible:ring-2 focus-visible:ring-primary-deep focus-visible:outline-none dark:hover:text-textcolor"
                :style="titleStyle"
                :aria-label="`Go to ${title}`"
            >
                <span ref="titleText" class="category-sidebar-title-text">
                    {{ title }}
                </span>
            </NuxtLink>
            <button
                type="button"
                :class="titleCollapseButtonClass"
                :aria-controls="contentId"
                :aria-expanded="!collapsed"
                aria-label="Collapse category navigation"
                @click="collapsed = true"
            >
                <svg
                    viewBox="0 0 24 24"
                    class="size-8 xl:size-10"
                    aria-hidden="true"
                >
                    <path
                        d="M16.5 5.8C16.5 4.7 15.2 4.1 14.3 4.8L6.6 10.9C5.8 11.5 5.8 12.5 6.6 13.1L14.3 19.2C15.2 19.9 16.5 19.3 16.5 18.2V5.8Z"
                        fill="currentColor"
                    />
                </svg>
            </button>
        </div>
        <button
            v-if="collapsed"
            type="button"
            :class="collapseButtonClass"
            :aria-controls="contentId"
            :aria-expanded="!collapsed"
            :aria-label="
                collapsed
                    ? 'Expand category navigation'
                    : 'Collapse category navigation'
            "
            @click="collapsed = false"
        >
            <svg viewBox="0 0 24 24" class="size-10" aria-hidden="true">
                <path
                    d="M7.5 5.8C7.5 4.7 8.8 4.1 9.7 4.8L17.4 10.9C18.2 11.5 18.2 12.5 17.4 13.1L9.7 19.2C8.8 19.9 7.5 19.3 7.5 18.2V5.8Z"
                    fill="currentColor"
                />
            </svg>
        </button>

        <div
            v-if="contentRendered"
            :id="contentId"
            ref="contentScroll"
            class="category-sidebar-scroll mt-[5.75rem] max-h-full min-h-0 w-full flex-1 overflow-y-auto px-3 pb-4 xl:mt-[6.5rem]"
            :class="contentClass"
            :aria-hidden="!contentVisible"
            @scroll="updateScrollGradients"
        >
            <AccordionRoot
                v-model="expandedItems"
                type="multiple"
                class="category-sidebar-scroll-content w-full"
            >
                <ul class="space-y-1">
                    <li v-for="node in nodes" :key="node.id">
                        <AccordionItem
                            v-if="node.children?.length"
                            :value="node.id"
                            class="overflow-hidden text-white"
                        >
                            <AccordionHeader class="flex h-min gap-0">
                                <div :class="folderClass(node)">
                                    <NuxtLink
                                        v-if="node.path"
                                        :to="node.path"
                                        :class="folderTextClass(node)"
                                    >
                                        {{ node.label }}
                                    </NuxtLink>
                                    <span v-else :class="folderTextClass(node)">
                                        {{ node.label }}
                                    </span>
                                    <AccordionTrigger
                                        :class="folderToggleClass(node)"
                                        :title="`Expand or collapse ${node.label}`"
                                        :aria-label="`Expand or collapse ${node.label}`"
                                    >
                                        <span
                                            class="transition-transform duration-300 group-data-[state=open]:rotate-90"
                                            aria-hidden="true"
                                        >
                                            &#9656;
                                        </span>
                                    </AccordionTrigger>
                                </div>
                            </AccordionHeader>
                            <AccordionContent
                                class="category-sidebar-accordion-content overflow-hidden data-[state=closed]:animate-[category-sidebar-slide-up_500ms_ease-in] data-[state=open]:animate-[category-sidebar-slide-down_500ms_ease-out]"
                            >
                                <div class="relative ml-4 pl-2">
                                    <div
                                        class="pointer-events-none absolute top-0 bottom-0 left-0 w-0.5 rounded-full bg-white/25"
                                        aria-hidden="true"
                                    />
                                    <div
                                        v-if="activeChildIndex(node) >= 0"
                                        class="pointer-events-none absolute left-0 h-9 w-0.5 rounded-full bg-tertiary transition-transform duration-200 ease-out xl:h-10"
                                        :style="activeChildIndicatorStyle(node)"
                                        aria-hidden="true"
                                    />
                                    <ul
                                        class="space-y-[var(--category-sidebar-child-item-gap)]"
                                    >
                                        <li
                                            v-for="child in node.children"
                                            :key="child.id"
                                            class="relative"
                                        >
                                            <NuxtLink
                                                v-if="child.path"
                                                :to="child.path"
                                                :class="linkClass(1)"
                                            >
                                                <span
                                                    :class="
                                                        linkTextClass(child, 1)
                                                    "
                                                >
                                                    {{ child.label }}
                                                </span>
                                            </NuxtLink>
                                        </li>
                                    </ul>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        <NuxtLink
                            v-else-if="node.path"
                            :to="node.path"
                            :class="linkClass(0)"
                        >
                            <span :class="linkTextClass(node, 0)">
                                {{ node.label }}
                            </span>
                        </NuxtLink>
                    </li>
                </ul>
            </AccordionRoot>
        </div>

        <div
            v-if="contentVisible && canScrollUp"
            class="pointer-events-none absolute top-[5.75rem] z-10 h-8 w-full bg-linear-to-b from-primary-norm to-transparent xl:top-[6.5rem]"
        />
        <div
            v-if="contentVisible && canScrollDown"
            class="pointer-events-none absolute bottom-0 z-10 h-8 w-full bg-linear-to-t from-primary-norm to-transparent"
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
} from "reka-ui";
import type { ContentNavNode } from "~/utils/content-pages";

const props = defineProps<{
    title: string;
    titleTo: string;
    nodes: ContentNavNode[];
    activePath: string;
}>();

const collapsed = ref(false);
const contentRendered = ref(!collapsed.value);
const contentVisible = ref(!collapsed.value);
const contentScroll = ref<HTMLDivElement | null>(null);
const titleText = ref<HTMLElement | null>(null);
const titleScale = ref(1);
const expandedItems = ref<string[]>([]);
const canScrollUp = ref(false);
const canScrollDown = ref(false);
const transitionDuration = 200;
const contentId = "category-sidebar-nav";
let contentRevealTimer: ReturnType<typeof setTimeout> | undefined;
let titleResizeObserver: ResizeObserver | undefined;

const sidebarClass = computed(() => [
    "sticky top-0 h-screen max-h-screen flex-col overflow-hidden border-r border-white/20 bg-primary-norm font-momo-trust-display text-white shadow-sm transition-[width,height,padding,translate] duration-200 ease-out",
    collapsed.value ? "w-12 py-6" : "w-1/5 pt-4",
    "translate-x-0",
]);

const collapseButtonClass = computed(() => [
    "absolute inset-0 z-20 flex w-full items-center justify-center bg-primary-norm text-2xl text-secondary transition-colors duration-200 hover:bg-primary-light hover:text-primary-dark focus-visible:ring-2 focus-visible:ring-primary-deep focus-visible:outline-none dark:hover:text-textcolor",
]);

const titleCollapseButtonClass =
    "flex size-10 shrink-0 items-center justify-center rounded-full text-xl leading-none text-secondary transition-colors duration-200 hover:bg-primary-light hover:text-primary-dark focus-visible:ring-2 focus-visible:ring-primary-deep focus-visible:outline-none xl:size-12 xl:text-2xl dark:hover:text-textcolor";

const contentClass = computed(() => [
    "transition-opacity duration-200 ease-out",
    contentVisible.value ? "opacity-100" : "opacity-0",
]);

const titleStyle = computed(() => ({
    "--category-sidebar-title-scale": titleScale.value,
}));

function folderClass(node: ContentNavNode) {
    return [
        "group my-0.5 flex w-full items-stretch text-base focus-visible:ring-2 focus-visible:ring-primary-deep focus-visible:outline-none xl:text-lg",
    ];
}

function folderTextClass(node: ContentNavNode) {
    return [
        "flex min-w-0 flex-1 items-center rounded-l-md px-3 py-2 text-left no-underline transition-[border-radius,color,background-color] duration-200 ease-out group-hover:bg-primary-light group-hover:text-primary-dark dark:group-hover:text-textcolor",
        node.active && "bg-tertiary font-semibold text-primary-dark",
    ];
}

function folderToggleClass(node: ContentNavNode) {
    return [
        "group flex w-10 shrink-0 items-center justify-center rounded-r-md px-3 py-2 text-white/70 transition-[border-radius,color,background-color] duration-200 ease-out hover:bg-primary-light hover:text-primary-dark focus-visible:ring-2 focus-visible:ring-primary-deep focus-visible:outline-none dark:hover:text-textcolor",
        node.active && "bg-tertiary text-primary-dark",
    ];
}

function linkClass(depth: 0 | 1) {
    return [
        "group my-0.5 flex w-full items-stretch text-base focus-visible:ring-2 focus-visible:ring-primary-deep focus-visible:outline-none xl:text-lg",
        depth === 1 && "font-belanosima text-sm text-white/80 xl:text-base",
    ];
}

function linkTextClass(node: ContentNavNode, depth: 0 | 1) {
    return [
        "flex min-w-0 flex-1 items-center justify-start rounded-md px-3 text-left transition-[border-radius,color,background-color] duration-200 ease-out group-hover:bg-primary-light group-hover:text-primary-dark dark:group-hover:text-textcolor",
        depth === 1 ? "h-9 py-0 xl:h-10" : "py-2",
        node.active && "font-semibold text-tertiary",
    ];
}

function activeChildIndex(node: ContentNavNode) {
    return node.children?.findIndex((child) => child.active) ?? -1;
}

function activeChildIndicatorStyle(node: ContentNavNode) {
    return {
        transform: `translateY(calc(${Math.max(activeChildIndex(node), 0)} * (var(--category-sidebar-child-item-height) + var(--category-sidebar-child-item-gap))))`,
    };
}

function updateScrollGradients() {
    const el = contentScroll.value;
    if (!el) return;

    canScrollUp.value = el.scrollTop > 0;
    canScrollDown.value = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
}

function updateTitleScale() {
    const el = titleText.value;
    const container = el?.parentElement;
    if (!el || !container) return;

    titleScale.value = 1;
    requestAnimationFrame(() => {
        const styles = getComputedStyle(container);
        const availableWidth =
            container.clientWidth -
            Number.parseFloat(styles.paddingLeft) -
            Number.parseFloat(styles.paddingRight);
        const textWidth = el.scrollWidth;

        titleScale.value =
            availableWidth > 0 && textWidth > availableWidth
                ? Math.max(0.72, availableWidth / textWidth)
                : 1;
    });
}

function clearContentRevealTimer() {
    if (contentRevealTimer) {
        clearTimeout(contentRevealTimer);
        contentRevealTimer = undefined;
    }
}

function hideContent() {
    clearContentRevealTimer();
    contentVisible.value = false;
    contentRendered.value = false;
}

function revealContentAfterResize() {
    clearContentRevealTimer();
    contentVisible.value = false;
    contentRendered.value = false;

    contentRevealTimer = setTimeout(async () => {
        contentRendered.value = true;
        await nextTick();
        requestAnimationFrame(() => {
            contentVisible.value = true;
            updateScrollGradients();
        });
    }, transitionDuration);
}

function activeExpandedIds(nodes: ContentNavNode[]) {
    const ids: string[] = [];

    for (const node of nodes) {
        if (!node.children?.length) continue;

        const childIds = activeExpandedIds(node.children);
        if (node.active || childIds.length) {
            ids.push(node.id, ...childIds);
        }
    }

    return ids;
}

watch(collapsed, (isCollapsed) => {
    if (isCollapsed) {
        hideContent();
    } else {
        revealContentAfterResize();
    }
});

watch(
    () => [props.nodes, props.activePath] as const,
    async () => {
        expandedItems.value = activeExpandedIds(props.nodes);
        await nextTick();
        updateScrollGradients();
    },
    { immediate: true, deep: true },
);

watch(contentScroll, (newVal) => {
    if (newVal) {
        updateScrollGradients();
    }
});

watch(titleText, (newVal) => {
    titleResizeObserver?.disconnect();

    if (newVal) {
        titleResizeObserver = new ResizeObserver(updateTitleScale);
        titleResizeObserver.observe(newVal);
        titleResizeObserver.observe(newVal.parentElement!);
        updateTitleScale();
    }
});

watch(
    () => props.title,
    async () => {
        await nextTick();
        updateTitleScale();
    },
);

onBeforeUnmount(() => {
    clearContentRevealTimer();
    titleResizeObserver?.disconnect();
});
</script>

<style>
.category-sidebar-scroll {
    direction: rtl;
    scrollbar-color: var(--secondary) transparent;
    scrollbar-width: thin;
}

.category-sidebar-scroll-content {
    direction: ltr;
    --category-sidebar-child-item-height: 2.25rem;
    --category-sidebar-child-item-gap: 0.25rem;
}

.category-sidebar-title {
    display: inline-flex;
    justify-content: center;
    max-width: min(100%, calc(20vw - 4rem));
    overflow: visible;
    font-size: 1.5rem;
    line-height: 1.1;
    text-align: center;
    text-wrap: nowrap;
}

.category-sidebar-title-text {
    display: inline-block;
    transform: scaleX(var(--category-sidebar-title-scale, 1));
    transform-origin: center;
}

@media (width >= 80rem) {
    .category-sidebar-title {
        font-size: 2.25rem;
    }

    .category-sidebar-scroll-content {
        --category-sidebar-child-item-height: 2.5rem;
    }
}

.category-sidebar-scroll::-webkit-scrollbar {
    width: 0.5rem;
}

.category-sidebar-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.category-sidebar-scroll::-webkit-scrollbar-thumb {
    background: var(--secondary);
    border-radius: 9999px;
}

.category-sidebar-scroll::-webkit-scrollbar-thumb:hover {
    background: var(--primary-norm);
}

@keyframes category-sidebar-slide-down {
    from {
        height: 0;
        border-bottom-width: 2px;
    }
    to {
        height: var(--reka-accordion-content-height);
        border-bottom-width: 0px;
    }
}

@keyframes category-sidebar-slide-up {
    from {
        height: var(--reka-accordion-content-height);
        border-bottom-width: 2px;
    }
    to {
        height: 0;
        border-bottom-width: 0px;
    }
}
</style>
