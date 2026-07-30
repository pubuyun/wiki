<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from "vue";
import { Position, VueFlow, type Edge, type Node } from "@vue-flow/core";
import ContentGraphVirtualNode from "./ContentGraphVirtualNode.vue";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";

interface Point {
    x: number;
    y: number;
}

interface Size {
    width: number;
    height: number;
}

interface ResponsiveValue<T> {
    horizontal: T;
    vertical: T;
}

interface GraphNodeData {
    label?: string;
    path?: string;
    graph?: string;
    [key: string]: unknown;
}

interface GraphNodeDefinition {
    id: string;
    type?: string;
    position: Point | ResponsiveValue<Point>;
    size?: Size | ResponsiveValue<Size>;
    data?: GraphNodeData;
    [key: string]: unknown;
}

interface CrossEdgeDefinition extends Omit<Edge, "source" | "target"> {
    source: string | string[];
    target: string | string[];
}

interface GraphDefinition {
    title?: string;
    height?: number | ResponsiveValue<number>;
    nodes: GraphNodeDefinition[];
    edges: Edge[];
    crossEdges?: CrossEdgeDefinition[];
}

interface ResolvedNode {
    definition: GraphNodeDefinition;
    child: ResolvedGraph | null;
}

interface ResolvedGraph extends Omit<GraphDefinition, "nodes"> {
    nodes: ResolvedNode[];
}

const props = defineProps<{
    src: string;
}>();

const resolvedGraph = shallowRef<ResolvedGraph | null>(null);
const isVertical = ref(false);
const baseURL = useRuntimeConfig().app.baseURL;
const layoutMode = computed(() =>
    isVertical.value ? "vertical" : "horizontal",
);
const nodeTypes = {
    virtual: markRaw(ContentGraphVirtualNode),
};

let mediaQuery: MediaQueryList | null = null;
let activeMaskElement: HTMLElement | null = null;

onMounted(() => {
    mediaQuery = window.matchMedia("(max-width: 767px)");
    updateLayout(mediaQuery);
    mediaQuery.addEventListener("change", updateLayout);
});

onBeforeUnmount(() => {
    mediaQuery?.removeEventListener("change", updateLayout);
    clearActiveMask();
});

function updateLayout(event: MediaQueryList | MediaQueryListEvent) {
    isVertical.value = event.matches;
}

function updateActiveMask(event: PointerEvent) {
    const root = event.currentTarget as HTMLElement;
    const candidates = Array.from(
        root.querySelectorAll<HTMLElement>(".vue-flow__node-virtual"),
    ).filter((element) => {
        const rect = element.getBoundingClientRect();
        return (
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom
        );
    });
    const next =
        candidates.reduce<HTMLElement | null>((smallest, candidate) => {
            if (!smallest) return candidate;

            const candidateRect = candidate.getBoundingClientRect();
            const smallestRect = smallest.getBoundingClientRect();
            return candidateRect.width * candidateRect.height <=
                smallestRect.width * smallestRect.height
                ? candidate
                : smallest;
        }, null) ?? null;

    if (next === activeMaskElement) return;

    activeMaskElement?.classList.remove("content-graph__mask-active");
    next?.classList.add("content-graph__mask-active");
    activeMaskElement = next;
}

function clearActiveMask() {
    activeMaskElement?.classList.remove("content-graph__mask-active");
    activeMaskElement = null;
}

function publicUrl(src: string) {
    return `${baseURL.replace(/\/$/, "")}/${src.replace(/^\//, "")}`;
}

async function fetchGraph(
    src: string,
    signal: AbortSignal,
    ancestors = new Set<string>(),
    depth = 0,
): Promise<ResolvedGraph | null> {
    if (depth > 8 || ancestors.has(src)) return null;

    const response = await fetch(publicUrl(src), { signal });
    if (!response.ok) return null;

    const value = (await response.json()) as GraphDefinition;
    if (!Array.isArray(value.nodes) || !Array.isArray(value.edges)) {
        return null;
    }

    const nextAncestors = new Set(ancestors).add(src);
    const nodes = await Promise.all(
        value.nodes.map(async (definition) => ({
            definition,
            child:
                definition.type === "virtual" && definition.data?.graph
                    ? await fetchGraph(
                          definition.data.graph,
                          signal,
                          nextAncestors,
                          depth + 1,
                      )
                    : null,
        })),
    );

    return {
        ...value,
        nodes,
    };
}

watch(
    () => props.src,
    async (src, _, onCleanup) => {
        const controller = new AbortController();
        onCleanup(() => controller.abort());
        resolvedGraph.value = null;

        try {
            resolvedGraph.value = await fetchGraph(src, controller.signal);
        } catch (error) {
            if (!(
                error instanceof DOMException && error.name === "AbortError"
            )) {
                console.error(`Unable to load graph from ${src}`, error);
            }
        }
    },
    { immediate: true },
);

function layoutValue<T>(value: T | ResponsiveValue<T> | undefined) {
    if (
        value &&
        typeof value === "object" &&
        "horizontal" in value &&
        "vertical" in value
    ) {
        return value[layoutMode.value];
    }

    return value as T | undefined;
}

const flow = computed(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (!resolvedGraph.value) return { nodes, edges };

    flattenGraph(resolvedGraph.value, "", undefined, 0, nodes, edges);
    return { nodes, edges };
});

function flattenGraph(
    graph: ResolvedGraph,
    prefix: string,
    parentNode: string | undefined,
    depth: number,
    nodes: Node[],
    edges: Edge[],
) {
    const horizontal = layoutMode.value === "horizontal";
    const visibleNodes = graph.nodes.filter(
        ({ definition, child }) =>
            definition.type !== "virtual" ||
            Boolean(definition.data?.graph && child),
    );
    const visibleNodeIds = new Set(
        visibleNodes.map(({ definition }) => definition.id),
    );

    for (const { definition, child } of visibleNodes) {
        const {
            id: localId,
            position: responsivePosition,
            size: responsiveSize,
            data,
            style,
            ...nodeOptions
        } = definition;
        const id = `${prefix}${localId}`;
        const position = layoutValue(responsivePosition) ?? { x: 0, y: 0 };
        const size = layoutValue(responsiveSize);
        const nodeStyle =
            size || (style && typeof style === "object")
                ? {
                      ...(style && typeof style === "object" ? style : {}),
                      ...(size
                          ? {
                                width: `${size.width}px`,
                                height: `${size.height}px`,
                            }
                          : {}),
                  }
                : style;

        nodes.push({
            ...nodeOptions,
            id,
            type: definition.type,
            position,
            data: {
                ...data,
                layout: layoutMode.value,
            },
            style: nodeStyle,
            parentNode,
            extent: parentNode ? "parent" : undefined,
            draggable: false,
            selectable: false,
            connectable: false,
            sourcePosition: horizontal ? Position.Right : Position.Bottom,
            targetPosition: horizontal ? Position.Left : Position.Top,
            zIndex: depth * 10 + (definition.type === "virtual" ? 1 : 2),
        } as Node);

        if (child) {
            flattenGraph(child, `${id}::`, id, depth + 1, nodes, edges);
        }
    }

    for (const edge of graph.edges) {
        if (
            !visibleNodeIds.has(edge.source) ||
            !visibleNodeIds.has(edge.target)
        ) {
            continue;
        }

        edges.push({
            ...edge,
            id: `${prefix}${edge.id}`,
            source: `${prefix}${edge.source}`,
            target: `${prefix}${edge.target}`,
            selectable: false,
            updatable: false,
            zIndex: depth * 10,
        });
    }

    const renderedNodeIds = new Set(nodes.map((node) => node.id));
    for (const edge of graph.crossEdges ?? []) {
        const source = resolveCrossEdgeEndpoint(prefix, edge.source);
        const target = resolveCrossEdgeEndpoint(prefix, edge.target);
        if (!renderedNodeIds.has(source) || !renderedNodeIds.has(target)) {
            continue;
        }

        edges.push({
            ...edge,
            id: `${prefix}${edge.id}`,
            source,
            target,
            selectable: false,
            updatable: false,
            zIndex: depth * 10,
        });
    }
}

function resolveCrossEdgeEndpoint(prefix: string, endpoint: string | string[]) {
    const path = Array.isArray(endpoint) ? endpoint.join("::") : endpoint;
    return `${prefix}${path}`;
}

const graphHeight = computed(() => {
    const height = layoutValue(resolvedGraph.value?.height) ?? 560;
    return `${Math.max(360, Math.min(height, 1000))}px`;
});
</script>

<template>
    <figure
        v-if="resolvedGraph"
        class="content-graph overflow-hidden rounded-2xl border-2 border-outline bg-surface-elevated shadow-sm sm:rounded-3xl lg:rounded-4xl"
        :aria-label="resolvedGraph.title || 'Interactive graph'"
        @pointermove.capture="updateActiveMask"
        @pointerleave="clearActiveMask"
    >
        <figcaption
            v-if="resolvedGraph.title"
            class="border-b-2 border-outline bg-secondary px-4 py-3 font-belanosima text-xl text-on-secondary sm:px-5"
        >
            {{ resolvedGraph.title }}
        </figcaption>

        <div class="content-graph__canvas" :style="{ height: graphHeight }">
            <VueFlow
                :key="layoutMode"
                :nodes="flow.nodes"
                :edges="flow.edges"
                :node-types="nodeTypes"
                :nodes-draggable="false"
                :nodes-connectable="false"
                :elements-selectable="false"
                :edges-updatable="false"
                :connect-on-click="false"
                :min-zoom="0.05"
                :max-zoom="4"
                fit-view-on-init
                pan-on-drag
                zoom-on-scroll
                zoom-on-pinch
                zoom-on-double-click
                prevent-scrolling
            />
        </div>
    </figure>
</template>

<style scoped>
.content-graph {
    color: var(--on-surface);
}

.content-graph__canvas {
    min-height: 22.5rem;
    width: 100%;
}

.content-graph :deep(.vue-flow__pane) {
    cursor: grab;
}

.content-graph :deep(.vue-flow__pane.dragging) {
    cursor: grabbing;
}

.content-graph :deep(.vue-flow__node) {
    border: 2px solid var(--outline);
    border-radius: 0.875rem;
    background: var(--secondary);
    color: var(--on-secondary);
    font-family: var(--font-main);
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

.content-graph :deep(.vue-flow__node-default),
.content-graph :deep(.vue-flow__node-input),
.content-graph :deep(.vue-flow__node-output) {
    pointer-events: none;
}

.content-graph :deep(.vue-flow__node-virtual) {
    padding: 0;
    background: color-mix(in srgb, var(--surface-elevated) 88%, transparent);
    overflow: visible;
    pointer-events: auto !important;
    cursor: pointer;
}

.content-graph :deep(.vue-flow__node-virtual.content-graph__mask-active),
.content-graph
    :deep(.vue-flow__node-virtual:has(.virtual-node__mask:focus-visible)) {
    z-index: 2147483647 !important;
}

.content-graph
    :deep(
        .vue-flow__node-virtual.content-graph__mask-active .virtual-node__mask
    ) {
    opacity: 1;
    pointer-events: auto;
}

.content-graph :deep(.vue-flow__edge-path) {
    stroke: var(--outline);
    stroke-width: 2;
}
</style>
