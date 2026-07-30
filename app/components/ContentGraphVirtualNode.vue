<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";

interface VirtualNodeData {
    label?: string;
    path?: string;
    layout?: "horizontal" | "vertical";
}

const props = defineProps<{
    data: VirtualNodeData;
    sourcePosition?: Position;
    targetPosition?: Position;
}>();

const sourcePosition = computed(
    () =>
        props.sourcePosition ??
        (props.data.layout === "vertical" ? Position.Bottom : Position.Right),
);
const targetPosition = computed(
    () =>
        props.targetPosition ??
        (props.data.layout === "vertical" ? Position.Top : Position.Left),
);
</script>

<template>
    <div class="virtual-node">
        <Handle type="target" :position="targetPosition" :connectable="false" />

        <div class="virtual-node__title">
            {{ data.label }}
        </div>

        <NuxtLink
            v-if="data.path"
            :to="data.path"
            class="virtual-node__mask"
            draggable="false"
            :aria-label="`Open ${data.label || 'page'}`"
            @dragstart.prevent
        >
            <span>Open {{ data.label }} →</span>
        </NuxtLink>

        <Handle type="source" :position="sourcePosition" :connectable="false" />
    </div>
</template>

<style scoped>
.virtual-node {
    position: relative;
    width: 100%;
    height: 100%;
    min-width: 10rem;
    min-height: 6rem;
    overflow: hidden;
    border-radius: 0.75rem;
}

.virtual-node__title {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    max-width: calc(100% - 1rem);
    border-radius: 0 0 0.75rem 0;
    background: var(--primary);
    padding: 0.45rem 0.75rem;
    color: var(--on-primary);
    font-family: var(--font-belanosima);
    font-size: 1rem;
    line-height: 1.15;
}

.virtual-node__mask {
    position: absolute;
    inset: 0;
    z-index: 4;
    display: grid;
    place-items: center;
    border-radius: inherit;
    background: color-mix(in srgb, var(--primary) 62%, transparent);
    color: var(--on-primary);
    font-family: var(--font-belanosima);
    font-size: 1.15rem;
    text-align: center;
    text-decoration: none;
    opacity: 0;
    pointer-events: none;
    transition: opacity 160ms ease;
}

.virtual-node__mask:focus-visible {
    opacity: 1;
    pointer-events: auto;
    outline: 3px solid var(--outline);
    outline-offset: -4px;
}
</style>
