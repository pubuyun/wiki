import { MarkerType, Position, type Edge, type Node } from "@vue-flow/core";

export type FlowchartDirection = "top-bottom" | "left-right";
export type FlowchartNodeKind =
    | "start"
    | "end"
    | "process"
    | "decision"
    | "input"
    | "output"
    | "loop"
    | "subprocess"
    | "document"
    | "database";

export interface FlowchartPoint {
    x: number;
    y: number;
}

export interface FlowchartNodeDefinition {
    id: string;
    label?: string;
    type?: FlowchartNodeKind;
    position?: FlowchartPoint;
    width?: number;
    height?: number;
    data?: {
        label?: string;
        kind?: FlowchartNodeKind;
        [key: string]: unknown;
    };
}

export interface FlowchartEdgeDefinition {
    id?: string;
    source: string;
    target: string;
    label?: string;
    type?: "default" | "loop";
    animated?: boolean;
}

export interface FlowchartDefinition {
    direction?: FlowchartDirection;
    height?: number;
    nodes: FlowchartNodeDefinition[];
    edges: FlowchartEdgeDefinition[];
}

export interface FlowchartNodeData {
    label: string;
    kind: FlowchartNodeKind;
    direction: FlowchartDirection;
    [key: string]: unknown;
}

export interface FlowchartLayout {
    nodes: Node[];
    edges: Edge[];
    width: number;
    height: number;
}

interface NodeSize {
    width: number;
    height: number;
}

const nodeKinds = new Set<FlowchartNodeKind>([
    "start",
    "end",
    "process",
    "decision",
    "input",
    "output",
    "loop",
    "subprocess",
    "document",
    "database",
]);

const defaultSizes: Record<FlowchartNodeKind, NodeSize> = {
    start: { width: 600, height: 100 },
    end: { width: 600, height: 100 },
    process: { width: 600, height: 100 },
    decision: { width: 600, height: 100 },
    input: { width: 600, height: 100 },
    output: { width: 600, height: 100 },
    loop: { width: 600, height: 100 },
    subprocess: { width: 600, height: 100 },
    document: { width: 600, height: 100 },
    database: { width: 600, height: 100 },
};

const padding = 72;
const nodeGap = 54;
const rankGap = 96;

export function parseFlowchartDefinition(
    input: unknown,
): FlowchartDefinition | null {
    if (!input || typeof input !== "object") return null;

    const value = input as Record<string, unknown>;
    if (!Array.isArray(value.nodes) || !Array.isArray(value.edges)) return null;

    const seen = new Set<string>();
    const nodes = value.nodes.flatMap((candidate) => {
        if (!candidate || typeof candidate !== "object") return [];

        const node = candidate as Record<string, unknown>;
        const id = typeof node.id === "string" ? node.id.trim() : "";
        if (!id || seen.has(id)) return [];
        seen.add(id);

        const data =
            node.data && typeof node.data === "object"
                ? (node.data as FlowchartNodeDefinition["data"])
                : undefined;
        const type = normalizeNodeKind(node.type ?? data?.kind);
        const label = String(node.label ?? data?.label ?? id);

        return [
            {
                id,
                label,
                type,
                position: normalizePoint(node.position),
                width: normalizeDimension(node.width),
                height: normalizeDimension(node.height),
                data,
            } satisfies FlowchartNodeDefinition,
        ];
    });

    if (!nodes.length) return null;

    const nodeIds = new Set(nodes.map((node) => node.id));
    const edges = value.edges.flatMap((candidate, index) => {
        if (!candidate || typeof candidate !== "object") return [];

        const edge = candidate as Record<string, unknown>;
        const source = typeof edge.source === "string" ? edge.source : "";
        const target = typeof edge.target === "string" ? edge.target : "";
        if (!nodeIds.has(source) || !nodeIds.has(target)) return [];

        return [
            {
                id:
                    typeof edge.id === "string"
                        ? edge.id
                        : `${source}-${target}-${index}`,
                source,
                target,
                label: typeof edge.label === "string" ? edge.label : undefined,
                type: edge.type === "loop" ? "loop" : "default",
                animated: edge.animated === true,
            } satisfies FlowchartEdgeDefinition,
        ];
    });

    return {
        direction:
            value.direction === "top-bottom" ? "top-bottom" : "left-right",
        height: normalizeDimension(value.height),
        nodes,
        edges,
    };
}

export function layoutFlowchart(
    definition: FlowchartDefinition,
): FlowchartLayout {
    const direction = definition.direction ?? "left-right";
    const feedbackEdges = findFeedbackEdges(definition.nodes, definition.edges);
    const ranks = rankNodes(definition.nodes, definition.edges, feedbackEdges);
    const layers = groupByRank(definition.nodes, ranks);
    const sizes = new Map(
        definition.nodes.map((node) => [node.id, getNodeSize(node)]),
    );
    const layerBreadths = layers.map((layer) =>
        layer.reduce(
            (total, node, index) =>
                total +
                crossSize(sizes.get(node.id)!, direction) +
                (index ? nodeGap : 0),
            0,
        ),
    );
    const maxBreadth = Math.max(...layerBreadths, 0);
    const positions = new Map<string, FlowchartPoint>();
    let mainOffset = padding;

    layers.forEach((layer, rank) => {
        const layerMainSize = Math.max(
            ...layer.map((node) => mainSize(sizes.get(node.id)!, direction)),
        );
        let crossOffset = padding + (maxBreadth - layerBreadths[rank]!) / 2;

        for (const node of layer) {
            const size = sizes.get(node.id)!;
            const autoPosition =
                direction === "top-bottom"
                    ? { x: crossOffset, y: mainOffset }
                    : { x: mainOffset, y: crossOffset };
            positions.set(node.id, node.position ?? autoPosition);
            crossOffset += crossSize(size, direction) + nodeGap;
        }

        mainOffset += layerMainSize + rankGap;
    });

    const nodes: Node[] = definition.nodes.map((definitionNode) => {
        const kind = definitionNode.type ?? "process";
        const size = sizes.get(definitionNode.id)!;

        return {
            id: definitionNode.id,
            type: "flowchart",
            position: positions.get(definitionNode.id)!,
            data: {
                ...definitionNode.data,
                label:
                    definitionNode.label ??
                    definitionNode.data?.label ??
                    definitionNode.id,
                kind,
                direction,
            } satisfies FlowchartNodeData,
            style: {
                width: `${size.width}px`,
                height: `${size.height}px`,
            },
            sourcePosition:
                direction === "top-bottom" ? Position.Bottom : Position.Right,
            targetPosition:
                direction === "top-bottom" ? Position.Top : Position.Left,
            draggable: false,
            selectable: false,
            connectable: false,
        } as Node;
    });

    const edges: Edge[] = definition.edges.map((definitionEdge, index) => {
        const id =
            definitionEdge.id ??
            `${definitionEdge.source}-${definitionEdge.target}-${index}`;
        const isLoop = definitionEdge.type === "loop" || feedbackEdges.has(id);

        return {
            id,
            source: definitionEdge.source,
            target: definitionEdge.target,
            sourceHandle: isLoop
                ? direction === "top-bottom"
                    ? "source-right"
                    : "source-bottom"
                : direction === "top-bottom"
                  ? "source-bottom"
                  : "source-right",
            targetHandle: isLoop
                ? direction === "top-bottom"
                    ? "target-right"
                    : "target-bottom"
                : direction === "top-bottom"
                  ? "target-top"
                  : "target-left",
            label: definitionEdge.label,
            type: "smoothstep",
            animated: definitionEdge.animated || isLoop,
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "var(--outline)",
            },
            style: {
                stroke: "var(--outline)",
                strokeWidth: 2.5,
            },
            labelStyle: {
                fill: "var(--on-surface)",
                fontFamily: "var(--font-main)",
                fontSize: 13,
                fontWeight: 600,
            },
            labelBgStyle: {
                fill: "var(--surface)",
                fillOpacity: 0.96,
            },
            labelBgPadding: [6, 4],
            labelBgBorderRadius: 6,
            selectable: false,
            updatable: false,
        } as Edge;
    });

    const bounds = nodes.reduce(
        (result, node) => {
            const size = sizes.get(node.id)!;
            result.width = Math.max(
                result.width,
                node.position.x + size.width + padding,
            );
            result.height = Math.max(
                result.height,
                node.position.y + size.height + padding,
            );
            return result;
        },
        { width: 0, height: 0 },
    );

    return { nodes, edges, ...bounds };
}

function normalizeNodeKind(value: unknown): FlowchartNodeKind {
    return typeof value === "string" &&
        nodeKinds.has(value as FlowchartNodeKind)
        ? (value as FlowchartNodeKind)
        : "process";
}

function normalizePoint(value: unknown): FlowchartPoint | undefined {
    if (!value || typeof value !== "object") return undefined;
    const point = value as Record<string, unknown>;
    return typeof point.x === "number" && typeof point.y === "number"
        ? { x: point.x, y: point.y }
        : undefined;
}

function normalizeDimension(value: unknown) {
    return typeof value === "number" && Number.isFinite(value) && value > 0
        ? value
        : undefined;
}

function getNodeSize(node: FlowchartNodeDefinition): NodeSize {
    const kind = node.type ?? "process";
    const defaults = defaultSizes[kind];
    const width = node.width ?? defaults.width;
    return {
        width,
        height: Math.max(
            node.height ?? defaults.height,
            estimateLabelHeight(
                node.label ?? node.data?.label ?? node.id,
                width,
                kind,
            ),
        ),
    };
}

function estimateLabelHeight(
    label: string,
    width: number,
    kind: FlowchartNodeKind,
) {
    const fontSize = 48;
    const lineHeight = fontSize * 1.15;
    const horizontalPadding = ["decision", "input", "output", "loop"].includes(
        kind,
    )
        ? 120
        : 48;
    const availableWidth = Math.max(80, width - horizontalPadding);
    const lines = label.split("\n").reduce((total, line) => {
        const weightedLength = [...line].reduce(
            (length, character) =>
                length + (/[^\u0000-\u00ff]/.test(character) ? 1 : 0.55),
            0,
        );
        return (
            total +
            Math.max(1, Math.ceil((weightedLength * fontSize) / availableWidth))
        );
    }, 0);

    return Math.ceil(lines * lineHeight + 32);
}

function crossSize(size: NodeSize, direction: FlowchartDirection) {
    return direction === "top-bottom" ? size.width : size.height;
}

function mainSize(size: NodeSize, direction: FlowchartDirection) {
    return direction === "top-bottom" ? size.height : size.width;
}

function findFeedbackEdges(
    nodes: FlowchartNodeDefinition[],
    edges: FlowchartEdgeDefinition[],
) {
    const feedback = new Set<string>();
    const adjacency = new Map<string, FlowchartEdgeDefinition[]>();

    edges.forEach((edge, index) => {
        const id = edge.id ?? `${edge.source}-${edge.target}-${index}`;
        if (edge.type === "loop") {
            feedback.add(id);
            return;
        }
        adjacency.set(edge.source, [
            ...(adjacency.get(edge.source) ?? []),
            edge,
        ]);
    });

    const state = new Map<string, 0 | 1 | 2>();
    const visit = (nodeId: string) => {
        state.set(nodeId, 1);
        for (const [index, edge] of (adjacency.get(nodeId) ?? []).entries()) {
            const edgeId = edge.id ?? `${edge.source}-${edge.target}-${index}`;
            if (state.get(edge.target) === 1) {
                feedback.add(edgeId);
            } else if (!state.get(edge.target)) {
                visit(edge.target);
            }
        }
        state.set(nodeId, 2);
    };

    for (const node of nodes) {
        if (!state.get(node.id)) visit(node.id);
    }

    return feedback;
}

function rankNodes(
    nodes: FlowchartNodeDefinition[],
    edges: FlowchartEdgeDefinition[],
    feedback: Set<string>,
) {
    const ranks = new Map(nodes.map((node) => [node.id, 0]));
    const indegree = new Map(nodes.map((node) => [node.id, 0]));
    const outgoing = new Map<string, FlowchartEdgeDefinition[]>();

    edges.forEach((edge, index) => {
        const id = edge.id ?? `${edge.source}-${edge.target}-${index}`;
        if (feedback.has(id)) return;
        indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
        outgoing.set(edge.source, [...(outgoing.get(edge.source) ?? []), edge]);
    });

    const queue = nodes
        .filter((node) => indegree.get(node.id) === 0)
        .map((node) => node.id);
    const processed = new Set<string>();

    while (queue.length) {
        const source = queue.shift()!;
        processed.add(source);
        for (const edge of outgoing.get(source) ?? []) {
            ranks.set(
                edge.target,
                Math.max(
                    ranks.get(edge.target) ?? 0,
                    (ranks.get(source) ?? 0) + 1,
                ),
            );
            indegree.set(edge.target, (indegree.get(edge.target) ?? 1) - 1);
            if (indegree.get(edge.target) === 0) queue.push(edge.target);
        }
    }

    for (const node of nodes) {
        if (!processed.has(node.id)) {
            ranks.set(node.id, Math.max(...ranks.values(), 0) + 1);
        }
    }

    return ranks;
}

function groupByRank(
    nodes: FlowchartNodeDefinition[],
    ranks: Map<string, number>,
) {
    const layers: FlowchartNodeDefinition[][] = [];
    for (const node of nodes) {
        const rank = ranks.get(node.id) ?? 0;
        (layers[rank] ??= []).push(node);
    }
    return layers.filter(Boolean);
}
