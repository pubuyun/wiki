<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from "vue";
import {
    Position,
    VueFlow,
    type DefaultEdgeOptions,
    type Edge,
    type GraphNode,
    type Node,
    type ViewportTransform,
    type VueFlowStore,
} from "@vue-flow/core";
import ContentGraphPageNode from "./ContentGraphPageNode.vue";
import ContentGraphVirtualLabelNode from "./ContentGraphVirtualLabelNode.vue";
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

type GraphDirection = "top-bottom" | "left-right";

interface GraphNodeData {
    path?: string;
    graph?: string;
    direction?: GraphDirection;
    layout?: GraphDirection;
    layoutPosition?: Point;
    scale?: boolean;
}

interface GraphNodeDefinition {
    id: string;
    label: string;
    type?: "virtual";
    position: Point;
    size?: Size;
    data?: GraphNodeData;
}

interface CrossEdgeDefinition extends Omit<Edge, "source" | "target"> {
    source: string | string[];
    target: string | string[];
}

interface GraphDefinition {
    title?: string;
    height?: number;
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
const flowInstance = shallowRef<VueFlowStore | null>(null);
const figureElement = ref<HTMLElement | null>(null);
const figureWidth = ref(0);
const isPortrait = ref(false);
const mediaReady = ref(false);
const isFullscreen = ref(false);
const viewportZoom = ref(1);
const baseURL = useRuntimeConfig().app.baseURL;
const nodeTypes = {
    page: markRaw(ContentGraphPageNode),
    virtual: markRaw(ContentGraphVirtualNode),
    "virtual-label": markRaw(ContentGraphVirtualLabelNode),
};
const defaultEdgeOptions = {
    style: {
        stroke: "var(--outline)",
        strokeOpacity: 0.8,
        strokeWidth: 2,
    },
} satisfies DefaultEdgeOptions;
const toolbarButtonClass =
    "grid size-8 cursor-pointer place-items-center rounded-lg text-xl leading-none font-[var(--font-main)] text-on-surface hover:bg-primary hover:text-on-primary focus-visible:bg-primary focus-visible:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-outline";
const defaultNodeFontClass =
    "!font-belanosima !text-5xl !leading-[1.15] !text-on-surface";
const maxLabelScale = 2.5;
const defaultNodeMaxWidth = 600;
const defaultNodeLayoutSize: Size = {
    width: defaultNodeMaxWidth,
    height: 100,
};
const topBottomNodeGap = 30;
const leftRightNodeGap = 40;
const topBottomSubgraphPadding = 120;
const subgraphPadding = 30;

let mediaQuery: MediaQueryList | null = null;
let resizeObserver: ResizeObserver | null = null;
let activeMaskElement: HTMLElement | null = null;
let subgraphResizeRun = 0;

onMounted(() => {
    mediaQuery = window.matchMedia("(orientation: portrait)");
    updatePortraitState(mediaQuery);
    mediaReady.value = true;
    mediaQuery.addEventListener("change", updatePortraitState);
    document.addEventListener("fullscreenchange", updateFullscreenState);
});

onBeforeUnmount(() => {
    mediaQuery?.removeEventListener("change", updatePortraitState);
    document.removeEventListener("fullscreenchange", updateFullscreenState);
    resizeObserver?.disconnect();
    clearActiveMask();
});

watch(
    figureElement,
    (element) => {
        resizeObserver?.disconnect();
        resizeObserver = null;
        if (!element) return;

        resizeObserver = new ResizeObserver(([entry]) => {
            if (entry) figureWidth.value = entry.contentRect.width;
        });
        resizeObserver.observe(element);
    },
    { flush: "post" },
);

function updatePortraitState(event: MediaQueryList | MediaQueryListEvent) {
    isPortrait.value = event.matches;
}

function updateActiveMask(event: PointerEvent) {
    const root = event.currentTarget as HTMLElement;
    const isInsidePageNode = Array.from(
        root.querySelectorAll<HTMLElement>(
            ".page-node__button, .content-graph__foreground-control",
        ),
    ).some((element) => {
        const rect = element.getBoundingClientRect();
        return (
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom
        );
    });
    if (isInsidePageNode) {
        clearActiveMask();
        return;
    }

    const candidates = Array.from(
        root.querySelectorAll<HTMLElement>(".graph-node-virtual"),
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

    activeMaskElement?.classList.remove("mask-active");
    next?.classList.add("mask-active");
    activeMaskElement = next;
}

function clearActiveMask() {
    activeMaskElement?.classList.remove("mask-active");
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

const flow = computed(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (!resolvedGraph.value) return { nodes, edges };

    flattenGraph(
        resolvedGraph.value,
        "",
        undefined,
        0,
        "left-right",
        nodes,
        edges,
    );
    return { nodes, edges };
});

function flattenGraph(
    graph: ResolvedGraph,
    prefix: string,
    parentNode: string | undefined,
    depth: number,
    mode: GraphDirection,
    nodes: Node[],
    edges: Edge[],
) {
    const leftToRight = mode === "left-right";
    const visibleNodes = graph.nodes.filter(
        ({ definition, child }) =>
            definition.type !== "virtual" ||
            Boolean(definition.data?.graph && child),
    );
    const visibleNodeIds = new Set(
        visibleNodes.map(({ definition }) => definition.id),
    );
    const topBottomWidth = Math.max(
        ...visibleNodes.map(
            ({ definition }) =>
                definition.size?.width ?? defaultNodeLayoutSize.width,
        ),
        defaultNodeLayoutSize.width,
    );
    let topBottomY = topBottomSubgraphPadding;

    for (const { definition, child } of visibleNodes) {
        const {
            id: localId,
            label,
            position: horizontalPosition,
            size,
            data,
        } = definition;
        const id = `${prefix}${localId}`;
        const renderedSize = size ?? defaultNodeLayoutSize;
        const position = leftToRight
            ? horizontalPosition
            : {
                  x:
                      subgraphPadding +
                      Math.max(0, (topBottomWidth - renderedSize.width) / 2),
                  y: topBottomY,
              };
        if (!leftToRight) {
            topBottomY += renderedSize.height + topBottomNodeGap;
        }
        const renderedType =
            definition.type === "virtual"
                ? "virtual"
                : data?.path
                  ? "page"
                  : undefined;
        const nodeStyle =
            size && renderedType !== "virtual"
                ? {
                      width: `${size.width}px`,
                      height: `${size.height}px`,
                  }
                : size && renderedType === "virtual"
                  ? {
                        minWidth: `${size.width}px`,
                        minHeight: `${size.height}px`,
                    }
                  : renderedType === undefined
                    ? {
                          width: "max-content",
                          maxWidth: `${defaultNodeMaxWidth}px`,
                          height: "auto",
                          whiteSpace: "normal",
                          overflowWrap: "anywhere",
                      }
                    : undefined;
        const renderedClass =
            renderedType === "virtual"
                ? "graph-node-virtual"
                : renderedType === "page"
                  ? "graph-node-page"
                  : ["graph-node-default", defaultNodeFontClass];

        nodes.push({
            id,
            type: renderedType,
            position,
            data: {
                ...data,
                label,
                layout: mode,
                layoutPosition: position,
            },
            style: nodeStyle,
            class: renderedClass,
            parentNode,
            extent: parentNode ? "parent" : undefined,
            draggable: false,
            selectable: false,
            connectable: false,
            sourcePosition: leftToRight ? Position.Right : Position.Bottom,
            targetPosition: leftToRight ? Position.Left : Position.Top,
            zIndex:
                renderedType === "page"
                    ? 100_000 + depth
                    : depth * 10 + (definition.type === "virtual" ? 1 : 2),
        } as Node);

        if (definition.type === "virtual") {
            nodes.push({
                id: `${id}::__title`,
                type: "virtual-label",
                position: { ...position },
                data: {
                    label,
                },
                class: "graph-node-virtual-label",
                parentNode,
                extent: parentNode ? "parent" : undefined,
                draggable: false,
                selectable: false,
                connectable: false,
                zIndex: 100_000 + depth,
            } as Node);
        }

        if (child) {
            const childMode = data?.direction ?? mode;
            flattenGraph(
                child,
                `${id}::`,
                id,
                depth + 1,
                childMode,
                nodes,
                edges,
            );
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

const graphAspectRatio = computed(() => {
    const graph = resolvedGraph.value;
    if (!graph) return 1;

    const visibleNodes = graph.nodes.filter(
        ({ definition, child }) =>
            definition.type !== "virtual" ||
            Boolean(definition.data?.graph && child),
    );
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const { definition } of visibleNodes) {
        const position = definition.position;
        const size = definition.size ?? defaultNodeLayoutSize;
        minX = Math.min(minX, position.x);
        minY = Math.min(minY, position.y);
        maxX = Math.max(maxX, position.x + size.width);
        maxY = Math.max(maxY, position.y + size.height);
    }

    const width = maxX - minX;
    const height = maxY - minY;
    return Number.isFinite(width) && Number.isFinite(height) && height > 0
        ? Math.max(0.1, width / height)
        : 1;
});

const graphHeight = computed(() => {
    const configuredHeight = resolvedGraph.value?.height ?? 560;
    const aspectHeight =
        figureWidth.value > 0
            ? figureWidth.value / graphAspectRatio.value + 80
            : configuredHeight;
    return `${Math.max(180, Math.min(configuredHeight, aspectHeight, 1000))}px`;
});

const canvasStyle = computed(() => ({
    height: `min(${graphHeight.value}, calc(100dvh - var(--content-graph-navigation-height) - 2rem - ${
        resolvedGraph.value?.title ? "3.5rem" : "0rem"
    }))`,
    "--content-graph-label-scale": Math.min(
        maxLabelScale,
        Math.max(1, 0.8 / viewportZoom.value),
    ).toFixed(3),
}));

watch(graphHeight, async () => {
    await nextTick();
    await flowInstance.value?.fitView({ padding: 0.04 });
});

function updateViewport(viewport: ViewportTransform) {
    viewportZoom.value = Math.max(0.05, viewport.zoom);
}

function setFlowInstance(instance: VueFlowStore) {
    flowInstance.value = instance;
    void resizeSubgraphsToContent();
}

function nextAnimationFrame() {
    return new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
    );
}

function getMeasuredNodes(instance: VueFlowStore): GraphNode[] {
    const nodes = instance.getNodes as unknown;
    if (Array.isArray(nodes)) return nodes as GraphNode[];

    return (
        (
            nodes as {
                value?: GraphNode[];
            }
        ).value ?? []
    );
}

function getMeasuredNodeSize(node: GraphNode): Size {
    return {
        width: node.dimensions.width || defaultNodeLayoutSize.width,
        height: node.dimensions.height || defaultNodeLayoutSize.height,
    };
}

function getLayoutPosition(node: GraphNode): Point {
    return (node.data?.layoutPosition as Point | undefined) ?? node.position;
}

function updateMeasuredNodePosition(
    instance: VueFlowStore,
    node: GraphNode,
    position: Point,
) {
    instance.updateNode(node.id, { position });

    if (node.type === "virtual") {
        instance.updateNode(`${node.id}::__title`, { position });
    }
}

function layoutMeasuredNodes(
    instance: VueFlowStore,
    children: GraphNode[],
    layout: GraphDirection,
    insideSubgraph: boolean,
    minimumWidth = 0,
): Size {
    if (layout === "top-bottom") {
        const orderedChildren = [...children].sort(
            (a, b) =>
                getLayoutPosition(a).y - getLayoutPosition(b).y ||
                getLayoutPosition(a).x - getLayoutPosition(b).x,
        );
        const contentWidth = Math.max(
            ...orderedChildren.map((child) => getMeasuredNodeSize(child).width),
        );
        const width = Math.max(
            minimumWidth,
            contentWidth + (insideSubgraph ? subgraphPadding * 2 : 0),
        );
        let y = insideSubgraph
            ? topBottomSubgraphPadding
            : Math.min(
                  ...orderedChildren.map((child) => getLayoutPosition(child).y),
              );

        for (const child of orderedChildren) {
            const childSize = getMeasuredNodeSize(child);
            const position = {
                x: insideSubgraph
                    ? (width - childSize.width) / 2
                    : getLayoutPosition(child).x,
                y,
            };
            updateMeasuredNodePosition(instance, child, position);
            y += childSize.height + topBottomNodeGap;
        }

        return {
            width,
            height:
                y - topBottomNodeGap + (insideSubgraph ? subgraphPadding : 0),
        };
    }

    const orderedChildren = [...children].sort(
        (a, b) =>
            getLayoutPosition(a).x - getLayoutPosition(b).x ||
            getLayoutPosition(a).y - getLayoutPosition(b).y,
    );
    const columns: Array<{ sourceX: number; nodes: GraphNode[] }> = [];

    for (const child of orderedChildren) {
        const previousColumn = columns.at(-1);
        if (
            previousColumn &&
            Math.abs(previousColumn.sourceX - getLayoutPosition(child).x) <= 1
        ) {
            previousColumn.nodes.push(child);
        } else {
            columns.push({
                sourceX: getLayoutPosition(child).x,
                nodes: [child],
            });
        }
    }

    let x = insideSubgraph
        ? subgraphPadding
        : Math.min(
              ...orderedChildren.map((child) => getLayoutPosition(child).x),
          );
    let bottom = 0;

    for (const column of columns) {
        column.nodes.sort(
            (a, b) => getLayoutPosition(a).y - getLayoutPosition(b).y,
        );
        const columnWidth = Math.max(
            ...column.nodes.map((child) => getMeasuredNodeSize(child).width),
        );
        let previousBottom = Number.NEGATIVE_INFINITY;

        for (const child of column.nodes) {
            const childSize = getMeasuredNodeSize(child);
            const minimumY = Number.isFinite(previousBottom)
                ? previousBottom + topBottomNodeGap
                : getLayoutPosition(child).y;
            const y = Math.max(getLayoutPosition(child).y, minimumY);
            const position = {
                x: x + (columnWidth - childSize.width) / 2,
                y,
            };
            updateMeasuredNodePosition(instance, child, position);
            previousBottom = y + childSize.height;
            bottom = Math.max(bottom, previousBottom);
        }

        x += columnWidth + leftRightNodeGap;
    }

    return {
        width: Math.max(
            minimumWidth,
            x - leftRightNodeGap + (insideSubgraph ? subgraphPadding : 0),
        ),
        height: bottom + (insideSubgraph ? subgraphPadding : 0),
    };
}

async function resizeSubgraphsToContent() {
    const run = ++subgraphResizeRun;
    await nextTick();
    await nextAnimationFrame();
    if (run !== subgraphResizeRun) return;

    const instance = flowInstance.value;
    if (!instance) return;

    const virtualNodes = getMeasuredNodes(instance)
        .filter((node) => node.type === "virtual")
        .sort((a, b) => b.id.split("::").length - a.id.split("::").length);

    // Nested parents need multiple measurement passes so each outer layout sees
    // the dimensions calculated for its inner subgraphs.
    const measurementPasses = Math.max(
        3,
        ...virtualNodes.map((node) => node.id.split("::").length + 2),
    );
    for (let pass = 0; pass < measurementPasses; pass += 1) {
        const measuredNodes = getMeasuredNodes(instance);

        for (const parent of virtualNodes) {
            const children = measuredNodes.filter(
                (node) =>
                    node.parentNode === parent.id &&
                    node.type !== "virtual-label",
            );
            if (children.length === 0) continue;

            const layout = children[0]?.data?.layout as
                GraphDirection | undefined;
            const parentStyle =
                typeof parent.style === "object" ? parent.style : {};
            const minimumWidth = Number.parseFloat(
                String(parentStyle.minWidth ?? 0),
            );
            const size = layoutMeasuredNodes(
                instance,
                children,
                layout ?? "left-right",
                true,
                Number.isFinite(minimumWidth) ? minimumWidth : 0,
            );
            instance.updateNode(parent.id, {
                style: {
                    ...parentStyle,
                    width: `${Math.ceil(size.width)}px`,
                    height: `${Math.ceil(size.height)}px`,
                },
            });
        }

        const rootNodes = measuredNodes.filter(
            (node) => !node.parentNode && node.type !== "virtual-label",
        );
        if (rootNodes.length > 0) {
            layoutMeasuredNodes(instance, rootNodes, "left-right", false);
        }

        await nextTick();
        await nextAnimationFrame();
        if (run !== subgraphResizeRun) return;
    }

    await instance.fitView({ padding: 0.04 });
}

function zoomGraphIn() {
    void flowInstance.value?.zoomIn({ duration: 180 });
}

function zoomGraphOut() {
    void flowInstance.value?.zoomOut({ duration: 180 });
}

function resetGraphView() {
    void flowInstance.value?.fitView({ padding: 0.04, duration: 260 });
}

function updateFullscreenState() {
    isFullscreen.value = document.fullscreenElement === figureElement.value;
    void nextTick(() =>
        flowInstance.value?.fitView({ padding: 0.04, duration: 180 }),
    );
}

async function toggleFullscreen() {
    const element = figureElement.value;
    if (!element) return;

    try {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
        } else {
            await element.requestFullscreen();
        }
    } catch (error) {
        console.error("Unable to toggle graph fullscreen mode", error);
    }
}
</script>

<template>
    <figure
        v-if="resolvedGraph && mediaReady && !isPortrait"
        ref="figureElement"
        class="content-graph overflow-hidden rounded-2xl border-2 border-outline bg-surface-elevated text-on-surface shadow-sm [--content-graph-navigation-height:3rem] sm:rounded-3xl sm:[--content-graph-navigation-height:2.5rem] lg:rounded-4xl lg:[--content-graph-navigation-height:2.75rem] xl:[--content-graph-navigation-height:3.5rem] [&_.graph-node-default]:pointer-events-none [&_.graph-node-default]:!bg-secondary [&_.graph-node-default]:text-4xl [&_.graph-node-default]:leading-[1.15] [&_.graph-node-page]:!pointer-events-auto [&_.graph-node-page]:!border-0 [&_.graph-node-page]:!bg-transparent [&_.graph-node-page]:!p-0 [&_.graph-node-page]:!shadow-none [&_.graph-node-virtual]:!pointer-events-auto [&_.graph-node-virtual]:cursor-pointer [&_.graph-node-virtual]:!overflow-visible [&_.graph-node-virtual]:!bg-[color-mix(in_srgb,var(--surface-elevated)_88%,transparent)] [&_.graph-node-virtual]:!p-0 [&_.graph-node-virtual-label]:pointer-events-none [&_.graph-node-virtual-label]:!w-max [&_.graph-node-virtual-label]:!border-0 [&_.graph-node-virtual-label]:!bg-transparent [&_.graph-node-virtual-label]:!p-0 [&_.graph-node-virtual-label]:!shadow-none [&_.graph-node-virtual.mask-active]:!z-[2147483647] [&_.graph-node-virtual.mask-active_.virtual-node\_\_mask]:pointer-events-auto [&_.graph-node-virtual.mask-active_.virtual-node\_\_mask]:opacity-100 [&_.graph-node-virtual:has(.virtual-node\_\_mask:focus-visible)]:!z-[2147483647] [&_.vue-flow\_\_pane]:cursor-grab [&_.vue-flow\_\_pane.dragging]:cursor-grabbing [&_:is(.graph-node-default,.graph-node-virtual)]:!rounded-[0.875rem] [&_:is(.graph-node-default,.graph-node-virtual)]:!border-2 [&_:is(.graph-node-default,.graph-node-virtual)]:!border-outline [&_:is(.graph-node-default,.graph-node-virtual)]:font-[var(--font-main)] [&_:is(.graph-node-default,.graph-node-virtual)]:text-on-secondary [&_:is(.graph-node-default,.graph-node-virtual)]:!shadow-[0_4px_12px_rgb(0_0_0_/_15%)]"
        :class="{
            'flex h-dvh w-dvw max-w-none flex-col rounded-none border-0 bg-surface-elevated':
                isFullscreen,
        }"
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

        <div
            class="content-graph__canvas relative w-full"
            :class="{ '!h-auto min-h-0 flex-1': isFullscreen }"
            :style="canvasStyle"
        >
            <VueFlow
                :nodes="flow.nodes"
                :edges="flow.edges"
                :node-types="nodeTypes"
                :default-edge-options="defaultEdgeOptions"
                :nodes-draggable="false"
                :nodes-connectable="false"
                :elements-selectable="false"
                :edges-updatable="false"
                :connect-on-click="false"
                :min-zoom="0.05"
                :max-zoom="4"
                pan-on-drag
                zoom-on-scroll
                zoom-on-pinch
                zoom-on-double-click
                prevent-scrolling
                @init="setFlowInstance"
                @nodes-initialized="resizeSubgraphsToContent"
                @viewport-change="updateViewport"
            />

            <div
                class="content-graph__foreground-control absolute top-3 right-3 z-20 flex items-center gap-1 rounded-xl border-2 border-outline bg-[color-mix(in_srgb,var(--surface-elevated)_92%,transparent)] p-1 shadow-[0_4px_12px_rgb(0_0_0_/_15%)] backdrop-blur"
                role="toolbar"
                aria-label="Graph view controls"
                @pointerdown.stop
            >
                <button
                    type="button"
                    :class="toolbarButtonClass"
                    aria-label="Zoom in"
                    title="Zoom in"
                    @click="zoomGraphIn"
                >
                    +
                </button>
                <span
                    class="min-w-13 text-center text-xs font-[var(--font-main)] text-on-surface"
                >
                    {{ Math.round(viewportZoom * 100) }}%
                </span>
                <button
                    type="button"
                    :class="toolbarButtonClass"
                    aria-label="Zoom out"
                    title="Zoom out"
                    @click="zoomGraphOut"
                >
                    −
                </button>
                <button
                    type="button"
                    :class="toolbarButtonClass"
                    aria-label="Reset view"
                    title="Reset view"
                    @click="resetGraphView"
                >
                    ↺
                </button>
            </div>

            <button
                type="button"
                class="nodrag nopan content-graph__foreground-control absolute right-3 bottom-3 z-20 grid size-10 cursor-pointer place-items-center rounded-xl border-2 border-outline bg-[color-mix(in_srgb,var(--surface-elevated)_92%,transparent)] text-on-surface shadow-[0_4px_12px_rgb(0_0_0_/_15%)] backdrop-blur hover:bg-primary hover:text-on-primary focus-visible:bg-primary focus-visible:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-outline"
                :aria-label="
                    isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
                "
                :title="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
                @pointerdown.stop
                @click.stop="toggleFullscreen"
            >
                <svg
                    v-if="!isFullscreen"
                    class="size-5 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
                </svg>
                <svg
                    v-else
                    class="size-5 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" />
                </svg>
            </button>
        </div>
    </figure>
</template>
