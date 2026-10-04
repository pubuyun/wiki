<script setup lang="ts">
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from "reka-ui";
import { onBeforeUnmount, onMounted, ref, useId } from "vue";

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
const container = ref<HTMLElement | null>(null);
const columns = ref<InstanceType<typeof SplitterPanel>[]>([]);
let manuallyResized = false;
let disposed = false;
let sizingFrame = 0;
let resizeObserver: ResizeObserver | undefined;
let contentObserver: MutationObserver | undefined;

function preserveManualLayout(event: PointerEvent | KeyboardEvent) {
    if (
        event.type === "pointerdown" ||
        (event instanceof KeyboardEvent &&
            ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
    ) {
        manuallyResized = true;
    }
}

function fitColumns() {
    const root = container.value;
    const group = root?.querySelector<HTMLElement>(".panel-layout__group");
    if (!root || !group || manuallyResized) return;
    if (getComputedStyle(group).flexDirection !== "row") return;

    const handle = group.querySelector<HTMLElement>(
        ":scope > .panel-layout__handle--columns",
    );
    const availableWidth = group.clientWidth - (handle?.offsetWidth ?? 0);
    if (availableWidth <= 0) return;
    // Keep both columns readable instead of matching heights with a tiny image.
    const rem = Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize,
    );
    const minimumSize = Math.ceil(
        Math.min(40, Math.max(20, ((16 * rem) / availableWidth) * 100)),
    );

    // Measure copies with the actual fonts, wrapping, captions and image ratios.
    // The live panels never change width while trying candidate layouts.
    const probe = document.createElement("div");
    probe.className = "panel-layout__measurement";
    root.getAttributeNames()
        .filter((name) => name.startsWith("data-v-"))
        .forEach((name) => probe.setAttribute(name, ""));
    probe.inert = true;
    probe.setAttribute("aria-hidden", "true");
    const measuredColumns = sides.map((side) => {
        const column = document.createElement("div");
        const source = document.getElementById(`${layoutId}-${side}`);
        const rowHandle = source?.querySelector<HTMLElement>(
            ":scope > .panel-layout__stack > .panel-layout__handle--rows",
        );
        column.style.paddingBottom = `${rowHandle?.offsetHeight ?? 0}px`;
        source
            ?.querySelectorAll<HTMLElement>(".panel-layout__pane")
            .forEach((pane) => {
                if (pane.closest(".panel-layout") !== root) return;
                const copy = pane.cloneNode(true) as HTMLElement;
                copy.style.height = "auto";
                copy.style.overflow = "visible";
                copy.querySelectorAll("[id]").forEach((el) =>
                    el.removeAttribute("id"),
                );
                const images = pane.querySelectorAll("img");
                copy.querySelectorAll("img").forEach((image, index) => {
                    const original = images[index];
                    if (original?.naturalWidth && original.naturalHeight) {
                        image.style.aspectRatio = `${original.naturalWidth} / ${original.naturalHeight}`;
                    }
                });
                column.append(copy);
            });
        probe.append(column);
        return column;
    });
    root.append(probe);

    let bestSize = 50;
    let bestScore = Infinity;
    try {
        for (let size = minimumSize; size <= 100 - minimumSize; size += 1) {
            measuredColumns[0]!.style.width = `${(availableWidth * size) / 100}px`;
            measuredColumns[1]!.style.width = `${(availableWidth * (100 - size)) / 100}px`;
            const [leftHeight, rightHeight] = measuredColumns.map(
                (column) => column.getBoundingClientRect().height,
            );
            // Prefer matching content heights; break ties with a compact layout.
            const score =
                Math.abs(leftHeight! - rightHeight!) +
                Math.max(leftHeight!, rightHeight!) * 0.15;
            if (score < bestScore) {
                bestScore = score;
                bestSize = size;
            }
        }
    } finally {
        probe.remove();
    }

    const leftPanel = columns.value.find(
        (panel) => panel.$el.id === `${layoutId}-left`,
    );
    if (leftPanel && Math.abs(leftPanel.getSize() - bestSize) >= 1) {
        leftPanel.resize(bestSize);
    }
}

function scheduleSizing() {
    if (disposed || manuallyResized || sizingFrame) return;
    sizingFrame = requestAnimationFrame(() => {
        sizingFrame = 0;
        fitColumns();
    });
}

onMounted(() => {
    const root = container.value;
    if (!root) return;
    let previousWidth = 0;
    resizeObserver = new ResizeObserver(([entry]) => {
        if (!entry || entry.contentRect.width === previousWidth) return;
        previousWidth = entry.contentRect.width;
        scheduleSizing();
    });
    resizeObserver.observe(root);
    contentObserver = new MutationObserver(scheduleSizing);
    root.querySelectorAll(".panel-layout__pane").forEach((pane) => {
        contentObserver?.observe(pane, {
            childList: true,
            subtree: true,
            characterData: true,
        });
    });
    document.fonts.ready.then(scheduleSizing);
    document.fonts.addEventListener("loadingdone", scheduleSizing);
    scheduleSizing();
});

onBeforeUnmount(() => {
    disposed = true;
    cancelAnimationFrame(sizingFrame);
    resizeObserver?.disconnect();
    contentObserver?.disconnect();
    document.fonts.removeEventListener("loadingdone", scheduleSizing);
});
</script>

<template>
    <div
        ref="container"
        class="panel-layout"
        :aria-label="label"
        role="group"
        @load.capture="scheduleSizing"
    >
        <SplitterGroup
            :id="layoutId"
            direction="horizontal"
            class="panel-layout__group"
            :style="{
                height:
                    $slots['left-bottom'] || $slots['right-bottom']
                        ? height
                        : 'auto',
                maxHeight: height,
            }"
        >
            <template v-for="(side, sideIndex) in sides" :key="side">
                <SplitterResizeHandle
                    v-if="sideIndex"
                    :id="`${layoutId}-columns-handle`"
                    class="panel-layout__handle panel-layout__handle--columns"
                    aria-label="Resize left and right panels"
                    @pointerdown="preserveManualLayout"
                    @keydown="preserveManualLayout"
                >
                    <span aria-hidden="true" />
                </SplitterResizeHandle>
                <SplitterPanel
                    ref="columns"
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
    position: relative;
    container-type: inline-size;
    margin-block: 1.5rem;
    min-width: 0;
}

.panel-layout__measurement {
    position: absolute;
    inset: 0 auto auto 0;
    display: flex;
    align-items: flex-start;
    visibility: hidden;
    pointer-events: none;
}

.panel-layout__column,
.panel-layout__row {
    min-width: 0;
    min-height: 0;
}

/* Stretch single panes while letting their content size the horizontal group. */
.panel-layout__column {
    display: flex;
}

.panel-layout__column > .panel-layout__pane {
    flex: 1;
    height: auto;
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

/* Match the image edge to the first text line, allowing for its line spacing. */
.panel-layout__pane :deep(> p:first-child:has(img)) {
    padding-block-start: max(0px, calc((1lh - 1em) / 2));
}

.panel-layout__pane :deep(> :last-child) {
    margin-block-end: 0;
}

.panel-layout__pane :deep(figure),
.panel-layout__pane :deep([role="figure"]) {
    margin-block: 0;
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
        max-height: none !important;
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
