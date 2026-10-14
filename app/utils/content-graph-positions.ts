export interface LayoutNode {
    id: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
}

/** JSON columns are workflow stages; nodes in one column are parallel arms. */
export function positionGraphNodes(
    nodes: LayoutNode[],
    direction: "left-right" | "top-bottom",
    padding = 0,
    contentTop = 0,
    minimumWidth = 0,
    gaps = { stage: 88, branch: 88 },
) {
    const stageGap = gaps.stage;
    const branchGap = gaps.branch;
    const stages: LayoutNode[][] = [];
    for (const node of [...nodes].sort(
        (a, b) => a.position.x - b.position.x || a.position.y - b.position.y,
    )) {
        const previous = stages.at(-1);
        if (
            previous &&
            Math.abs(previous[0]!.position.x - node.position.x) <= 1
        ) {
            previous.push(node);
        } else {
            stages.push([node]);
        }
    }
    const vertical = direction === "top-bottom";
    const stageSizes = stages.map((stage) => ({
        width: vertical
            ? stage.reduce((sum, node) => sum + node.size.width, 0) +
              branchGap * (stage.length - 1)
            : Math.max(...stage.map((node) => node.size.width)),
        height: vertical
            ? Math.max(...stage.map((node) => node.size.height))
            : stage.reduce((sum, node) => sum + node.size.height, 0) +
              branchGap * (stage.length - 1),
    }));
    const contentWidth = vertical
        ? Math.max(0, ...stageSizes.map((size) => size.width))
        : stageSizes.reduce((sum, size) => sum + size.width, 0) +
          stageGap * Math.max(0, stages.length - 1);
    const contentHeight = vertical
        ? stageSizes.reduce((sum, size) => sum + size.height, 0) +
          stageGap * Math.max(0, stages.length - 1)
        : Math.max(0, ...stageSizes.map((size) => size.height));
    const width = Math.max(minimumWidth, contentWidth + padding * 2);
    const positions = new Map<string, { x: number; y: number }>();
    let primary = vertical ? contentTop : (width - contentWidth) / 2;
    stages.forEach((stage, index) => {
        const size = stageSizes[index]!;
        let secondary = vertical
            ? (width - size.width) / 2
            : contentTop + (contentHeight - size.height) / 2;
        for (const node of stage) {
            positions.set(node.id, {
                x: vertical
                    ? secondary
                    : primary + (size.width - node.size.width) / 2,
                y: vertical
                    ? primary + (size.height - node.size.height) / 2
                    : secondary,
            });
            secondary +=
                (vertical ? node.size.width : node.size.height) + branchGap;
        }
        primary += (vertical ? size.height : size.width) + stageGap;
    });
    return { positions, width, height: contentTop + contentHeight + padding };
}
