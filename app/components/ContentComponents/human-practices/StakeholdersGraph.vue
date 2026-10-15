<script setup lang="ts">
import { Icon } from "@iconify/vue";
import {
    PopoverRoot,
    PopoverTrigger,
    PopoverPortal,
    PopoverContent,
    PopoverClose,
} from "reka-ui";
import data from "~/data/human-practices/stakerholders.json";

type Mode = "incoming" | "outgoing";
const mode = ref<Mode>("incoming");
const active = ref<string | null>(null);
const turns = ref(0);
const uid = useId();
let closeTimer: ReturnType<typeof setTimeout> | undefined;
const groupStyles: Record<string, Record<string, string>> = {
    customers: {
        "--group-color": "var(--primary)",
        "--title-color": "var(--on-primary)",
        "--node-color": "var(--secondary)",
        "--node-text-color": "var(--on-secondary)",
        "--edge-color": "var(--on-primary)",
    },
    experts: {
        "--group-color": "var(--surface-elevated)",
        "--title-color": "var(--on-surface)",
        "--node-color": "var(--primary)",
        "--node-text-color": "var(--on-primary)",
        "--edge-color": "var(--on-surface)",
    },
    community: {
        "--group-color": "var(--accent)",
        "--title-color": "var(--on-accent)",
        "--node-color": "var(--secondary)",
        "--node-text-color": "var(--on-secondary)",
        "--edge-color": "var(--on-accent)",
    },
    industry: {
        "--group-color": "var(--secondary)",
        "--title-color": "var(--on-secondary)",
        "--node-color": "var(--primary)",
        "--node-text-color": "var(--on-primary)",
        "--edge-color": "var(--on-secondary)",
    },
};
const nodes = data.groups.flatMap((group) =>
    group.nodes.map((node) => ({
        ...node,
        edgeColor: groupStyles[group.id]?.["--edge-color"],
        groupId: group.id,
        groupBox: group.position,
    })),
);
const graphElement = ref<HTMLElement | null>(null);
const isScrollSnapActive = ref(false);
let intersectionObserver: IntersectionObserver | undefined;
onMounted(() => {
    intersectionObserver = new IntersectionObserver(
        ([entry]) => {
            isScrollSnapActive.value = (entry?.intersectionRatio ?? 0) >= 0.7;
        },
        { threshold: [0, 0.7, 0.95] },
    );
    if (graphElement.value) intersectionObserver.observe(graphElement.value);
});
onBeforeUnmount(() => intersectionObserver?.disconnect());
function cancelClose() {
    clearTimeout(closeTimer);
}
function open(id: string) {
    cancelClose();
    active.value = id;
}
function openAfterClick(id: string) {
    nextTick(() => open(id));
}
function closeLater(event: PointerEvent) {
    if (event.pointerType !== "mouse") return;
    cancelClose();
    closeTimer = setTimeout(() => {
        if (
            document.activeElement?.closest(
                '.stakeholder-detail, .stakeholder-node[data-state="open"]',
            )
        )
            return;
        active.value = null;
    }, 250);
}
function toggle() {
    mode.value = mode.value === "incoming" ? "outgoing" : "incoming";
    turns.value++;
}
onBeforeUnmount(cancelClose);
// Coordinates are taken from the reference artwork (1827 × 1030).
function position(p: { x: number; y: number; width: number; height?: number }) {
    return {
        left: p.x / 18.27 + "%",
        top: p.y / 10.3 + "%",
        width: p.width / 18.27 + "%",
        ...(p.height ? { height: p.height / 10.3 + "%" } : {}),
    };
}
type Point = { x: number; y: number };
type Box = Point & { width: number; height: number };
function inside(point: Point, box: Box, radius: number) {
    const x = Math.abs(point.x - box.x),
        y = Math.abs(point.y - box.y);
    if (x > box.width / 2 || y > box.height / 2) return false;
    const dx = Math.max(0, x - (box.width / 2 - radius)),
        dy = Math.max(0, y - (box.height / 2 - radius));
    return dx * dx + dy * dy <= radius * radius;
}
const round = (value: number) => Number(value.toFixed(3));
const controlRatios: Partial<Record<string, Point>> = {
    tcm: { x: 0.6, y: 0.3 },
    xia: { x: 0.4, y: 0.3 },
    counsellor: { x: 0.5, y: 0.4 },
};
const expertEndpoints: Partial<
    Record<
        string,
        { centerX: number; nodeAngle: number | null; nodeOffsetX?: number }
    >
> = {
    tcm: { centerX: 976, nodeAngle: null, nodeOffsetX: 28 },
    skincare: { centerX: 1002, nodeAngle: 135 },
    modelling: { centerX: 1025, nodeAngle: 150 },
    biomaterials: { centerX: 1048, nodeAngle: 142 },
    immunologist: { centerX: 1080, nodeAngle: null },
    surgeon: { centerX: 1089, nodeAngle: 125 },
    formulation: { centerX: 1094, nodeAngle: 110 },
};
const edges = nodes.map((node) => {
    const a = {
            ...node.position,
            x: node.position.x + (node.id === "link-spider" ? 24 : 0),
        },
        center = data.center,
        group = node.groupBox,
        isTopGroup = group.y < center.y;
    const siblings = nodes
        .filter((candidate) => candidate.groupId === node.groupId)
        .sort((left, right) => left.position.x - right.position.x);
    const rank = siblings.findIndex((candidate) => candidate.id === node.id);
    const inset = 8;
    const portMin = Math.max(group.x, center.x - center.width / 2) + inset;
    const portMax =
        Math.min(group.x + group.width, center.x + center.width / 2) - inset;
    const progress = siblings.length > 1 ? rank / (siblings.length - 1) : 0.5;
    const b = {
        x: portMin + (portMax - portMin) * progress,
        y: isTopGroup
            ? Math.min(
                  group.y + group.height - inset,
                  center.y - center.height / 2 + 24,
              )
            : Math.max(group.y + inset, center.y + center.height / 2 - 24),
    };
    const ratio = controlRatios[node.id] ?? { x: 0.5, y: 0.3 };
    // Ordered ports and a control point inside the group keep the arcs shallow.
    const c = {
        x: b.x + (a.x - b.x) * ratio.x,
        y: b.y + (a.y - b.y) * ratio.y,
    };
    const at = (t: number): Point => ({
        x: (1 - t) ** 2 * b.x + 2 * (1 - t) * t * c.x + t * t * a.x,
        y: (1 - t) ** 2 * b.y + 2 * (1 - t) * t * c.y + t * t * a.y,
    });
    // Locate both intersections with the actual rounded tag/card boundaries.
    function boundary(box: Box, radius: number, fromStart: boolean) {
        let low = 0,
            high = 1;
        for (let i = 0; i < 36; i++) {
            const mid = (low + high) / 2;
            if (inside(at(mid), box, radius) === fromStart) low = mid;
            else high = mid;
        }
        return (low + high) / 2;
    }
    const t0 = boundary(center, 1827 * 0.0165, true);
    const t1 = boundary(
        node.position,
        Math.min(1827 * 0.0265, a.height / 2),
        false,
    );
    const first = at(t0),
        last =
            node.id === "link-spider"
                ? {
                      x: node.position.x + 34,
                      y: node.position.y - node.position.height / 2,
                  }
                : at(t1);
    const control = {
        x: first.x + (t1 - t0) * ((1 - t0) * (c.x - b.x) + t0 * (a.x - c.x)),
        y: first.y + (t1 - t0) * ((1 - t0) * (c.y - b.y) + t0 * (a.y - c.y)),
    };
    if (node.id === "link-spider") control.x += 16;
    if (node.id === "teachers") {
        first.x -= 20;
        control.x -= 12;
    }
    if (node.id === "surgery") {
        const radius = 1827 * 0.0165;
        const angle = (105 * Math.PI) / 180;
        first.x =
            center.x - center.width / 2 + radius + radius * Math.cos(angle);
        first.y =
            center.y - center.height / 2 + radius - radius * Math.sin(angle);
    }
    if (node.id === "hotel") {
        first.x = center.x - center.width / 2 + 75;
        first.y = center.y - center.height / 2;
    }
    if (node.id === "counsellor") {
        first.x = center.x - center.width / 2 + 1827 * 0.0165;
        first.y = center.y + center.height / 2;
        const radius = Math.min(1827 * 0.0265, a.height / 2);
        const angle = (40 * Math.PI) / 180;
        last.x = a.x + a.width / 2 - radius + radius * Math.cos(angle);
        last.y = a.y - a.height / 2 + radius - radius * Math.sin(angle);
    }
    const expertEndpoint = expertEndpoints[node.id];
    if (expertEndpoint) {
        const centerRadius = 1827 * 0.0165;
        const cornerX = center.x + center.width / 2 - centerRadius;
        const dx = Math.max(0, expertEndpoint.centerX - cornerX);
        first.x = expertEndpoint.centerX;
        first.y =
            center.y -
            center.height / 2 +
            centerRadius -
            Math.sqrt(centerRadius ** 2 - dx ** 2);
        if (expertEndpoint.nodeAngle === null) {
            last.x = a.x + (expertEndpoint.nodeOffsetX ?? -64);
            last.y = a.y + a.height / 2;
        } else {
            const radius = Math.min(1827 * 0.0265, a.height / 2);
            const angle = (expertEndpoint.nodeAngle * Math.PI) / 180;
            last.x = a.x - a.width / 2 + radius + radius * Math.cos(angle);
            last.y = a.y + a.height / 2 - radius + radius * Math.sin(angle);
        }
        control.x = (first.x + last.x) / 2;
        control.y = (first.y + last.y) / 2 + 8;
    }
    const point = (p: Point) => round(p.x) + " " + round(p.y);
    // Draw arrowheads directly at the same endpoints as the curve. Animating
    // ordinary paths avoids browser inconsistencies with animated SVG markers.
    function arrow(tip: Point, from: Point) {
        const length = Math.hypot(tip.x - from.x, tip.y - from.y);
        const dx = (tip.x - from.x) / length;
        const dy = (tip.y - from.y) / length;
        const wing = (side: number) => ({
            x: tip.x - 10 * dx - side * 5 * dy,
            y: tip.y - 10 * dy + side * 5 * dx,
        });
        return (
            "M " + point(wing(-1)) + " L " + point(tip) + " L " + point(wing(1))
        );
    }
    return {
        id: node.id,
        color: node.edgeColor,
        incoming:
            "M " + point(last) + " Q " + point(control) + " " + point(first),
        outgoing:
            "M " + point(first) + " Q " + point(control) + " " + point(last),
        incomingHead: arrow(first, control),
        outgoingHead: arrow(last, control),
    };
});
</script>

<template>
    <section
        ref="graphElement"
        class="stakeholders font-main"
        :class="{ 'stakeholders--snap-active': isScrollSnapActive }"
        aria-label="Stakeholder relationships"
    >
        <div class="stakeholders-panel">
            <div class="stakeholders-map">
                <svg
                    class="graph-edges"
                    :class="turns > 0 ? `graph-edges--draw-${mode}` : undefined"
                    viewBox="0 0 1827 1030"
                    aria-hidden="true"
                >
                    <g>
                        <path
                            v-for="edge in edges"
                            :key="edge.id"
                            :d="edge[mode]"
                            class="edge-line"
                            pathLength="1"
                            fill="none"
                            :stroke="edge.color"
                            stroke-width="4"
                        />
                        <path
                            v-for="edge in edges"
                            :key="`head-${edge.id}`"
                            :d="
                                mode === 'incoming'
                                    ? edge.incomingHead
                                    : edge.outgoingHead
                            "
                            class="edge-head"
                            fill="none"
                            :stroke="edge.color"
                            stroke-width="3"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </g>
                </svg>
                <div
                    class="graph-center font-belanosima"
                    :style="position(data.center)"
                >
                    {{ data.center.name }}
                </div>
                <section
                    v-for="group in data.groups"
                    :key="group.id"
                    class="stakeholder-group"
                    :style="groupStyles[group.id]"
                    :aria-labelledby="`${uid}-${group.id}`"
                >
                    <div
                        class="group-background"
                        :style="position(group.position)"
                        aria-hidden="true"
                    />
                    <h2
                        :id="`${uid}-${group.id}`"
                        class="group-title font-belanosima"
                        :class="{ 'group-title-right': group.position.x > 900 }"
                        :style="
                            position({
                                x: group.position.x + 40,
                                y: group.position.y + 18,
                                width: group.position.width - 80,
                            })
                        "
                    >
                        {{ group.name }}
                    </h2>
                    <PopoverRoot
                        v-for="node in group.nodes"
                        :key="node.id"
                        :open="active === node.id"
                        @update:open="
                            (value) => {
                                cancelClose();
                                if (value) active = node.id;
                                else if (active === node.id) active = null;
                            }
                        "
                    >
                        <PopoverTrigger
                            class="stakeholder-node"
                            :style="position(node.position)"
                            :aria-describedby="
                                active === node.id
                                    ? `${uid}-${node.id}-description`
                                    : undefined
                            "
                            @pointerenter="
                                (event) => {
                                    if (event.pointerType === 'mouse')
                                        open(node.id);
                                }
                            "
                            @pointerleave="closeLater"
                            @focus="openAfterClick(node.id)"
                            @click.capture.stop="open(node.id)"
                        >
                            <span
                                ><span
                                    v-for="(line, index) in node.labelLines"
                                    :key="index"
                                    class="node-label-line"
                                    >{{ line }}</span
                                ></span
                            >
                        </PopoverTrigger>
                        <PopoverPortal>
                            <PopoverContent
                                class="stakeholder-popover z-80 w-[min(370px,calc(100vw-32px))] overflow-visible bg-transparent p-0 font-main"
                                :aria-label="node.name"
                                :side-offset="10"
                                :collision-padding="16"
                                @open-auto-focus.prevent
                                @close-auto-focus.prevent
                                @pointerenter="cancelClose"
                                @pointerleave="closeLater"
                            >
                                <div class="stakeholder-detail">
                                    <div
                                        class="detail-backplate"
                                        aria-hidden="true"
                                    />
                                    <div class="detail-surface">
                                        <div class="detail-top">
                                            <span class="detail-eyebrow">{{
                                                mode === "incoming"
                                                    ? "How they influence us"
                                                    : "How we influence them"
                                            }}</span
                                            ><PopoverClose
                                                class="detail-close"
                                                aria-label="Close stakeholder introduction"
                                                ><Icon
                                                    icon="lucide:x"
                                                    class="size-5"
                                                    aria-hidden="true"
                                            /></PopoverClose>
                                        </div>
                                        <h3 class="font-belanosima">
                                            {{ node.name }}
                                        </h3>
                                        <p
                                            v-if="'detail' in node"
                                            class="detail-names"
                                        >
                                            {{ node.detail }}
                                        </p>
                                        <div
                                            :id="`${uid}-${node.id}-description`"
                                        >
                                            <Transition
                                                name="detail"
                                                mode="out-in"
                                            >
                                                <div :key="mode">
                                                    <dl
                                                        v-if="node[mode].length"
                                                    >
                                                        <div
                                                            v-for="item in node[
                                                                mode
                                                            ]"
                                                            :key="item.title"
                                                        >
                                                            <dt>
                                                                {{ item.title }}
                                                            </dt>
                                                            <dd>
                                                                {{ item.text }}
                                                            </dd>
                                                        </div>
                                                    </dl>
                                                    <p
                                                        v-else
                                                        class="detail-pending"
                                                    >
                                                        This part of the
                                                        stakeholder analysis is
                                                        still being developed.
                                                    </p>
                                                </div>
                                            </Transition>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </PopoverPortal>
                    </PopoverRoot>
                </section>
            </div>
            <div class="graph-switch">
                <button
                    type="button"
                    class="switch-button"
                    :aria-label="`Switch to: ${data.modes[mode === 'incoming' ? 'outgoing' : 'incoming'].label}`"
                    :aria-pressed="mode === 'outgoing'"
                    @click="toggle"
                >
                    <Icon
                        icon="lucide:refresh-cw"
                        aria-hidden="true"
                        :style="{ transform: `rotate(${turns * 180}deg)` }"
                    />
                </button>
                <div class="mode-cards" aria-live="polite" aria-atomic="true">
                    <div
                        v-for="(item, key) in data.modes"
                        :key="key"
                        class="mode-card font-belanosima"
                        :class="[
                            `mode-card-${key}`,
                            { 'mode-card-active': mode === key },
                        ]"
                        :aria-hidden="mode !== key"
                    >
                        {{ item.label }}
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.stakeholders {
    container-type: inline-size;
    scroll-margin-block: 1rem;
}
.stakeholders-panel {
    width: min(100%, calc((100dvh - 5rem) * 1.48));
    margin-inline: auto;
    background: var(--surface);
    color: var(--on-surface);
    container-type: inline-size;
    border-radius: 1.5rem;
}
.stakeholders-map {
    position: relative;
    aspect-ratio: 1827 / 1030;
    isolation: isolate;
}
.group-background {
    position: absolute;
    background: var(--group-color);
    border-radius: 3.2cqi;
    z-index: -2;
}
.group-title {
    position: absolute;
    margin: 0;
    color: var(--title-color);
    font-size: 2.55cqi;
    line-height: 1.1;
    pointer-events: none;
}
.group-title-right {
    text-align: right;
}
.graph-edges {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    overflow: visible;
    pointer-events: none;
}
.edge-line {
    stroke-dasharray: 1;
    stroke-dashoffset: 0;
}
.edge-head {
    opacity: 1;
}
.graph-edges--draw-incoming .edge-line {
    animation: stakeholder-line-incoming 0.62s
        cubic-bezier(0.455, 0.03, 0.515, 0.955) backwards;
}
.graph-edges--draw-outgoing .edge-line {
    animation: stakeholder-line-outgoing 0.62s
        cubic-bezier(0.455, 0.03, 0.515, 0.955) backwards;
}
.graph-edges--draw-incoming .edge-head {
    animation: stakeholder-head-incoming 0.12s ease-out 0.62s backwards;
}
.graph-edges--draw-outgoing .edge-head {
    animation: stakeholder-head-outgoing 0.12s ease-out 0.62s backwards;
}
@keyframes stakeholder-line-incoming {
    from {
        stroke-dashoffset: 1;
    }
    to {
        stroke-dashoffset: 0;
    }
}
@keyframes stakeholder-line-outgoing {
    from {
        stroke-dashoffset: 1;
    }
    to {
        stroke-dashoffset: 0;
    }
}
@keyframes stakeholder-head-incoming {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
@keyframes stakeholder-head-outgoing {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
@media (prefers-reduced-motion: reduce) {
    .edge-line,
    .edge-head {
        animation: none;
    }
}
.graph-center {
    position: absolute;
    display: grid;
    place-items: center;
    transform: translate(-50%, -50%);
    border-radius: 1.65cqi;
    background: var(--primary);
    color: var(--on-primary);
    font-size: 2.9cqi;
    z-index: 2;
}
.stakeholder-node {
    position: absolute;
    display: grid;
    place-items: center;
    transform: translate(-50%, -50%);
    background: var(--node-color);
    color: var(--node-text-color);
    border: 2px solid transparent;
    border-radius: 2.65cqi;
    padding: 0.25em 0.55em;
    font-size: 1.4cqi;
    font-weight: 650;
    line-height: 1.25;
    cursor: pointer;
    transition:
        box-shadow 0.2s,
        background 0.2s;
}
.stakeholder-node > span {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    text-align: center;
}
.node-label-line {
    display: block;
    max-width: 100%;
    white-space: nowrap;
}
.stakeholder-node:hover,
.stakeholder-node[data-state="open"] {
    border-color: var(--node-text-color);
    box-shadow: 0 4px 0 color-mix(in srgb, var(--on-surface) 33%, transparent);
}
.stakeholder-node:focus-visible,
.switch-button:focus-visible {
    outline: 3px solid var(--outline);
    outline-offset: 3px;
    box-shadow: 0 0 0 6px var(--surface);
}
.graph-switch {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2cqi;
    height: 12.8cqi;
    padding: 2.2cqi 18% 3.51cqi;
}
.switch-button {
    flex: 0 0 5cqi;
    width: 5cqi;
    height: 5cqi;
    min-width: 32px;
    min-height: 32px;
    color: var(--primary);
    border-radius: 50%;
    cursor: pointer;
}
.switch-button svg {
    width: 100%;
    height: 100%;
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.mode-cards {
    position: relative;
    flex: 1;
    height: 4.5cqi;
}
.mode-card {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 0.3cqi 0.7cqi;
    border-radius: 2.1cqi;
    font-size: 2.6cqi;
    line-height: 1.1;
    text-align: center;
    white-space: nowrap;
    transform: translateY(1.5cqi);
    z-index: 0;
    transition:
        transform 0.65s,
        box-shadow 0.65s;
}
.mode-card-incoming {
    background: var(--primary);
    color: var(--on-primary);
}
.mode-card-outgoing {
    background: var(--accent);
    color: var(--on-accent);
}
.mode-card-active {
    transform: translateY(-0.3cqi);
    z-index: 1;
    box-shadow: 0 10px 18px
        color-mix(in srgb, var(--on-surface) 27%, transparent);
}
/* These are real DOM layers inside the portal, just like ProseEm. */
.stakeholder-detail {
    position: relative;
    isolation: isolate;
    color: var(--on-surface);
}
.detail-backplate {
    position: absolute;
    inset: 0;
    z-index: 0;
    transform: translate(6px, 6px);
    border-radius: 1rem;
    background: var(--primary);
    pointer-events: none;
}
.detail-surface {
    border: 1px solid color-mix(in srgb, var(--outline) 25%, transparent);
    position: relative;
    z-index: 1;
    border-radius: 1rem;
    background: var(--surface-elevated);
    padding: 1.2rem;
    max-height: min(
        560px,
        calc(var(--reka-popover-content-available-height, 80dvh) - 8px)
    );
    overflow-y: auto;
    box-shadow: 0 8px 24px
        color-mix(in srgb, var(--on-surface) 15%, transparent);
}
.detail-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    font-size: 0.75rem;
    font-weight: 700;
}
.detail-close {
    display: grid;
    place-items: center;
    min-width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--secondary);
    color: var(--on-secondary);
    font-size: 1.4rem;
    cursor: pointer;
}
.detail-close:focus-visible {
    outline: 3px solid var(--outline);
    outline-offset: 2px;
}
.stakeholder-detail h3 {
    font-size: 1.5rem;
    line-height: 1.2;
    margin: 0.6rem 0;
}
.detail-names,
.detail-pending {
    font-size: 0.85rem;
    line-height: 1.6;
}
.detail-eyebrow {
    color: var(--on-secondary);
    background: var(--secondary);
    padding: 0.35rem 0.65rem;
    border-radius: 0.65rem;
}
.detail-close:hover {
    background: var(--primary);
    color: var(--on-primary);
}
.stakeholder-detail dl > div + div {
    margin-top: 0.8rem;
}
.stakeholder-detail dt {
    font-size: 0.8rem;
    font-weight: 750;
    color: var(--on-surface);
}
.stakeholder-detail dd {
    margin: 0.2rem 0 0;
    font-size: 0.9rem;
    line-height: 1.6;
}
.detail-enter-active,
.detail-leave-active {
    transition:
        opacity 0.15s,
        transform 0.15s;
}
.detail-enter-from,
.detail-leave-to {
    opacity: 0;
    transform: translateY(5px);
}
@media (orientation: landscape) and (prefers-reduced-motion: no-preference) {
    :global(html:has(.stakeholders)) {
        scroll-padding-block-start: 3.5rem;
        scroll-snap-type: y proximity;
    }
    .stakeholders--snap-active {
        scroll-snap-align: center;
    }
}
@container (max-width:600px) {
    .stakeholders-panel {
        width: 100%;
    }
    .stakeholders-map {
        aspect-ratio: auto;
        display: grid;
        gap: 1rem;
        padding: 1rem;
    }
    .graph-edges,
    .group-background {
        display: none;
    }
    .graph-center {
        position: static;
        transform: none;
        width: auto !important;
        height: auto !important;
        padding: 0.8rem;
        font-size: 2rem;
    }
    .stakeholder-group {
        border-radius: 1.2rem;
        background: var(--group-color);
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.7rem;
    }
    .group-title {
        position: static;
        width: auto !important;
        text-align: left;
        font-size: 1.5rem;
        margin-bottom: 0.4rem;
    }
    .stakeholder-node {
        position: static;
        transform: none;
        width: 100% !important;
        height: auto !important;
        min-height: 44px;
        font-size: 0.95rem;
        border-radius: 2rem;
    }
    .graph-switch {
        height: auto;
        padding: 1rem 1rem 2rem;
        gap: 0.75rem;
    }
    .mode-cards {
        height: 4rem;
    }
    .mode-card {
        font-size: 1rem;
        white-space: normal;
        border-radius: 1rem;
    }
}
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        transition: none !important;
    }
}
</style>
<style>
/* Portal presence animations must target the Reka root without scoped attributes. */
.stakeholder-popover {
    transform-origin: var(--reka-popover-content-transform-origin);
}
.stakeholder-popover[data-state="open"] {
    animation: stakeholder-popover-in 180ms cubic-bezier(0.16, 1, 0.3, 1);
}
.stakeholder-popover[data-state="closed"] {
    animation: stakeholder-popover-out 120ms ease-in;
}
@keyframes stakeholder-popover-in {
    from {
        opacity: 0;
        transform: translateY(5px) scale(0.96);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
@keyframes stakeholder-popover-out {
    from {
        opacity: 1;
        transform: scale(1);
    }
    to {
        opacity: 0;
        transform: scale(0.97);
    }
}
@media (prefers-reduced-motion: reduce) {
    .stakeholder-popover {
        animation: none !important;
    }
}
</style>
