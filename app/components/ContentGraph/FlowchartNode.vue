<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import type { FlowchartNodeData } from "~/utils/flowchart-layout";

const props = defineProps<{
    data: FlowchartNodeData;
}>();

const shapeClass = computed(() => {
    switch (props.data.kind) {
        case "start":
        case "end":
            return "rounded-full bg-primary text-on-primary";
        case "decision":
            return "flowchart-node__decision bg-surface-bright text-on-surface";
        case "input":
        case "output":
            return "flowchart-node__input-output bg-secondary text-on-secondary";
        case "loop":
            return "flowchart-node__loop bg-primary text-on-primary";
        case "subprocess":
            return "flowchart-node__subprocess bg-secondary text-on-secondary";
        case "document":
            return "flowchart-node__document bg-surface-bright text-on-surface";
        case "database":
            return "flowchart-node__database bg-surface-bright text-on-surface";
        default:
            return "rounded-2xl bg-secondary text-on-secondary";
    }
});
</script>

<template>
    <div class="relative h-full w-full">
        <div
            class="grid h-full w-full place-items-center border-2 border-outline px-5 py-3 text-center font-belanosima text-5xl leading-[1.15] shadow-[0_4px_12px_rgb(0_0_0_/_15%)]"
            :class="shapeClass"
            :aria-label="`${data.kind}: ${data.label}`"
        >
            <span class="max-w-full [overflow-wrap:anywhere]">
                {{ data.label }}
            </span>
        </div>

        <Handle
            id="target-top"
            type="target"
            :position="Position.Top"
            :connectable="false"
            class="flowchart-node__handle"
        />
        <Handle
            id="target-right"
            type="target"
            :position="Position.Right"
            :connectable="false"
            class="flowchart-node__handle"
        />
        <Handle
            id="target-bottom"
            type="target"
            :position="Position.Bottom"
            :connectable="false"
            class="flowchart-node__handle"
        />
        <Handle
            id="target-left"
            type="target"
            :position="Position.Left"
            :connectable="false"
            class="flowchart-node__handle"
        />
        <Handle
            id="source-top"
            type="source"
            :position="Position.Top"
            :connectable="false"
            class="flowchart-node__handle"
        />
        <Handle
            id="source-right"
            type="source"
            :position="Position.Right"
            :connectable="false"
            class="flowchart-node__handle"
        />
        <Handle
            id="source-bottom"
            type="source"
            :position="Position.Bottom"
            :connectable="false"
            class="flowchart-node__handle"
        />
        <Handle
            id="source-left"
            type="source"
            :position="Position.Left"
            :connectable="false"
            class="flowchart-node__handle"
        />
    </div>
</template>

<style scoped>
.flowchart-node__decision {
    clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
    padding-inline: 3rem;
}

.flowchart-node__input-output {
    clip-path: polygon(12% 0, 100% 0, 88% 100%, 0 100%);
    padding-inline: 2.5rem;
}

.flowchart-node__loop {
    clip-path: polygon(12% 0, 88% 0, 100% 50%, 88% 100%, 12% 100%, 0 50%);
    padding-inline: 2.75rem;
}

.flowchart-node__subprocess {
    box-shadow:
        inset 0 0 0 2px var(--outline),
        inset 12px 0 0 -10px var(--outline),
        inset -12px 0 0 -10px var(--outline),
        0 4px 12px rgb(0 0 0 / 15%);
}

.flowchart-node__document {
    clip-path: polygon(
        0 0,
        100% 0,
        100% 82%,
        75% 100%,
        50% 86%,
        25% 100%,
        0 86%
    );
    padding-bottom: 1.5rem;
}

.flowchart-node__database {
    border-radius: 50% / 18%;
}

:deep(.flowchart-node__handle) {
    width: 8px;
    height: 8px;
    border: 2px solid var(--outline);
    background: var(--surface);
    opacity: 0;
}
</style>
