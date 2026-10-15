<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";

interface VirtualNodeData {
    label?: string;
    path?: string;
    layout?: "left-right" | "top-bottom";
}

const props = defineProps<{
    // Consume Vue Flow's internal ID so it cannot shadow a document anchor.
    id: string;
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
        class="virtual-node relative h-full min-h-24 w-full min-w-40 touch-manipulation overflow-visible rounded-[100px]"
        @click.stop="openPage"
    >
        <Handle type="target" :position="targetPosition" :connectable="false" />

        <NuxtLink
            v-if="data.path"
            :to="data.path"
            class="virtual-node__mask pointer-events-none absolute inset-0 z-4 grid place-items-center rounded-[inherit] text-center font-belanosima text-3xl no-underline opacity-0 transition-opacity duration-150 focus-visible:pointer-events-auto focus-visible:opacity-100"
            draggable="false"
            :aria-label="`Open ${data.label || 'page'}`"
            @click.stop
            @dragstart.prevent
        >
            <span
                class="virtual-node__mask-label inline-block max-w-[90%] [overflow-wrap:anywhere] whitespace-normal"
            >
                Open {{ data.label }} →
            </span>
        </NuxtLink>

        <Handle type="source" :position="sourcePosition" :connectable="false" />
    </div>
</template>

<style scoped>
.virtual-node__mask {
    font-size: var(--graph-page-font-size);
    background: color-mix(in srgb, var(--primary) 78%, transparent);
    color: var(--graph-mask-text);
}

.virtual-node__mask:focus-visible {
    outline: 5px solid var(--graph-highlight);
    outline-offset: -8px;
}

@media (prefers-reduced-motion: reduce) {
    .virtual-node__mask {
        transition: none;
    }
}
</style>
