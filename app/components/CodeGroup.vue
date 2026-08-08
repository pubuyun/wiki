<script setup lang="ts">
import { Fragment, type VNode, isVNode, reactive, useId } from "vue";
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "reka-ui";
import {
    layoutFlowchart,
    parseFlowchartDefinition,
} from "~/utils/flowchart-layout";

const props = withDefaults(
    defineProps<{
        defaultValue?: string;
        collapsedHeight?: number;
        openText?: string;
        closeText?: string;
        label?: string;
        sync?: string;
    }>(),
    {
        defaultValue: "0",
        collapsedHeight: 320,
        openText: "Expand",
        closeText: "Collapse",
        label: "Code examples",
        sync: undefined,
    },
);

const slots = defineSlots<{
    default(): VNode[];
}>();
const selected = ref(props.defaultValue);
const expanded = reactive<Record<string, boolean>>({});
const expandable = reactive<Record<string, boolean>>({});
const scrolling = reactive<Record<string, boolean>>({});
const scrollEndTimers = new Map<string, ReturnType<typeof setTimeout>>();
const paneElements = new Map<string, HTMLElement>();
let paneResizeObserver: ResizeObserver | undefined;
const groupId = `code-group-${useId().replace(/:/g, "")}`;

function flattenVNodes(value: unknown): VNode[] {
    if (Array.isArray(value)) return value.flatMap(flattenVNodes);
    if (!isVNode(value)) return [];
    if (value.type === Fragment) return flattenVNodes(value.children);
    return [value];
}

const items = computed(() =>
    flattenVNodes(slots.default?.()).map((vnode, index) => {
        const language = String(vnode.props?.language ?? "").toLowerCase();
        const isGraph = ["graph", "vueflow", "vue-flow"].includes(language);
        const isDictionary = language === "dict";
        return {
            isGraph,
            isVisual: isGraph || isDictionary,
            label:
                String(
                    vnode.props?.filename ?? vnode.props?.language ?? "",
                ).trim() || `Code ${index + 1}`,
            vnode,
            value: String(index),
        };
    }),
);

const flowchartHeight = computed(() => {
    const graphItem = items.value.find((item) => item.isGraph);
    const code = graphItem?.vnode.props?.code;
    if (typeof code !== "string") return undefined;

    try {
        const definition = parseFlowchartDefinition(JSON.parse(code));
        if (!definition) return undefined;
        return Math.max(
            320,
            definition.height ?? layoutFlowchart(definition).height,
        );
    } catch {
        return undefined;
    }
});

function isExpanded(value: string) {
    return expanded[value] ?? false;
}

function canExpand(value: string) {
    return expandable[value] ?? false;
}

function isScrolling(value: string) {
    return scrolling[value] ?? false;
}

function hideScrollbar(value: string) {
    scrolling[value] = false;
    const timer = scrollEndTimers.get(value);
    if (timer !== undefined) clearTimeout(timer);
    scrollEndTimers.delete(value);
}

function showScrollbar(value: string) {
    const timer = scrollEndTimers.get(value);
    if (timer !== undefined) clearTimeout(timer);

    scrolling[value] = true;
    scrollEndTimers.set(
        value,
        setTimeout(() => {
            scrolling[value] = false;
            scrollEndTimers.delete(value);
        }, 700),
    );
}

function toggleExpanded(value: string, event: MouseEvent) {
    if (!canExpand(value)) return;

    const trigger =
        event.currentTarget instanceof HTMLElement
            ? event.currentTarget
            : undefined;
    const triggerTop = trigger?.getBoundingClientRect().top;
    const collapsing = isExpanded(value);

    hideScrollbar(value);
    expanded[value] = !collapsing;

    if (!collapsing || !trigger || triggerTop === undefined) return;

    nextTick(() => {
        requestAnimationFrame(() => {
            if (!trigger.isConnected || isExpanded(value)) return;
            const offset = trigger.getBoundingClientRect().top - triggerTop;
            if (Math.abs(offset) > 0.5) window.scrollBy(0, offset);
        });
    });
}

function collapsedPaneHeight() {
    return flowchartHeight.value ?? Math.max(120, props.collapsedHeight);
}

function updateExpandability(value: string) {
    const pane = paneElements.get(value);
    const item = items.value.find((candidate) => candidate.value === value);
    if (!pane || !item || item.isVisual) return;

    const shouldExpand = pane.scrollHeight > collapsedPaneHeight() * 1.5;
    expandable[value] = shouldExpand;
    if (!shouldExpand) {
        expanded[value] = false;
        hideScrollbar(value);
    }
}

function setPaneElement(value: string, element: unknown) {
    const previous = paneElements.get(value);
    if (previous) paneResizeObserver?.unobserve(previous);

    if (!(element instanceof HTMLElement)) {
        paneElements.delete(value);
        return;
    }

    paneElements.set(value, element);
    paneResizeObserver?.observe(element);
    nextTick(() => updateExpandability(value));
}

function scrollCollapsedPane(
    event: WheelEvent,
    item: (typeof items.value)[number],
) {
    if (
        item.isVisual ||
        !canExpand(item.value) ||
        isExpanded(item.value) ||
        !event.ctrlKey
    )
        return;

    const pane = event.currentTarget;
    if (!(pane instanceof HTMLElement)) return;

    event.preventDefault();
    showScrollbar(item.value);
    const multiplier =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
            ? 16
            : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
              ? pane.clientHeight
              : 1;
    pane.scrollTop += event.deltaY * multiplier;
}

function paneStyle(item: (typeof items.value)[number]) {
    if (item.isVisual || !canExpand(item.value) || isExpanded(item.value))
        return undefined;
    return {
        height: `${collapsedPaneHeight()}px`,
    };
}

onMounted(() => {
    paneResizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            const value = entry.target.getAttribute("data-code-group-pane");
            if (value !== null) updateExpandability(value);
        }
    });
    paneElements.forEach((element) => paneResizeObserver?.observe(element));
    nextTick(() =>
        paneElements.forEach((_, value) => updateExpandability(value)),
    );

    if (!props.sync) return;

    const key = `content-code-group-${props.sync}`;
    const saved = localStorage.getItem(key);
    if (saved && items.value.some((item) => item.value === saved)) {
        selected.value = saved;
    }

    watch(selected, (value) => localStorage.setItem(key, value));
});

onBeforeUnmount(() => {
    paneResizeObserver?.disconnect();
    scrollEndTimers.forEach((timer) => clearTimeout(timer));
});
</script>

<template>
    <TabsRoot
        v-model="selected"
        :default-value="props.defaultValue"
        class="my-6 min-w-0 overflow-hidden rounded-xl border-2 border-outline bg-white shadow-sm dark:bg-[#24292e]"
    >
        <TabsList
            class="flex min-w-0 gap-1 overflow-x-auto border-b-2 border-outline bg-secondary p-2 font-belanosima"
            :aria-label="props.label"
        >
            <TabsTrigger
                v-for="item in items"
                :key="item.value"
                :value="item.value"
                class="shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-sm text-on-secondary transition-colors outline-none hover:bg-accent/20 focus-visible:ring-2 focus-visible:ring-outline data-[state=active]:bg-accent data-[state=active]:text-on-accent"
            >
                {{ item.label }}
            </TabsTrigger>
        </TabsList>

        <TabsContent
            v-for="item in items"
            :key="item.value"
            :value="item.value"
            class="min-w-0 outline-none"
            :class="{
                'flex flex-col':
                    !item.isVisual &&
                    canExpand(item.value) &&
                    !isExpanded(item.value),
            }"
            :style="paneStyle(item)"
            :force-mount="true"
            :hidden="selected !== item.value"
        >
            <div
                :ref="(element) => setPaneElement(item.value, element)"
                :id="`${groupId}-${item.value}`"
                :data-code-group-pane="item.value"
                class="relative min-w-0 [&>figure]:my-0 [&>figure]:border-0 [&>pre]:my-0 [&>pre]:rounded-none [&>pre]:shadow-none"
                :class="{
                    'min-h-0 flex-1':
                        !item.isVisual &&
                        canExpand(item.value) &&
                        !isExpanded(item.value),
                    'overflow-y-scroll':
                        !item.isVisual &&
                        canExpand(item.value) &&
                        !isExpanded(item.value) &&
                        isScrolling(item.value),
                    'overflow-hidden':
                        !item.isVisual &&
                        canExpand(item.value) &&
                        !isExpanded(item.value) &&
                        !isScrolling(item.value),
                }"
                @wheel="scrollCollapsedPane($event, item)"
            >
                <span
                    v-if="
                        !item.isVisual &&
                        canExpand(item.value) &&
                        !isExpanded(item.value)
                    "
                    class="pointer-events-none absolute top-2 right-3 z-10 text-xs text-gray-400 select-none dark:text-gray-500"
                    aria-hidden="true"
                >
                    Ctrl + scroll
                </span>
                <component :is="item.vnode" />
            </div>

            <button
                v-if="!item.isVisual && canExpand(item.value)"
                type="button"
                class="group flex w-full cursor-pointer items-center justify-center gap-2 border-t-2 border-outline bg-surface px-4 py-2.5 font-belanosima text-sm text-on-surface transition-colors hover:bg-surface-bright focus-visible:ring-2 focus-visible:ring-outline focus-visible:outline-none focus-visible:ring-inset"
                :aria-controls="`${groupId}-${item.value}`"
                :aria-expanded="isExpanded(item.value)"
                @click="toggleExpanded(item.value, $event)"
            >
                <span>
                    {{
                        isExpanded(item.value)
                            ? props.closeText
                            : props.openText
                    }}
                    {{ item.label }}
                </span>
                <svg
                    viewBox="0 0 20 20"
                    class="size-4 fill-current transition-transform duration-200"
                    :class="{ 'rotate-180': isExpanded(item.value) }"
                    aria-hidden="true"
                >
                    <path
                        d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z"
                    />
                </svg>
            </button>
        </TabsContent>
    </TabsRoot>
</template>
