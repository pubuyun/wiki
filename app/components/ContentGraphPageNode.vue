<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";

interface PageNodeData {
    label?: string;
    path?: string;
    layout?: "left-right" | "top-bottom";
    scale?: boolean;
}

const props = defineProps<{
    data: PageNodeData;
    sourcePosition?: Position;
    targetPosition?: Position;
}>();
const sourcePosition = computed(
    () =>
        props.sourcePosition ??
        (props.data.layout === "top-bottom" ? Position.Bottom : Position.Right),
);
const targetPosition = computed(
    () =>
        props.targetPosition ??
        (props.data.layout === "top-bottom" ? Position.Top : Position.Left),
);

function openPage() {
    if (props.data.path) void navigateTo(props.data.path);
}
</script>

<template>
    <div class="nodrag nopan page-node pointer-events-auto relative">
        <Handle type="target" :position="targetPosition" :connectable="false" />
        <button
            type="button"
            class="page-node__button block w-max min-w-30 origin-center cursor-pointer touch-manipulation rounded-[0.875rem] border-2 border-outline bg-primary px-[0.9rem] py-[0.6rem] text-center font-belanosima leading-[1.15] text-on-primary shadow-[0_4px_12px_rgb(0_0_0_/_15%)] transition-[background-color,color,filter] duration-150 hover:bg-secondary hover:text-on-secondary hover:brightness-105 focus-visible:bg-secondary focus-visible:text-on-secondary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-outline focus-visible:brightness-105"
            :class="{
                '[transform:scale(var(--content-graph-label-scale,1))] text-xl will-change-transform':
                    data.scale !== false,
                'text-5xl': data.scale === false,
            }"
            :aria-label="`Open ${data.label || 'page'}`"
            @pointerdown.stop
            @click.prevent.stop="openPage"
        >
            {{ data.label }}
        </button>
        <Handle type="source" :position="sourcePosition" :connectable="false" />
    </div>
</template>
