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
</script>

<template>
    <div class="nodrag nopan page-node pointer-events-auto relative">
        <Handle type="target" :position="targetPosition" :connectable="false" />
        <NuxtLink
            v-if="data.path"
            :to="data.path"
            class="page-node__button block w-max min-w-30 origin-center cursor-pointer touch-manipulation px-[0.9rem] py-[0.6rem] text-center font-belanosima leading-[1.15] transition-[filter] duration-150 hover:brightness-110"
            :class="{
                'page-node__button--scaled': data.scale !== false,
            }"
            :aria-label="`Open ${data.label || 'page'}`"
            @pointerdown.stop
            @click.stop
        >
            {{ data.label }}
        </NuxtLink>
        <span
            v-else
            class="page-node__button block w-max min-w-30 px-7 py-4 text-center font-belanosima leading-[1.2]"
        >
            {{ data.label }}
        </span>
        <Handle type="source" :position="sourcePosition" :connectable="false" />
    </div>
</template>

<style scoped>
.page-node__button {
    border: 2px solid var(--outline);
    border-radius: 40px;
    background: var(--graph-accent);
    color: var(--graph-on-accent);
    text-decoration: none;
    font-size: var(--graph-page-font-size);
    max-width: 700px;
    overflow-wrap: anywhere;
}

/* Keep the text inside the measured box so edges meet its visible border. */
.page-node__button--scaled {
    min-width: 240px;
    max-width: 520px;
    padding: 16px 24px;
}

.page-node__button:focus-visible {
    outline: 5px solid var(--graph-text);
    outline-offset: 8px;
}

@media (prefers-reduced-motion: reduce) {
    .page-node__button {
        transition: none;
    }
}
</style>
