interface GraphLayoutDefinition {
    title?: string;
    height?: number;
    nodes: {
        type?: string;
        position: { x: number; y: number };
        size?: { width: number; height: number };
        data?: { subgraph?: string };
    }[];
}

/** Geometry needed before the interactive graph or its registry has loaded. */
export function contentGraphLayouts(
    graphs: Record<string, GraphLayoutDefinition>,
): Record<string, { maxHeight: number; aspectRatio: number }> {
    return Object.fromEntries(
        Object.entries(graphs).map(([view, graph]) => {
            const nodes = graph.nodes.filter(
                (node) =>
                    node.type !== "virtual" ||
                    Boolean(node.data?.subgraph && graphs[node.data.subgraph]),
            );
            const minX = Math.min(...nodes.map((node) => node.position.x));
            const minY = Math.min(...nodes.map((node) => node.position.y));
            const width =
                Math.max(
                    ...nodes.map(
                        (node) => node.position.x + (node.size?.width ?? 600),
                    ),
                ) - minX;
            const height =
                Math.max(
                    ...nodes.map(
                        (node) => node.position.y + (node.size?.height ?? 100),
                    ),
                ) - minY;
            return [
                view,
                {
                    maxHeight: Math.max(
                        180,
                        Math.min(graph.height ?? 560, 1000),
                    ),
                    aspectRatio:
                        Number.isFinite(width) &&
                        Number.isFinite(height) &&
                        height > 0
                            ? Math.max(0.1, width / height)
                            : 1,
                },
            ];
        }),
    );
}
