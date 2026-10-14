<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from "vue";
import {
    MarkerType,
    Position,
    VueFlow,
    type DefaultEdgeOptions,
    type Edge,
    type GraphNode,
    type Node,
    type ViewportTransform,
    type VueFlowStore,
} from "@vue-flow/core";
import { positionGraphNodes } from "~/utils/content-graph-positions";
import { contentGraphTypography } from "~/utils/content-graph-typography";
import ContentGraphPageNode from "./ContentGraphPageNode.vue";
import ContentGraphEdge from "./ContentGraphEdge.vue";
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
    subgraph?: string;
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

interface GraphRegistry {
    version: number;
    graphs: Record<string, GraphDefinition>;
}

interface GraphFrame {
    graph: GraphDefinition;
    prefix: string;
    parentNode: string | undefined;
    depth: number;
    mode: GraphDirection;
    ancestors: Set<string>;
}

const props = defineProps<{
    view: string;
    fullHeight?: boolean;
}>();

// Reuse one registry across page navigation without repeated graph requests.
const graphRegistry = useState<GraphRegistry | null>(
    "content-graph-registry",
    () => null,
);
const resolvedGraph = shallowRef<GraphDefinition | null>(null);
const isLoading = ref(true);
const flowInstance = shallowRef<VueFlowStore | null>(null);
const figureElement = ref<HTMLElement | null>(null);
const fullscreenButton = ref<HTMLButtonElement | null>(null);
const isPortrait = ref(false);
const mediaReady = ref(false);
const isFullscreen = ref(false);
const isScrollSnapActive = ref(false);
const viewportZoom = ref(1);
const isZoomingOut = ref(false);
const frameWidth = ref(0);
const rootFontSize = ref(16);
const bodyFontSize = ref(16);
const typography = computed(() =>
    contentGraphTypography(
        frameWidth.value,
        rootFontSize.value,
        bodyFontSize.value,
    ),
);
const statusMessage = ref("");
const baseURL = useRuntimeConfig().app.baseURL;
const nodeTypes = {
    page: markRaw(ContentGraphPageNode),
    virtual: markRaw(ContentGraphVirtualNode),
    "virtual-label": markRaw(ContentGraphVirtualLabelNode),
};
const defaultEdgeOptions = {
    type: "content-graph",
    style: {
        stroke: "var(--graph-connector)",
        strokeWidth: 6,
    },
} satisfies DefaultEdgeOptions;
const edgeTypes = { "content-graph": markRaw(ContentGraphEdge) };
const toolbarButtonClass =
    "content-graph__tool grid size-10 cursor-pointer place-items-center rounded-full text-xl leading-none font-[var(--font-main)]";
const defaultNodeFontClass = "!font-belanosima !leading-[1.15]";
const defaultNodeMaxWidth = 520;
const defaultNodeLayoutSize: Size = {
    width: defaultNodeMaxWidth,
    height: 100,
};
const graphNodeGap = 88;
const graphVerticalGap = 48;
const topBottomSubgraphPadding = 112;
const subgraphPadding = 32;

let mediaQuery: MediaQueryList | null = null;
let resizeObserver: ResizeObserver | null = null;
let intersectionObserver: IntersectionObserver | null = null;
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
    intersectionObserver?.disconnect();
    clearActiveMask();
});

watch(
    figureElement,
    (element) => {
        resizeObserver?.disconnect();
        resizeObserver = null;
        intersectionObserver?.disconnect();
        intersectionObserver = null;
        isScrollSnapActive.value = false;
        if (!element) return;

        let previousHeight = 0;
        resizeObserver = new ResizeObserver(() => {
            const width = element.clientWidth;
            const height = element.clientHeight;
            const rem =
                Number.parseFloat(
                    getComputedStyle(document.documentElement).fontSize,
                ) || 16;
            const paragraph =
                document.querySelector<HTMLElement>("main p.text-base");
            const bodySize =
                Number.parseFloat(
                    getComputedStyle(paragraph ?? document.body).fontSize,
                ) || rem;
            if (
                !width ||
                !height ||
                (width === frameWidth.value &&
                    height === previousHeight &&
                    rem === rootFontSize.value &&
                    bodySize === bodyFontSize.value)
            )
                return;
            previousHeight = height;
            frameWidth.value = width;
            rootFontSize.value = rem;
            bodyFontSize.value = bodySize;
            void resizeSubgraphsToContent();
        });
        resizeObserver.observe(element);
        resizeObserver.observe(document.documentElement);

        intersectionObserver = new IntersectionObserver(
            ([entry]) => {
                isScrollSnapActive.value =
                    (entry?.intersectionRatio ?? 0) >= 0.7;
            },
            { threshold: [0.95] },
        );
        intersectionObserver.observe(element);
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

async function loadGraphRegistry(signal: AbortSignal): Promise<GraphRegistry> {
    if (graphRegistry.value) return graphRegistry.value;

    const response = await fetch(publicUrl("/content/model/graphs.json"), {
        signal,
    });
    if (!response.ok)
        throw new Error(`Graph registry request failed: ${response.status}`);

    const value = (await response.json()) as GraphRegistry;
    if (
        value.version !== 1 ||
        !value.graphs ||
        typeof value.graphs !== "object"
    ) {
        throw new Error("Invalid graph registry.");
    }
    graphRegistry.value = value;
    return value;
}

watch(
    [() => props.view, mediaReady, isPortrait],
    async ([view, ready, portrait], _, onCleanup) => {
        const controller = new AbortController();
        onCleanup(() => controller.abort());
        resolvedGraph.value = null;
        isLoading.value = true;

        if (!ready || portrait) return;

        try {
            const registry = await loadGraphRegistry(controller.signal);
            if (!controller.signal.aborted) {
                const graph = registry.graphs[view];
                if (
                    !graph ||
                    !Array.isArray(graph.nodes) ||
                    !Array.isArray(graph.edges)
                ) {
                    throw new Error(`Unknown graph view: ${view}`);
                }
                resolvedGraph.value = graph;
            }
        } catch (error) {
            if (!(
                error instanceof DOMException && error.name === "AbortError"
            )) {
                console.error(`Unable to load graph view ${view}`, error);
            }
        } finally {
            if (!controller.signal.aborted) isLoading.value = false;
        }
    },
    { immediate: true },
);

const flow = computed(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (!resolvedGraph.value) return { nodes, edges };

    const frames: GraphFrame[] = [
        {
            graph: resolvedGraph.value,
            prefix: "",
            parentNode: undefined,
            depth: 0,
            mode: "left-right",
            ancestors: new Set([props.view]),
        },
    ];
    const crossEdges: Edge[] = [];

    // Append parents before their children, using a queue instead of recursion.
    for (let index = 0; index < frames.length; index += 1) {
        appendGraphFrame(frames[index]!, nodes, edges, frames, crossEdges);
    }
    const renderedNodeIds = new Set(nodes.map((node) => node.id));
    edges.push(
        ...crossEdges.filter(
            (edge) =>
                renderedNodeIds.has(edge.source) &&
                renderedNodeIds.has(edge.target),
        ),
    );
    return { nodes, edges };
});

function appendGraphFrame(
    { graph, prefix, parentNode, depth, mode, ancestors }: GraphFrame,
    nodes: Node[],
    edges: Edge[],
    frames: GraphFrame[],
    crossEdges: Edge[],
) {
    const leftToRight = mode === "left-right";
    const visibleNodes = graph.nodes.filter(
        (definition) =>
            definition.type !== "virtual" ||
            Boolean(
                definition.data?.subgraph &&
                graphRegistry.value?.graphs[definition.data.subgraph] &&
                !ancestors.has(definition.data.subgraph) &&
                depth < 8,
            ),
    );
    const visibleNodeIds = new Set(
        visibleNodes.map((definition) => definition.id),
    );
    const topBottomWidth = Math.max(
        ...visibleNodes.map(
            (definition) =>
                definition.size?.width ?? defaultNodeLayoutSize.width,
        ),
        defaultNodeLayoutSize.width,
    );
    let topBottomY = topBottomSubgraphPadding;

    for (const definition of visibleNodes) {
        const {
            id: localId,
            label,
            position: horizontalPosition,
            size,
            data,
        } = definition;
        const id = `${prefix}${localId}`;
        const renderedSize = size ?? defaultNodeLayoutSize;
        const isParallelStage = graph.nodes.some(
            (node) =>
                node.id !== localId &&
                Math.abs(node.position.x - horizontalPosition.x) <= 1,
        );
        const position = leftToRight
            ? horizontalPosition
            : {
                  x:
                      subgraphPadding +
                      Math.max(0, (topBottomWidth - renderedSize.width) / 2),
                  y: topBottomY,
              };
        if (!leftToRight) {
            topBottomY += renderedSize.height + graphVerticalGap;
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
                        minWidth: `${Math.min(size.width, 360)}px`,
                        minHeight: `${Math.min(size.height, 240)}px`,
                    }
                  : renderedType === undefined
                    ? {
                          width: "max-content",
                          maxWidth: `${mode === "top-bottom" && !isParallelStage ? 780 : defaultNodeMaxWidth}px`,
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
                layoutPosition: horizontalPosition,
                depth,
            },
            style: {
                ...nodeStyle,
                "--graph-group-fill": `var(--graph-group-${Math.min(depth, 2)})`,
            },
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
                position: { x: position.x + 40, y: position.y + 18 },
                data: {
                    label,
                    depth,
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

        const child = data?.subgraph
            ? graphRegistry.value?.graphs[data.subgraph]
            : undefined;
        if (definition.type === "virtual" && child && data?.subgraph) {
            frames.push({
                graph: child,
                prefix: `${id}::`,
                parentNode: id,
                depth: depth + 1,
                mode: data.direction ?? mode,
                ancestors: new Set([...ancestors, data.subgraph]),
            });
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
            ...getEdgeAppearance(
                depth,
                graph.nodes.find((node) => node.id === edge.target)?.type ===
                    "virtual",
            ),
            ...edge,
            id: `${prefix}${edge.id}`,
            source: `${prefix}${edge.source}`,
            target: `${prefix}${edge.target}`,
            selectable: false,
            updatable: false,
            zIndex: depth * 10,
        });
    }

    for (const edge of graph.crossEdges ?? []) {
        const source = resolveCrossEdgeEndpoint(prefix, edge.source);
        const target = resolveCrossEdgeEndpoint(prefix, edge.target);
        crossEdges.push({
            ...getEdgeAppearance(depth, false),
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

function getEdgeAppearance(depth: number, targetsGroup: boolean) {
    const color = depth === 0 ? "var(--graph-connector)" : "var(--graph-text)";
    return {
        style: { stroke: color, strokeWidth: depth === 0 ? 10 : 5 },
        markerEnd: targetsGroup
            ? undefined
            : {
                  type: MarkerType.ArrowClosed,
                  color,
                  width: 40,
                  height: 40,
                  markerUnits: "userSpaceOnUse",
              },
    };
}

function resolveCrossEdgeEndpoint(prefix: string, endpoint: string | string[]) {
    const path = Array.isArray(endpoint) ? endpoint.join("::") : endpoint;
    return `${prefix}${path}`;
}

const canvasStyle = computed(() => ({
    "--graph-node-font-size": `${typography.value.fontSize}px`,
    "--graph-label-font-size": `${typography.value.fontSize}px`,
    "--graph-page-font-size": `${typography.value.fontSize}px`,
    "--graph-nested-label-scale": typography.value.nestedLabelScale,
}));

async function fitGraphToFrame(duration = 0) {
    await nextTick();
    await nextAnimationFrame();
    await flowInstance.value?.fitView({
        padding: 0.04,
        minZoom: typography.value.minZoom,
        maxZoom: typography.value.minZoom,
        duration,
    });
}

function updateViewport(viewport: ViewportTransform) {
    viewportZoom.value = viewport.zoom;
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
    // A parent can be resized earlier in the same measurement pass, before
    // Vue Flow's ResizeObserver has published its new dimensions.
    const style = typeof node.style === "object" ? node.style : {};
    const width = Number.parseFloat(String(style.width ?? ""));
    const height = Number.parseFloat(String(style.height ?? ""));
    return {
        width: width || node.dimensions.width || defaultNodeLayoutSize.width,
        height:
            height || node.dimensions.height || defaultNodeLayoutSize.height,
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
        instance.updateNode(`${node.id}::__title`, {
            position: { x: position.x + 40, y: position.y + 18 },
        });
    }
}

function layoutMeasuredNodes(
    instance: VueFlowStore,
    children: GraphNode[],
    layout: GraphDirection,
    insideSubgraph: boolean,
    minimumWidth = 0,
    contentTop = topBottomSubgraphPadding,
): Size {
    const result = positionGraphNodes(
        children.map((child) => ({
            id: child.id,
            position: getLayoutPosition(child),
            size: getMeasuredNodeSize(child),
        })),
        layout,
        insideSubgraph ? subgraphPadding : 0,
        insideSubgraph ? contentTop : 0,
        minimumWidth,
        {
            stage: layout === "top-bottom" ? graphVerticalGap : graphNodeGap,
            branch: layout === "left-right" ? graphVerticalGap : graphNodeGap,
        },
    );
    for (const child of children) {
        updateMeasuredNodePosition(
            instance,
            child,
            result.positions.get(child.id)!,
        );
    }
    return { width: result.width, height: result.height };
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
            // Recompute from content so an earlier layout cannot retain empty space.
            const minimumWidth =
                Number.parseFloat(String(parentStyle.minWidth ?? 0)) || 0;
            const size = layoutMeasuredNodes(
                instance,
                children,
                layout ?? "left-right",
                true,
                Number.isFinite(minimumWidth) ? minimumWidth : 0,
                Math.max(
                    topBottomSubgraphPadding,
                    (measuredNodes.find(
                        (node) => node.id === `${parent.id}::__title`,
                    )?.dimensions.height ?? 0) + 30,
                ),
            );
            instance.updateNode(`${parent.id}::__title`, {
                style: { maxWidth: `${Math.max(160, size.width - 80)}px` },
            });
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

    await fitGraphToFrame();
}

function zoomGraphIn() {
    void flowInstance.value?.zoomIn({ duration: 180 });
    statusMessage.value = "Graph zoomed in";
}

async function zoomGraphOut() {
    const instance = flowInstance.value;
    const canvas = figureElement.value?.querySelector(".content-graph__canvas");
    if (!instance || !canvas || isZoomingOut.value) return;
    const nodes = Array.from(canvas.querySelectorAll(".vue-flow__node"));
    if (!nodes.length) return;

    const frame = canvas.getBoundingClientRect();
    const rects = nodes.map((node) => node.getBoundingClientRect());
    const left = Math.min(...rects.map((rect) => rect.left));
    const right = Math.max(...rects.map((rect) => rect.right));
    const top = Math.min(...rects.map((rect) => rect.top));
    const bottom = Math.max(...rects.map((rect) => rect.bottom));
    if (
        left >= frame.left - 1 &&
        right <= frame.right + 1 &&
        top >= frame.top - 1 &&
        bottom <= frame.bottom + 1
    ) {
        statusMessage.value = "The entire graph is already visible";
        return;
    }

    const zoom = instance.getViewport().zoom;
    const fitZoom =
        zoom *
        Math.min(
            frame.width / ((right - left) * 1.08),
            frame.height / ((bottom - top) * 1.08),
        );
    // Manual zoom can go below body size, but stops once the graph fits.
    const nextZoom = Math.min(zoom, Math.max(0.01, zoom / 1.2, fitZoom));
    isZoomingOut.value = true;
    try {
        await instance.fitView({
            minZoom: nextZoom,
            maxZoom: nextZoom,
            padding: 0.04,
            duration: 180,
        });
        statusMessage.value = "Graph zoomed out";
    } finally {
        isZoomingOut.value = false;
    }
}

function resetGraphView() {
    void fitGraphToFrame(260);
    statusMessage.value = "Graph view reset";
}

function updateFullscreenState() {
    isFullscreen.value = document.fullscreenElement === figureElement.value;
    statusMessage.value = isFullscreen.value
        ? "Graph entered fullscreen"
        : "Graph exited fullscreen";
    void nextTick(() => fullscreenButton.value?.focus());
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
        ref="figureElement"
        class="content-graph overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-4xl"
        :class="{
            'content-graph--full-height': fullHeight,
            'flex h-dvh w-dvw max-w-none flex-col rounded-none border-0':
                isFullscreen,
            'content-graph--snap-active': isScrollSnapActive,
        }"
        :aria-label="resolvedGraph?.title || 'Interactive graph'"
        :aria-busy="isLoading"
        @pointermove.capture="updateActiveMask"
        @pointerleave="clearActiveMask"
    >
        <figcaption
            class="content-graph__caption h-14 shrink-0 truncate px-5 py-3 font-belanosima text-xl sm:px-6"
        >
            {{ resolvedGraph?.title || "Interactive graph" }}
        </figcaption>

        <div
            class="content-graph__canvas relative min-h-0 w-full flex-1"
            :class="{
                '!h-auto min-h-0 flex-1': isFullscreen,
                'flex-1': fullHeight,
            }"
            :style="canvasStyle"
        >
            <div
                v-if="isLoading"
                class="absolute inset-0 grid place-items-center text-sm text-on-surface"
                role="status"
            >
                Loading graph...
            </div>

            <VueFlow
                v-else-if="resolvedGraph"
                :nodes="flow.nodes"
                :edges="flow.edges"
                :node-types="nodeTypes"
                :edge-types="edgeTypes"
                :default-edge-options="defaultEdgeOptions"
                :nodes-draggable="false"
                :nodes-connectable="false"
                :elements-selectable="false"
                :nodes-focusable="false"
                :edges-focusable="false"
                :edges-updatable="false"
                :connect-on-click="false"
                :min-zoom="0.01"
                :max-zoom="4"
                pan-on-drag
                :zoom-on-scroll="false"
                zoom-on-pinch
                zoom-on-double-click
                zoom-activation-key-code="Control"
                :prevent-scrolling="false"
                @init="setFlowInstance"
                @nodes-initialized="resizeSubgraphsToContent"
                @viewport-change="updateViewport"
            />

            <div
                v-if="resolvedGraph"
                class="content-graph__toolbar content-graph__foreground-control absolute top-3 right-3 z-20 flex items-center gap-1 rounded-full p-1"
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
                    class="min-w-12 text-center text-sm font-[var(--font-main)]"
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
                ref="fullscreenButton"
                v-if="resolvedGraph"
                type="button"
                class="nodrag nopan content-graph__fullscreen content-graph__foreground-control absolute right-3 bottom-3 z-20 grid size-10 cursor-pointer place-items-center rounded-full"
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
        <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {{ statusMessage }}
        </p>
    </figure>
</template>

<style scoped>
.content-graph {
    --graph-canvas: var(--surface);
    --graph-group-0: #d2e6f7;
    --graph-group-1: #eff7ff;
    --graph-group-2: #e2f0fc;
    --graph-title: #2b6cbf;
    --graph-title-nested: #c1dcf4;
    --graph-title-text: #ffffff;
    --graph-title-nested-text: #173d62;
    --graph-text: #173d62;
    --graph-connector: #58798c;
    --graph-accent: var(--accent);
    --graph-on-accent: var(--on-accent);
    --graph-mask-text: #082033;
    --graph-highlight: var(--primary);
    --graph-node-font-size: 80px;
    --graph-label-font-size: 80px;
    --graph-page-font-size: 80px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--graph-canvas);
    color: var(--graph-text);
    border: 2px solid var(--outline);
}

.content-graph__caption {
    color: var(--graph-text);
    border-bottom: 2px solid var(--outline);
}

.content-graph__toolbar {
    background: var(--graph-group-0);
    color: var(--graph-text);
    border: 2px solid var(--outline);
}

.content-graph__tool:hover {
    background: var(--graph-title);
}

.content-graph__fullscreen {
    background: var(--graph-accent);
    color: var(--graph-on-accent);
    border: 2px solid var(--outline);
}

.content-graph__fullscreen:hover {
    filter: brightness(1.08);
}

.content-graph__tool:focus-visible,
.content-graph__fullscreen:focus-visible {
    outline: 3px solid var(--graph-text);
    outline-offset: 3px;
}

.content-graph :deep(.graph-node-default) {
    font-size: var(--graph-node-font-size);
    pointer-events: none;
    padding: 12px 16px;
    border: 2px solid var(--outline);
    border-radius: 14px;
    background: transparent;
    color: var(--graph-text);
    box-shadow: none;
}

.content-graph :deep(.graph-node-virtual) {
    pointer-events: auto;
    cursor: pointer;
    overflow: visible;
    padding: 0;
    border: 2px solid var(--outline);
    border-radius: 100px;
    background: var(--graph-group-fill);
    box-shadow: none;
}

.content-graph :deep(.graph-node-page),
.content-graph :deep(.graph-node-virtual-label) {
    padding: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
}

.content-graph :deep(.graph-node-page) {
    pointer-events: auto;
}

.content-graph :deep(.graph-node-virtual-label) {
    pointer-events: none;
    width: max-content;
}

.content-graph :deep(.graph-node-virtual.mask-active),
.content-graph
    :deep(.graph-node-virtual:has(.virtual-node__mask:focus-visible)) {
    z-index: 2147483647 !important;
    /* The group is above its sibling child nodes while the mask is active.
       Its solid fill must not hide them beneath the translucent overlay. */
    background: transparent;
}

.content-graph :deep(.graph-node-virtual.mask-active .virtual-node__mask) {
    pointer-events: auto;
    opacity: 1;
}

.content-graph :deep(.vue-flow__handle) {
    width: 2px;
    height: 2px;
    min-width: 2px;
    min-height: 2px;
    border: 0;
    background: transparent;
}

.content-graph :deep(.vue-flow__edge-path) {
    stroke-linecap: round;
    stroke-linejoin: round;
}

.content-graph :deep(.vue-flow__pane) {
    cursor: grab;
}

.content-graph :deep(.vue-flow__pane.dragging) {
    cursor: grabbing;
}

:global(.dark .content-graph) {
    --graph-canvas: var(--surface);
    --graph-group-0: #104795;
    --graph-group-1: #2e6dbf;
    --graph-group-2: #2f73c8;
    --graph-title: #2f73c8;
    --graph-title-nested: #104795;
    --graph-title-text: #f8ffff;
    --graph-title-nested-text: #f8ffff;
    --graph-text: #f8ffff;
    --graph-connector: #4b8fe3;
    --graph-mask-text: var(--on-primary);
}

:global(.high-contrast .content-graph) {
    --graph-canvas: var(--surface);
    --graph-group-0: var(--surface);
    --graph-group-1: var(--surface);
    --graph-group-2: var(--surface);
    --graph-title: var(--primary);
    --graph-title-nested: var(--primary);
    --graph-title-text: var(--on-primary);
    --graph-title-nested-text: var(--on-primary);
    --graph-text: var(--on-surface);
    --graph-connector: var(--outline);
    --graph-accent: var(--accent);
    --graph-on-accent: var(--on-accent);
    --graph-mask-text: var(--on-primary);
    --graph-highlight: var(--on-surface);
}

:global(.high-contrast .content-graph .graph-node-virtual) {
    border: 3px solid var(--outline);
}

.content-graph--full-height:not(:fullscreen) {
    height: calc(100dvh - 5rem);
}

.content-graph:fullscreen {
    border-radius: 0;
    border: 0;
}

@media (orientation: portrait) {
    .content-graph:not(:fullscreen) {
        display: none;
    }
}

:global(html:has(.content-graph)) {
    --content-graph-page-navigation-height: 3rem;

    scroll-padding-block-start: var(--content-graph-page-navigation-height);
    scroll-snap-type: y proximity;
}

:global(.content-graph.content-graph--snap-active) {
    scroll-snap-align: center;
}

@media (width >= 40rem) {
    :global(html:has(.content-graph)) {
        --content-graph-page-navigation-height: 2.5rem;
    }
}

@media (width >= 64rem) {
    :global(html:has(.content-graph)) {
        --content-graph-page-navigation-height: 2.75rem;
    }
}

@media (width >= 80rem) {
    :global(html:has(.content-graph)) {
        --content-graph-page-navigation-height: 3.5rem;
    }
}
</style>
