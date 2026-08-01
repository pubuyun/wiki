<script setup lang="ts">
import { computed, markRaw, nextTick, onBeforeUnmount, ref } from "vue";
import {
    VueFlow,
    type ViewportTransform,
    type VueFlowStore,
} from "@vue-flow/core";
import FlowchartNode from "./FlowchartNode.vue";
import {
    layoutFlowchart,
    parseFlowchartDefinition,
    type FlowchartDefinition,
} from "~/utils/flowchart-layout";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";

const props = defineProps<{
    graph: FlowchartDefinition | string;
}>();

const figureElement = ref<HTMLElement | null>(null);
const flowInstance = shallowRef<VueFlowStore | null>(null);
const viewportZoom = ref(1);
const isFullscreen = ref(false);
const nodeTypes = {
    flowchart: markRaw(FlowchartNode),
};
const toolbarButtonClass =
    "grid size-8 cursor-pointer place-items-center rounded-lg text-xl leading-none font-[var(--font-main)] text-on-surface transition-colors hover:bg-primary hover:text-on-primary focus-visible:bg-primary focus-visible:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-outline";

const definition = computed(() => {
    try {
        const value =
            typeof props.graph === "string"
                ? JSON.parse(props.graph)
                : props.graph;
        return parseFlowchartDefinition(value);
    } catch {
        return null;
    }
});
const layout = computed(() =>
    definition.value ? layoutFlowchart(definition.value) : null,
);
const canvasHeight = computed(() => {
    const configured = definition.value?.height;
    const calculated = layout.value?.height ?? 420;
    return `${Math.max(320, configured ?? calculated)}px`;
});

watch(
    layout,
    async () => {
        await nextTick();
        await flowInstance.value?.fitView({ padding: 0.12 });
    },
    { flush: "post" },
);

onMounted(() => {
    document.addEventListener("fullscreenchange", updateFullscreenState);
});

onBeforeUnmount(() => {
    document.removeEventListener("fullscreenchange", updateFullscreenState);
});

function setFlowInstance(instance: VueFlowStore) {
    flowInstance.value = instance;
    void nextTick(() => instance.fitView({ padding: 0.12 }));
}

function updateViewport(viewport: ViewportTransform) {
    viewportZoom.value = Math.max(0.05, viewport.zoom);
}

function zoomIn() {
    void flowInstance.value?.zoomIn({ duration: 180 });
}

function zoomOut() {
    void flowInstance.value?.zoomOut({ duration: 180 });
}

function fitView() {
    void flowInstance.value?.fitView({ padding: 0.12, duration: 240 });
}

function updateFullscreenState() {
    isFullscreen.value = document.fullscreenElement === figureElement.value;
    void nextTick(() => fitView());
}

async function toggleFullscreen() {
    if (!figureElement.value) return;

    if (document.fullscreenElement) {
        await document.exitFullscreen();
    } else {
        await figureElement.value.requestFullscreen();
    }
}
</script>

<template>
    <figure
        v-if="layout"
        ref="figureElement"
        class="content-flowchart relative my-6 overflow-hidden border-2 border-outline bg-surface-elevated text-on-surface shadow-sm"
        :class="{
            'flex h-dvh w-dvw max-w-none flex-col border-0': isFullscreen,
        }"
        aria-label="Interactive flowchart"
    >
        <div
            class="content-flowchart__canvas relative w-full bg-[radial-gradient(circle,var(--surface-bright)_1px,transparent_1px)] bg-size-[20px_20px]"
            :class="{ '!h-auto min-h-0 flex-1': isFullscreen }"
            :style="{ height: canvasHeight }"
        >
            <VueFlow
                :nodes="layout.nodes"
                :edges="layout.edges"
                :node-types="nodeTypes"
                :nodes-draggable="false"
                :nodes-connectable="false"
                :elements-selectable="false"
                :edges-updatable="false"
                :connect-on-click="false"
                :min-zoom="0.15"
                :max-zoom="3"
                pan-on-drag
                :zoom-on-scroll="false"
                zoom-on-pinch
                zoom-on-double-click
                zoom-activation-key-code="Control"
                :prevent-scrolling="false"
                @init="setFlowInstance"
                @viewport-change="updateViewport"
            />

            <div
                class="nodrag nopan absolute top-3 right-3 z-20 flex items-center gap-1 rounded-xl border-2 border-outline bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-1 shadow-sm backdrop-blur"
                role="toolbar"
                aria-label="Flowchart controls"
                @pointerdown.stop
            >
                <button
                    type="button"
                    :class="toolbarButtonClass"
                    aria-label="Zoom in"
                    @click="zoomIn"
                >
                    +
                </button>
                <span class="min-w-12 text-center text-xs">
                    {{ Math.round(viewportZoom * 100) }}%
                </span>
                <button
                    type="button"
                    :class="toolbarButtonClass"
                    aria-label="Zoom out"
                    @click="zoomOut"
                >
                    −
                </button>
                <button
                    type="button"
                    :class="toolbarButtonClass"
                    aria-label="Fit flowchart"
                    @click="fitView"
                >
                    ↔
                </button>
            </div>

            <button
                type="button"
                class="nodrag nopan absolute right-3 bottom-3 z-20 grid size-10 cursor-pointer place-items-center rounded-xl border-2 border-outline bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] text-on-surface shadow-sm backdrop-blur transition-colors hover:bg-primary hover:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-outline"
                :aria-label="
                    isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
                "
                @pointerdown.stop
                @click.stop="toggleFullscreen"
            >
                <svg
                    class="size-5 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        v-if="!isFullscreen"
                        d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"
                    />
                    <path v-else d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" />
                </svg>
            </button>
        </div>
    </figure>
</template>

<style>
.content-flowchart .vue-flow__edge.animated path {
    stroke-dasharray: 8 6;
}

.content-flowchart .vue-flow__edge-textbg {
    stroke: var(--outline);
    stroke-width: 1px;
}
</style>
