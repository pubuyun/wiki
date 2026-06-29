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
            class="icon-section absolute top-0 left-0 z-10 flex shrink-0 items-center gap-4 font-righteous sm:h-8 lg:h-11 xl:h-14"
            aria-label="Go to homepage"
        >
            <BrandIcon />
            <span
                class="text-primary-deep lg:text-2xl xl:text-4xl"
                aria-hidden="true"
            >
                Expelliodor
            </span>
        </NuxtLink>
        <div
            v-if="contentRendered"
            class="absolute top-16 right-4 left-4 z-10 flex h-12 items-center justify-center text-primary-deep lg:text-xl xl:text-3xl"
            :class="contentClass"
        >
            <NuxtLink
                :to="titleTo"
                class="rounded-md px-2 text-center transition-colors hover:text-secondary focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                :aria-label="`Go to ${title}`"
            >
                {{ title }}
            </NuxtLink>
        </div>
        <button
            type="button"
            :class="collapseButtonClass"
            :aria-controls="contentId"
            :aria-expanded="!collapsed"
            :aria-label="
                collapsed
                    ? 'Expand category navigation'
                    : 'Collapse category navigation'
            "
            @click="collapsed = !collapsed"
        >
            <svg
                viewBox="-6 -6 14 12"
                version="1.1"
                id="svg2"
                class="h-5 w-5 transition-transform duration-300"
                :class="collapsed && 'rotate-180'"
                aria-hidden="true"
            >
                <defs id="defs2" />
                <path d="M 8,6 -1,0 8,-6 Z" id="path1" class="fill-tertiary" />
                <path
                    d="M -6,-0.01275599 3.2047333,-6 v 1.1974489 l -7.1592371,4.78979511 7.1592371,4.78979509 v 1.1974488 z"
                    id="path2"
                    class="fill-tertiary"
                />
            </svg>
        </button>

        <div
            v-if="contentRendered"
            :id="contentId"
            ref="contentScroll"
            class="category-sidebar-scroll my-2 max-h-full min-h-0 w-full flex-1 overflow-y-auto"
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
                                    <span
                                        :class="decorationClass(node)"
                                        aria-hidden="true"
                                    />
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
                                <ul
                                    class="ml-4 space-y-1 border-l border-white/25 pl-2"
                                >
                                    <li
                                        v-for="child in node.children"
                                        :key="child.id"
                                    >
                                        <NuxtLink
                                            v-if="child.path"
                                            :to="child.path"
                                            :class="linkClass(1)"
                                        >
                                            <span
                                                :class="decorationClass(child)"
                                                aria-hidden="true"
                                            />
                                            <span :class="linkTextClass(child)">
                                                {{ child.label }}
                                            </span>
                                        </NuxtLink>
                                    </li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        <NuxtLink
                            v-else-if="node.path"
                            :to="node.path"
                            :class="linkClass(0)"
                        >
                            <span
                                :class="decorationClass(node)"
                                aria-hidden="true"
                            />
                            <span :class="linkTextClass(node)">
                                {{ node.label }}
                            </span>
                        </NuxtLink>
                    </li>
                </ul>
            </AccordionRoot>
        </div>

        <div
            v-if="contentVisible && canScrollUp"
            class="pointer-events-none absolute top-30 z-10 h-8 w-full bg-linear-to-b from-primary-norm to-transparent"
        />
        <div
            v-if="contentVisible && canScrollDown"
            class="pointer-events-none absolute bottom-8 z-10 h-8 w-full bg-linear-to-t from-primary-norm to-transparent"
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
const expandedItems = ref<string[]>([]);
const canScrollUp = ref(false);
const canScrollDown = ref(false);
const transitionDuration = 200;
const contentId = "category-sidebar-nav";
let contentRevealTimer: ReturnType<typeof setTimeout> | undefined;

const sidebarClass = computed(() => [
    "sticky top-0 h-screen max-h-screen flex-col overflow-hidden bg-primary-norm font-momo-trust-display shadow-lg transition-[width,height,padding,translate] duration-200 ease-out",
    collapsed.value ? "w-12 py-6" : "w-1/5 pt-30 pb-16",
    "translate-x-0",
]);

const collapseButtonClass = computed(() => [
    "absolute left-0 z-20 flex w-full items-center justify-center bg-primary-dark transition-opacity duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
    collapsed.value ? "top-0 h-full" : "bottom-0 h-10",
]);

const contentClass = computed(() => [
    "transition-opacity duration-200 ease-out",
    contentVisible.value ? "opacity-100" : "opacity-0",
]);

function folderClass(node: ContentNavNode) {
    return [
        "group mx-2 my-0.5 flex w-[calc(100%-1rem)] items-stretch focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none md:text-lg lg:text-xl xl:text-2xl",
        node.active && "text-secondary",
    ];
}

function folderTextClass(node: ContentNavNode) {
    return [
        "flex min-w-0 flex-1 items-center rounded-l-2xl px-4 py-2 text-left no-underline transition-[margin,border-radius,color,background-color] duration-300 ease-out group-hover:bg-primary-light group-hover:text-primary-dark",
        node.active && "rounded-none bg-secondary text-primary-dark",
    ];
}

function folderToggleClass(node: ContentNavNode) {
    return [
        "group flex w-14 shrink-0 items-center justify-center rounded-r-2xl px-4 py-2 transition-[margin,border-radius,color,background-color] duration-300 ease-out hover:bg-secondary hover:text-primary-dark focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none xl:w-16",
        node.active && "-mr-2 rounded-none bg-secondary/85 text-primary-dark",
    ];
}

function linkClass(depth: 0 | 1) {
    return [
        "group mx-2 my-0.5 flex w-[calc(100%-1rem)] items-stretch focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
        depth === 0
            ? "md:text-lg lg:text-xl xl:text-2xl"
            : "font-belanosima md:text-md lg:text-lg xl:text-xl",
    ];
}

function linkTextClass(node: ContentNavNode) {
    return [
        "flex flex-1 items-center justify-start rounded-2xl px-4 py-2 text-left transition-[margin,border-radius,color,background-color] duration-300 ease-out group-hover:bg-primary-light group-hover:text-primary-dark",
        node.active && "-mr-2 rounded-none bg-secondary text-primary-dark",
    ];
}

function decorationClass(node: ContentNavNode) {
    return [
        "w-1 shrink-0 transition-[margin,width,background-color] duration-300 ease-out",
        node.active && "-ml-2 bg-primary-bg",
    ];
}

function updateScrollGradients() {
    const el = contentScroll.value;
    if (!el) return;

    canScrollUp.value = el.scrollTop > 0;
    canScrollDown.value = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
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

onBeforeUnmount(() => {
    clearContentRevealTimer();
});
</script>

<style>
.category-sidebar-scroll {
    direction: rtl;
    scrollbar-color: var(--secondary) var(--primary-dark);
    scrollbar-width: thin;
}

.category-sidebar-scroll-content {
    direction: ltr;
}

.category-sidebar-scroll::-webkit-scrollbar {
    width: 0.5rem;
}

.category-sidebar-scroll::-webkit-scrollbar-track {
    background: var(--primary-dark);
}

.category-sidebar-scroll::-webkit-scrollbar-thumb {
    background: var(--secondary);
}

.category-sidebar-scroll::-webkit-scrollbar-thumb:hover {
    background: var(--tertiary);
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
