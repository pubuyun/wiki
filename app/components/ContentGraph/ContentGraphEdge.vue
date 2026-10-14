<script setup lang="ts">
import {
    BaseEdge,
    Position,
    getSmoothStepPath,
    useVueFlow,
} from "@vue-flow/core";
import type { CSSProperties } from "vue";

const props = defineProps<{
    id: string;
    source: string;
    target: string;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    sourcePosition: Position;
    targetPosition: Position;
    markerStart?: string;
    markerEnd?: string;
    style?: CSSProperties;
}>();
const { getEdges } = useVueFlow();

const path = computed(() => {
    const horizontal =
        props.sourcePosition === Position.Right &&
        props.targetPosition === Position.Left;
    const vertical =
        props.sourcePosition === Position.Bottom &&
        props.targetPosition === Position.Top;
    const alignedEdges = getEdges.value.filter(
        (edge) =>
            edge.sourceNode.sourcePosition === props.sourcePosition &&
            edge.targetNode.targetPosition === props.targetPosition,
    );
    const outgoing = alignedEdges.filter(
        (edge) => edge.source === props.source,
    );
    const incoming = alignedEdges.filter(
        (edge) => edge.target === props.target,
    );
    // A split shares its outgoing trunk; a merge shares its incoming trunk.
    // Mixing the two sets gives each arm a different junction in a diamond.
    const siblings = outgoing.length > 1 ? outgoing : incoming;
    // All arms of a split or merge use the same trunk, even when their
    // nodes have different widths. Keep the trunk in the gap between nodes.
    const source = Math.max(
        ...siblings.map((edge) => (horizontal ? edge.sourceX : edge.sourceY)),
    );
    const target = Math.min(
        ...siblings.map((edge) => (horizontal ? edge.targetX : edge.targetY)),
    );
    const center =
        siblings.length > 1 && target > source
            ? (source + target) / 2
            : undefined;
    const gap = horizontal
        ? props.targetX - props.sourceX
        : props.targetY - props.sourceY;
    return getSmoothStepPath({
        sourceX: props.sourceX,
        sourceY: props.sourceY,
        targetX: props.targetX,
        targetY: props.targetY,
        sourcePosition: props.sourcePosition,
        targetPosition: props.targetPosition,
        centerX: horizontal ? center : undefined,
        centerY: vertical ? center : undefined,
        offset: gap > 0 ? Math.min(24, gap / 3) : 24,
        borderRadius: 20,
    })[0];
});
</script>

<template>
    <BaseEdge
        :id="id"
        :path="path"
        :style="style"
        :marker-start="markerStart"
        :marker-end="markerEnd"
    />
</template>
