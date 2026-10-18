<template>
    <nav
        :class="sidebarClass"
        :data-category-sidebar-collapsed="collapsed"
        :aria-label="`${title} documents`"
    >
        <NuxtLink
            v-if="!collapsed"
            :inert="!navigationBarHidden"
            to="/"
            class="icon-section absolute top-0 left-4 z-10 flex h-11 shrink-0 items-center gap-2 font-righteous! xl:h-14 xl:gap-3"
            aria-label="Expelliodor homepage"
        >
            <BrandIcon class="h-9! xl:h-10!" />
            <span
                class="text-lg whitespace-nowrap text-on-surface lg:text-xl xl:text-2xl"
                aria-hidden="true"
            >
                Expelliodor
            </span>
        </NuxtLink>
        <header
            v-if="contentRendered"
            class="mx-6 shrink-0 pb-3 text-on-surface"
            :class="contentClass"
        >
            <h2 class="min-w-0 font-normal">
                <NuxtLink
                    :to="titleTo"
                    class="inline-flex w-full min-w-0 justify-start overflow-visible rounded-md py-0.5 text-left text-2xl leading-tight whitespace-nowrap transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-outline focus-visible:outline-none"
                    :style="titleStyle"
                    :aria-label="`Go to ${title}`"
                    :aria-current="titleTo === activePath ? 'page' : undefined"
                >
                    <span
                        class="inline-block shrink-0 [font-size:calc(1em*var(--category-sidebar-title-font-scale,1))]"
                    >
                        {{ title }}
                    </span>
                    <span
                        ref="titleMeasure"
                        class="pointer-events-none invisible absolute w-max"
                        aria-hidden="true"
                    >
                        {{ title }}
                    </span>
                </NuxtLink>
            </h2>
        </header>

        <div
            v-if="contentRendered"
            class="mt-3 flex min-h-0 w-full flex-1 flex-col"
            :class="contentClass"
        >
            <p
                class="mx-6 mb-1 shrink-0 font-belanosima text-xs leading-5 tracking-wide text-on-surface/70"
            >
                Documents
            </p>
            <div class="relative min-h-0 flex-1">
                <div
                    v-if="contentVisible && canScrollUp"
                    class="pointer-events-none absolute top-0 z-10 h-8 w-full bg-linear-to-b from-surface-sidebar to-transparent"
                />
                <div
                    :id="contentId"
                    ref="contentScroll"
                    class="category-sidebar-scroll h-full max-h-full w-full overflow-y-auto px-3 pb-4"
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
                                    class="overflow-hidden text-on-surface"
                                >
                                    <div class="flex h-min gap-0">
                                        <div :class="folderClass(node)">
                                            <NuxtLink
                                                v-if="node.path"
                                                :to="node.path"
                                                :class="folderTextClass(node)"
                                                :aria-current="
                                                    node.path === activePath
                                                        ? 'page'
                                                        : undefined
                                                "
                                            >
                                                <Icon
                                                    icon="lucide:file-text"
                                                    class="mr-2 size-3.5 shrink-0"
                                                    aria-hidden="true"
                                                />
                                                {{ node.label }}
                                            </NuxtLink>
                                            <span
                                                v-else
                                                :class="folderTextClass(node)"
                                            >
                                                {{ node.label }}
                                            </span>
                                            <AccordionTrigger
                                                :class="folderToggleClass(node)"
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
                                    </div>
                                    <AccordionContent
                                        class="category-sidebar-accordion-content overflow-hidden data-[state=closed]:animate-[category-sidebar-slide-up_200ms_ease-in] data-[state=open]:animate-[category-sidebar-slide-down_200ms_ease-out]"
                                    >
                                        <div class="relative ml-4 pl-2">
                                            <div
                                                class="pointer-events-none absolute top-0 bottom-0 left-0 w-0.5 rounded-full bg-white/25"
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
                                                    <div
                                                        v-if="child.active"
                                                        class="pointer-events-none absolute inset-y-0 -left-2 w-0.5 rounded-full bg-primary"
                                                        aria-hidden="true"
                                                    />
                                                    <NuxtLink
                                                        v-if="child.path"
                                                        :to="child.path"
                                                        :class="linkClass(1)"
                                                        :aria-current="
                                                            child.path ===
                                                            activePath
                                                                ? 'page'
                                                                : undefined
                                                        "
                                                    >
                                                        <span
                                                            :class="
                                                                linkTextClass(
                                                                    child,
                                                                    1,
                                                                )
                                                            "
                                                        >
                                                            <Icon
                                                                icon="lucide:file-text"
                                                                class="mr-2 size-3.5 shrink-0"
                                                                aria-hidden="true"
                                                            />
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
                                    :aria-current="
                                        node.path === activePath
                                            ? 'page'
                                            : undefined
                                    "
                                >
                                    <span :class="linkTextClass(node, 0)">
                                        <Icon
                                            icon="lucide:file-text"
                                            class="mr-2 size-3.5 shrink-0"
                                            aria-hidden="true"
                                        />
                                        {{ node.label }}
                                    </span>
                                </NuxtLink>
                            </li>
                        </ul>
                    </AccordionRoot>
                </div>
                <div
                    v-if="contentVisible && canScrollDown"
                    class="pointer-events-none absolute bottom-0 z-10 h-8 w-full bg-linear-to-t from-surface-sidebar to-transparent"
                />
            </div>
        </div>
        <button
            type="button"
            class="flex w-full shrink-0 cursor-pointer items-center justify-center bg-surface-sidebar text-on-surface/75 transition-colors hover:bg-secondary hover:text-on-secondary focus-visible:ring-2 focus-visible:ring-outline focus-visible:outline-none focus-visible:ring-inset"
            :class="collapsed ? 'h-full' : 'mt-auto h-11'"
            :aria-controls="contentRendered ? contentId : undefined"
            :aria-expanded="!collapsed"
            :aria-label="
                collapsed
                    ? 'Expand category navigation'
                    : 'Collapse category navigation'
            "
            :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
            @click="collapsed = !collapsed"
        >
            <svg
                viewBox="0 0 24 24"
                class="size-5 transition-transform duration-200"
                :class="{ 'rotate-180': collapsed }"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <path d="m11 6-6 6 6 6m8-12-6 6 6 6" />
            </svg>
        </button>
    </nav>
</template>

<script setup lang="ts">
import {
    AccordionContent,
    AccordionItem,
    AccordionRoot,
    AccordionTrigger,
} from "reka-ui";
import type { ContentNavNode } from "~/utils/content-pages";
import { Icon } from "@iconify/vue";

const props = defineProps<{
    title: string;
    titleTo: string;
    nodes: ContentNavNode[];
    activePath: string;
}>();

const dyslexiaMode = useState<boolean>("dyslexia-mode", () => false);
const navigationBarHidden = useState<boolean>(
    "navigation-bar-hidden",
    () => false,
);
const collapsed = useState<boolean>("category-sidebar-collapsed", () => false);
const contentRendered = ref(!collapsed.value);
const contentVisible = ref(!collapsed.value);
const contentScroll = ref<HTMLDivElement | null>(null);
const titleMeasure = ref<HTMLElement | null>(null);
const titleFontScale = ref(1);
const expandedItems = ref<string[]>([]);
const canScrollUp = ref(false);
const canScrollDown = ref(false);
const transitionDuration = 200;
const contentId = "category-sidebar-nav";
let contentRevealTimer: ReturnType<typeof setTimeout> | undefined;
let titleResizeObserver: ResizeObserver | undefined;

const sidebarClass = computed(() => [
    "category-sidebar sticky top-0 h-screen max-h-screen flex-col overflow-hidden bg-surface-sidebar font-momo-trust-display font-normal text-on-surface transition-[width,height,padding,translate] duration-200 ease-out",
    collapsed.value ? "w-12" : "w-66 pt-16 xl:pt-20",
    "translate-x-0",
]);

const contentClass = computed(() => [
    "transition-opacity duration-200 ease-out",
    contentVisible.value ? "opacity-100" : "opacity-0",
]);

const titleStyle = computed(() => ({
    "--category-sidebar-title-font-scale": titleFontScale.value,
}));

function folderClass(node: ContentNavNode) {
    return [
        "group my-0.5 flex w-full items-stretch text-base focus-visible:ring-2 focus-visible:ring-outline focus-visible:outline-none",
    ];
}

function folderTextClass(node: ContentNavNode) {
    return [
        "flex min-w-0 flex-1 items-center rounded-l-md px-3 py-2 text-left no-underline transition-[border-radius,color,background-color] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-outline focus-visible:outline-none",
        node.path === props.activePath ? "font-bold" : "font-normal",
        itemStateClass(node),
    ];
}

function folderToggleClass(node: ContentNavNode) {
    return [
        "group flex w-10 shrink-0 items-center justify-center rounded-r-md px-3 py-2 transition-[border-radius,color,background-color] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-outline focus-visible:outline-none",
        itemStateClass(node),
    ];
}

function linkClass(depth: 0 | 1) {
    return [
        "group my-0.5 flex w-full items-stretch text-base focus-visible:ring-2 focus-visible:ring-outline focus-visible:outline-none",
        depth === 1 && "font-belanosima text-sm xl:text-base",
    ];
}

function linkTextClass(node: ContentNavNode, depth: 0 | 1) {
    return [
        "flex min-w-0 flex-1 items-center justify-start rounded-md px-3 text-left transition-[border-radius,color,background-color] duration-200 ease-out",
        depth === 1 ? "min-h-9 py-2 xl:min-h-10" : "py-2",
        node.path === props.activePath ? "font-bold" : "font-normal",
        itemStateClass(node),
    ];
}

function itemStateClass(node: ContentNavNode) {
    if (node.path === props.activePath) {
        return "bg-[var(--category-sidebar-highlight)] text-[var(--category-sidebar-active-text)] hover:bg-[var(--category-sidebar-highlight-hover)] hover:text-[var(--category-sidebar-active-text)] group-hover:bg-[var(--category-sidebar-highlight-hover)] group-hover:text-[var(--category-sidebar-active-text)]";
    }

    return [
        "hover:bg-[var(--category-sidebar-hover)] hover:text-[var(--category-sidebar-highlight-text)] group-hover:bg-[var(--category-sidebar-hover)] group-hover:text-[var(--category-sidebar-highlight-text)]",
        node.active && "text-[var(--category-sidebar-active-text)]",
    ];
}

function updateScrollGradients() {
    const el = contentScroll.value;
    if (!el) return;

    canScrollUp.value = el.scrollTop > 0;
    canScrollDown.value = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
}

function updateTitleScale() {
    const el = titleMeasure.value;
    const container = el?.parentElement;
    if (!el || !container) return;

    // Measure at the inherited font size without resetting the visible title.
    // Apply the result synchronously so mounts/resizes cannot paint at scale 1.
    const styles = getComputedStyle(container);
    const availableWidth =
        container.clientWidth -
        Number.parseFloat(styles.paddingLeft) -
        Number.parseFloat(styles.paddingRight);
    const textWidth = el.scrollWidth;

    titleFontScale.value =
        availableWidth > 0 && textWidth > availableWidth
            ? Math.max(0.6, availableWidth / textWidth)
            : 1;
}

async function refreshTitleScale() {
    await nextTick();
    updateTitleScale();

    if (dyslexiaMode.value) {
        await document.fonts.load("1em OpenDyslexic", props.title);
    }

    await document.fonts.ready;
    updateTitleScale();
}

function handleFontLoadingDone() {
    updateTitleScale();
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

watch(
    titleMeasure,
    (newVal) => {
        titleResizeObserver?.disconnect();

        if (newVal) {
            titleResizeObserver = new ResizeObserver(updateTitleScale);
            titleResizeObserver.observe(newVal.parentElement!);
            updateTitleScale();
        }
    },
    { flush: "post" },
);

watch(() => props.title, updateTitleScale, { flush: "post" });

watch(dyslexiaMode, () => void refreshTitleScale(), { flush: "post" });

onMounted(() => {
    document.fonts.addEventListener("loadingdone", handleFontLoadingDone);
    void refreshTitleScale();
});

onBeforeUnmount(() => {
    clearContentRevealTimer();
    titleResizeObserver?.disconnect();
    document.fonts.removeEventListener("loadingdone", handleFontLoadingDone);
});
</script>

<style>
.category-sidebar {
    --category-sidebar-highlight: #d5e7f3;
    --category-sidebar-active-text: color-mix(
        in srgb,
        var(--primary) 75%,
        var(--on-surface)
    );
    --category-sidebar-highlight-text: var(--on-surface);
    --category-sidebar-hover: var(--category-sidebar-highlight);
    --category-sidebar-highlight-hover: var(--category-sidebar-hover);
}

.dark .category-sidebar {
    --category-sidebar-highlight: color-mix(
        in srgb,
        var(--surface-sidebar) 78%,
        var(--primary)
    );
    --category-sidebar-highlight-hover: color-mix(
        in srgb,
        var(--surface-sidebar) 74%,
        var(--primary)
    );
    --category-sidebar-active-text: color-mix(
        in srgb,
        var(--on-surface) 60%,
        var(--primary)
    );
    --category-sidebar-highlight-text: var(--on-surface);
    --category-sidebar-hover: color-mix(
        in srgb,
        var(--surface-sidebar) 88%,
        var(--primary)
    );
}

.high-contrast .category-sidebar {
    --category-sidebar-highlight: var(--secondary);
    --category-sidebar-active-text: var(--on-secondary);
    --category-sidebar-highlight-text: var(--on-secondary);
    --category-sidebar-hover: var(--secondary);
    --category-sidebar-highlight-hover: var(--secondary);
}

.category-sidebar-scroll {
    direction: rtl;
    scrollbar-color: var(--secondary) transparent;
    scrollbar-width: thin;
}

.category-sidebar-scroll-content {
    direction: ltr;
    --category-sidebar-child-item-gap: 0.25rem;
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
    background: var(--surface-bright);
}

@keyframes category-sidebar-slide-down {
    from {
        height: 0;
    }
    to {
        height: var(--reka-accordion-content-height);
    }
}

@keyframes category-sidebar-slide-up {
    from {
        height: var(--reka-accordion-content-height);
    }
    to {
        height: 0;
    }
}
</style>
