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
        "--group-color": "color-mix(in srgb, #56b4df 92%, var(--surface))",
        "--title-color": "#08346a",
        "--node-color": "#dff3ee",
        "--node-text-color": "#08346a",
        "--edge-color": "#dff3ee",
    },
    experts: {
        "--node-font-size": "1.05cqi",
        "--group-color": "color-mix(in srgb, #ffe071 92%, var(--surface))",
        "--title-color": "#08346a",
        "--node-color": "#fff3c6",
        "--node-text-color": "#08346a",
        "--edge-color": "#fff3c6",
    },
    community: {
        "--node-font-size": "1.3cqi",
        "--group-color": "color-mix(in srgb, #ffa51d 92%, var(--surface))",
        "--title-color": "#08346a",
        "--node-color": "#ffe8a8",
        "--node-text-color": "#08346a",
        "--edge-color": "#fff3c6",
    },
    industry: {
        "--group-color": "color-mix(in srgb, #377cd0 92%, var(--surface))",
        "--title-color": "#ffffff",
        "--node-color": "#91d7ff",
        "--node-text-color": "#08346a",
        "--edge-color": "#91d7ff",
    },
};
const impactClass = (title: string) =>
    `impact-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`;
// Keep the reference's scattered composition, with individually placed tags
// that clear the headings and stay within their coloured quadrants.
const nodePositions: Partial<Record<string, Box>> = {
    tcm: { x: 1066, y: 156, width: 212, height: 68 },
    xia: { x: 1086, y: 285, width: 224, height: 84 },
    skincare: { x: 1295, y: 179, width: 224, height: 92 },
    modelling: { x: 1305, y: 351, width: 196, height: 76 },
    biomaterials: { x: 1068, y: 428, width: 220, height: 88 },
    immunologist: { x: 1690, y: 203, width: 180, height: 72 },
    surgeon: { x: 1693, y: 332, width: 180, height: 78 },
    formulation: { x: 1692, y: 440, width: 188, height: 108 },
    "environmental-cheng-kai": {
        x: 1288,
        y: 451,
        width: 196,
        height: 100,
    },
    "environmental-zhang-linbao": {
        x: 1508,
        y: 278,
        width: 180,
        height: 100,
    },
    "environmental-li-guanghui": {
        x: 1500,
        y: 425,
        width: 180,
        height: 104,
    },
    "emc-director": { x: 1502, y: 152, width: 180, height: 76 },
    sociologist: { x: 430, y: 665, width: 220, height: 76 },
    ai4s: { x: 180, y: 735, width: 190, height: 76 },
    psychiatrist: { x: 450, y: 790, width: 190, height: 76 },
    counsellor: { x: 200, y: 930, width: 220, height: 122 },
    "school-counsellor": { x: 500, y: 910, width: 210, height: 112 },
    teachers: { x: 755, y: 952, width: 210, height: 82 },
    anthropologist: { x: 735, y: 720, width: 220, height: 76 },
    amcor: { x: 1140, y: 670, width: 220, height: 76 },
    evonik: { x: 1080, y: 870, width: 220, height: 76 },
};
const groups = data.groups.map((group) => ({
    ...group,
    nodes: group.nodes.map((node) => ({
        ...node,
        position: nodePositions[node.id] ?? node.position,
    })),
}));
const nodes = groups.flatMap((group) =>
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
const edges = nodes.map((node) => {
    const a = node.position,
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
    const ratio = { x: 0.5, y: 0.3 };
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
        last = at(t1);
    const control = {
        x: first.x + (t1 - t0) * ((1 - t0) * (c.x - b.x) + t0 * (a.x - c.x)),
        y: first.y + (t1 - t0) * ((1 - t0) * (c.y - b.y) + t0 * (a.y - c.y)),
    };
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
                    v-for="group in groups"
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
                                        class="detail-surface"
                                        :class="{
                                            'detail-surface--has-image':
                                                node.imageUrl,
                                        }"
                                    >
                                        <div
                                            v-if="node.imageUrl"
                                            class="detail-media"
                                        >
                                            <img
                                                class="detail-image"
                                                :src="node.imageUrl"
                                                :alt="`${node.name} stakeholder image`"
                                                loading="lazy"
                                            />
                                        </div>
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
                                                            <dt
                                                                :class="
                                                                    impactClass(
                                                                        item.title,
                                                                    )
                                                                "
                                                            >
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
    background: #dff3ee;
    color: #08346a;
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
    font-size: var(--node-font-size, 1.4cqi);
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
    color: #08346a;
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
    background: #dff3ee;
    color: #08346a;
}
.mode-card-outgoing {
    background: #56b4df;
    color: #08346a;
}
.mode-card-active {
    transform: translateY(-0.3cqi);
    z-index: 1;
    box-shadow: 0 10px 18px color-mix(in srgb, #08346a 32%, transparent);
}
/* These are real DOM layers inside the portal, just like ProseEm. */
.stakeholder-detail {
    --detail-background: var(--surface-bright);
    --detail-foreground: var(--on-surface);
    --detail-label-background: var(--surface-elevated);
    --detail-label-foreground: var(--on-surface);
    --detail-close-background: var(--surface-elevated);
    --detail-close-foreground: var(--on-surface);
    --detail-close-hover-background: var(--primary);
    --detail-close-hover-foreground: var(--on-primary);
    --impact-experiential: #805000;
    --impact-technical: #006b59;
    --impact-applicational: #135c8a;
    --impact-ethical: #914b00;
    --impact-treatment: #135c8a;
    --impact-psychosocial: #a33e00;
    --impact-social: #805000;
    position: relative;
    isolation: isolate;
    color: var(--detail-foreground);
}
.detail-surface {
    position: relative;
    border-radius: 1rem;
    background: var(--detail-background);
    padding: 1.2rem;
    min-height: 15.5rem;
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
    min-height: 2rem;
    font-size: 0.75rem;
    font-weight: 700;
}
.detail-close {
    display: grid;
    place-items: center;
    position: relative;
    z-index: 2;
    min-width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--detail-close-background);
    color: var(--detail-close-foreground);
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
    margin: 0.9rem 0 0.55rem;
}
.detail-surface--has-image .detail-top,
.detail-surface--has-image h3 {
    padding-right: 7.3rem;
}
.detail-surface--has-image h3 {
    max-width: calc(100% - 7rem);
}
.detail-names,
.detail-pending {
    font-size: 0.85rem;
    line-height: 1.6;
}
.detail-eyebrow {
    color: var(--detail-label-foreground);
    background: var(--detail-label-background);
    padding: 0.35rem 0.65rem;
    border-radius: 0.65rem;
}
.detail-close:hover {
    background: var(--detail-close-hover-background);
    color: var(--detail-close-hover-foreground);
}
.detail-media {
    position: absolute;
    top: 1.2rem;
    right: 1.2rem;
    width: 6.6rem;
    height: 5.35rem;
    overflow: hidden;
    border-radius: 0.85rem;
}
.detail-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.stakeholder-detail dl {
    margin-top: 1.1rem;
}
.stakeholder-detail dl > div + div {
    margin-top: 0.8rem;
}
.stakeholder-detail dt {
    font-size: 0.8rem;
    font-weight: 750;
    color: var(--impact-color, var(--detail-foreground));
    letter-spacing: 0.01em;
}
.stakeholder-detail dd {
    margin: 0.2rem 0 0;
    font-size: 0.9rem;
    line-height: 1.6;
}
.impact-experiential {
    --impact-color: var(--impact-experiential);
}
.impact-technical {
    --impact-color: var(--impact-technical);
}
.impact-applicational {
    --impact-color: var(--impact-applicational);
}
.impact-ethical {
    --impact-color: var(--impact-ethical);
}
.impact-treatment {
    --impact-color: var(--impact-treatment);
}
.impact-psychosocial {
    --impact-color: var(--impact-psychosocial);
}
.impact-social {
    --impact-color: var(--impact-social);
}
:global(.dark .stakeholder-detail) {
    --detail-background: #062b65;
    --detail-foreground: #ffffff;
    --detail-label-background: #0a4296;
    --detail-label-foreground: #ffffff;
    --detail-close-background: #dff3ee;
    --detail-close-foreground: #08346a;
    --detail-close-hover-background: #ffe071;
    --detail-close-hover-foreground: #08346a;
    --impact-experiential: #ffd166;
    --impact-technical: #61dfc7;
    --impact-applicational: #9ed3f3;
    --impact-ethical: #ffad2f;
    --impact-treatment: #9ed3f3;
    --impact-psychosocial: #ff8c42;
    --impact-social: #ffd166;
}
:global(.high-contrast .stakeholder-detail) {
    --detail-background: var(--primary);
    --detail-foreground: var(--on-primary);
    --detail-label-background: var(--secondary);
    --detail-label-foreground: var(--on-secondary);
    --detail-close-background: var(--secondary);
    --detail-close-foreground: var(--on-secondary);
    --detail-close-hover-background: var(--accent);
    --detail-close-hover-foreground: var(--on-accent);
    --impact-experiential: var(--on-primary);
    --impact-technical: var(--on-primary);
    --impact-applicational: var(--on-primary);
    --impact-ethical: var(--on-primary);
    --impact-treatment: var(--on-primary);
    --impact-psychosocial: var(--on-primary);
    --impact-social: var(--on-primary);
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
