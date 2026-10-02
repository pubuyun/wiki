<script setup lang="ts">
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from "reka-ui";
import { useId } from "vue";

withDefaults(
    defineProps<{
        height?: string;
        label?: string;
    }>(),
    {
        height: "32rem",
        label: "Panel layout",
    },
);

const layoutId = `panel-layout-${useId()}`;
const sides = ["left", "right"] as const;
</script>

<template>
    <div class="panel-layout" :aria-label="label" role="group">
        <SplitterGroup
            :id="layoutId"
            direction="horizontal"
            class="panel-layout__group"
            :style="{ height }"
        >
            <template v-for="(side, sideIndex) in sides" :key="side">
                <SplitterResizeHandle
                    v-if="sideIndex"
                    :id="`${layoutId}-columns-handle`"
                    class="panel-layout__handle panel-layout__handle--columns"
                    aria-label="Resize left and right panels"
                >
                    <span aria-hidden="true" />
                </SplitterResizeHandle>
                <SplitterPanel
                    :id="`${layoutId}-${side}`"
                    :order="sideIndex"
                    :default-size="50"
                    :min-size="20"
                    class="panel-layout__column"
                >
                    <SplitterGroup
                        v-if="$slots[`${side}-bottom`]"
                        :id="`${layoutId}-${side}-stack`"
                        direction="vertical"
                        class="panel-layout__stack"
                    >
                        <SplitterPanel
                            :id="`${layoutId}-${side}-top`"
                            :order="0"
                            :default-size="50"
                            :min-size="20"
                            class="panel-layout__row"
                        >
                            <div class="panel-layout__pane" :data-slot="side">
                                <slot :name="side" />
                            </div>
                        </SplitterPanel>
                        <SplitterResizeHandle
                            :id="`${layoutId}-${side}-handle`"
                            class="panel-layout__handle panel-layout__handle--rows"
                            :aria-label="`Resize top and bottom ${side} panels`"
                        >
                            <span aria-hidden="true" />
                        </SplitterResizeHandle>
                        <SplitterPanel
                            :id="`${layoutId}-${side}-bottom`"
                            :order="1"
                            :default-size="50"
                            :min-size="20"
                            class="panel-layout__row"
                        >
                            <div
                                class="panel-layout__pane"
                                :data-slot="`${side}-bottom`"
                            >
                                <slot :name="`${side}-bottom`" />
                            </div>
                        </SplitterPanel>
                    </SplitterGroup>
                    <div v-else class="panel-layout__pane" :data-slot="side">
                        <slot :name="side" />
                    </div>
                </SplitterPanel>
            </template>
        </SplitterGroup>
    </div>
</template>

<style scoped>
.panel-layout {
    container-type: inline-size;
    margin-block: 1.5rem;
    min-width: 0;
}

.panel-layout__column,
.panel-layout__row {
    min-width: 0;
    min-height: 0;
}

.panel-layout__pane {
    box-sizing: border-box;
    height: 100%;
    min-width: 0;
    overflow: auto;
    overflow-wrap: anywhere;
    padding: 1rem;
    border-radius: 1rem;
    background: var(--secondary);
}

.panel-layout__pane :deep(> :first-child) {
    margin-block-start: 0;
}

.panel-layout__pane :deep(> :last-child) {
    margin-block-end: 0;
}

.panel-layout__pane :deep(img) {
    max-width: 100%;
    height: auto;
    margin-block: 0;
}

.panel-layout__pane :deep(button:has(> img)) {
    width: 100%;
    max-width: 100%;
    margin-block: 0;
}

.panel-layout__pane :deep(button > img) {
    display: block;
}

.panel-layout__handle {
    display: flex;
    flex: none;
    align-self: stretch;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    touch-action: none;
}

.panel-layout__handle--columns {
    width: 2.5rem;
    cursor: col-resize;
}

.panel-layout__handle--rows {
    height: 2.5rem;
    cursor: row-resize;
}

.panel-layout__handle span {
    background: var(--outline-variant);
    border-radius: 999px;
    opacity: 0.65;
    pointer-events: none;
}

.panel-layout__handle--columns span {
    width: 1px;
    height: 100%;
}

.panel-layout__handle--rows span {
    width: 100%;
    height: 1px;
}

.panel-layout__handle:focus-visible {
    outline: 3px solid var(--outline);
    outline-offset: 2px;
}

.panel-layout__handle:hover span,
.panel-layout__handle:focus-visible span {
    background: var(--outline);
    opacity: 1;
}

/* Let content determine height in narrow containers, including doc sidebars. */
@container (width < 40rem) {
    .panel-layout__group,
    .panel-layout__stack {
        flex-direction: column !important;
        height: auto !important;
        overflow: visible !important;
        gap: 1rem;
    }

    .panel-layout__column,
    .panel-layout__row {
        flex: none !important;
        overflow: visible !important;
    }

    .panel-layout__pane {
        height: auto;
    }

    .panel-layout__handle {
        display: none;
    }
}
</style>
