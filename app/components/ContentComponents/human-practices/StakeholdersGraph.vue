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
const nodes = data.groups.flatMap((group) =>
    group.nodes.map((node) => ({
        ...node,
        edgeColor: group.nodeColor,
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
        b = data.center;
    const c =
        a.y > b.y
            ? { x: b.x + (a.x - b.x) * 0.12, y: a.y + (b.y - a.y) * 0.12 }
            : { x: a.x + (b.x - a.x) * 0.22, y: b.y + (a.y - b.y) * 0.12 };
    const at = (t: number): Point => ({
        x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
        y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
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
    const t0 = boundary(a, Math.min(48, a.height / 2), true);
    const t1 = boundary(b, 30, false);
    const first = at(t0),
        last = at(t1);
    const control = {
        x: first.x + (t1 - t0) * ((1 - t0) * (c.x - a.x) + t0 * (b.x - c.x)),
        y: first.y + (t1 - t0) * ((1 - t0) * (c.y - a.y) + t0 * (b.y - c.y)),
    };
    const point = (p: Point) => round(p.x) + " " + round(p.y);
    return {
        id: node.id,
        color: node.edgeColor,
        incoming:
            "M " + point(first) + " Q " + point(control) + " " + point(last),
        outgoing:
            "M " + point(last) + " Q " + point(control) + " " + point(first),
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
                    :key="mode"
                    class="graph-edges"
                    :class="{ 'graph-edges--drawing': turns > 0 }"
                    viewBox="0 0 1827 1030"
                    aria-hidden="true"
                >
                    <defs>
                        <marker
                            v-for="edge in edges"
                            :key="edge.id"
                            :id="uid + '-arrow-' + edge.id"
                            viewBox="0 0 12 12"
                            refX="11"
                            refY="6"
                            markerWidth="12"
                            markerHeight="12"
                            markerUnits="userSpaceOnUse"
                            orient="auto"
                        >
                            <path
                                class="edge-head"
                                d="M 1 1 L 11 6 L 1 11"
                                fill="none"
                                :stroke="edge.color"
                                stroke-width="3"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </marker>
                    </defs>
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
                            :marker-end="
                                'url(#' + uid + '-arrow-' + edge.id + ')'
                            "
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
                    :style="{
                        '--group-color': group.color,
                        '--node-color': group.nodeColor,
                        '--title-color': group.titleColor,
                    }"
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
    background: #08346a;
    color: #08346a;
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
.graph-edges--drawing .edge-line {
    stroke-dasharray: 1;
    animation: stakeholder-line-draw .62s cubic-bezier(.455,.03,.515,.955) both;
}
.graph-edges--drawing .edge-head {
    animation: stakeholder-head-reveal .16s ease-out .5s both;
}
@keyframes stakeholder-line-draw {
    from { stroke-dashoffset: 1; }
    to { stroke-dashoffset: 0; }
}
@keyframes stakeholder-head-reveal {
    from { opacity: 0; }
    to { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
    .graph-edges--drawing .edge-line,
    .graph-edges--drawing .edge-head { animation: none; }
}
.graph-center {
    position: absolute;
    display: grid;
    place-items: center;
    transform: translate(-50%, -50%);
    border-radius: 1.65cqi;
    background: #fbfff4;
    font-size: 2.9cqi;
    z-index: 2;
}
.stakeholder-node {
    position: absolute;
    display: grid;
    place-items: center;
    transform: translate(-50%, -50%);
    background: var(--node-color);
    border: 2px solid transparent;
    border-radius: 2.65cqi;
    padding: 0.2em;
    font-size: 1.4cqi;
    font-weight: 650;
    line-height: 1.25;
    cursor: pointer;
    transition:
        box-shadow 0.2s,
        background 0.2s;
}
.node-label-line {
    display: block;
    white-space: nowrap;
}
.stakeholder-node:hover,
.stakeholder-node[data-state="open"] {
    background: #fffef0;
    box-shadow: 0 4px 0 #08346a55;
}
.stakeholder-node:focus-visible,
.switch-button:focus-visible {
    outline: 3px solid #fff;
    outline-offset: 3px;
    box-shadow: 0 0 0 6px #08346a;
}
.graph-switch {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2cqi;
    height: 11cqi;
    padding: 2.8cqi 18% 2.2cqi;
}
.switch-button {
    flex: 0 0 5cqi;
    width: 5cqi;
    height: 5cqi;
    min-width: 32px;
    min-height: 32px;
    color: #fff;
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
    background: #65d7bd;
}
.mode-card-outgoing {
    background: #56b4df;
}
.mode-card-active {
    transform: translateY(-0.3cqi);
    z-index: 1;
    box-shadow: 0 10px 18px #08346a44;
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
