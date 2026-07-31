<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";

interface VirtualNodeData {
    label?: string;
    path?: string;
    layout?: "left-right" | "top-bottom";
}

const props = defineProps<{
    data: VirtualNodeData;
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
    <div
        class="virtual-node relative h-full min-h-24 w-full min-w-40 touch-manipulation overflow-visible rounded-xl"
        @click.stop="openPage"
    >
        <Handle type="target" :position="targetPosition" :connectable="false" />

        <NuxtLink
            v-if="data.path"
            :to="data.path"
            class="virtual-node__mask pointer-events-none absolute inset-0 z-4 grid place-items-center rounded-[inherit] bg-[color-mix(in_srgb,var(--primary)_62%,transparent)] text-center font-belanosima text-[1.15rem] text-on-primary no-underline opacity-0 transition-opacity duration-150 focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:outline-3 focus-visible:-outline-offset-4 focus-visible:outline-outline"
            draggable="false"
            :aria-label="`Open ${data.label || 'page'}`"
            @click.stop
            @dragstart.prevent
        >
            <span
                class="virtual-node__mask-label inline-block max-w-[calc(100%/var(--content-graph-label-scale,1))] origin-center [transform:scale(var(--content-graph-label-scale,1))] [overflow-wrap:anywhere] whitespace-normal will-change-transform"
            >
                Open {{ data.label }} →
            </span>
        </NuxtLink>

        <Handle type="source" :position="sourcePosition" :connectable="false" />
    </div>
</template>
