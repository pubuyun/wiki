<script setup lang="ts">
import { onMounted, onUnmounted, ref, useId } from "vue";
import LightboxImage from "../../LightboxImage.vue";
import models from "~/data/inlcusivity/models.json";

const imageBase =
    "https://static.igem.wiki/teams/6133/wiki/hp/inclusivity/3dmodel-render";
const images = models.map((model) => ({
    title: model.title,
    src: `${imageBase}/${model.id.replaceAll("_", "-")}.avif`,
}));
const sources = images.map((image) => image.src);
const descriptions = images.map(
    (image) => `Tactile ${image.title} model render`,
);
const instructionsId = `model-gallery-${useId()}`;
const viewport = ref<HTMLDivElement | null>(null);
const track = ref<HTMLDivElement | null>(null);
const paused = ref(false);
const reducedMotion = ref(false);
const focused = ref(false);
const dragging = ref(false);

let pointerId: number | null = null;
let startX = 0;
let startY = 0;
let previousX = 0;
let suppressClick = false;
let cycleWidth = 0;
let scrollPosition = 0;
let frame = 0;
let inView = false;
let cleanup: (() => void) | undefined;

function wrap(position: number) {
    return cycleWidth ? ((position % cycleWidth) + cycleWidth) % cycleWidth : 0;
}

function startDrag(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0) return;
    pointerId = event.pointerId;
    startX = previousX = event.clientX;
    startY = event.clientY;
    suppressClick = false;
    focused.value = false;
}

function moveDrag(event: PointerEvent) {
    if (event.pointerId !== pointerId || !viewport.value) return;
    if (!dragging.value) {
        const dx = Math.abs(event.clientX - startX);
        const dy = Math.abs(event.clientY - startY);
        if (dx < 6 || (event.pointerType === "touch" && dy > dx)) return;
        dragging.value = true;
        suppressClick = true;
        viewport.value.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    viewport.value.scrollLeft = wrap(
        viewport.value.scrollLeft - (event.clientX - previousX),
    );
    previousX = event.clientX;
}

function endDrag(event: PointerEvent) {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    dragging.value = false;
    if (viewport.value?.hasPointerCapture(event.pointerId)) {
        viewport.value.releasePointerCapture(event.pointerId);
    }
}

function preventDragClick(event: MouseEvent) {
    if (!suppressClick || event.detail === 0) return;
    event.preventDefault();
    event.stopPropagation();
}

function updateFocus(event: FocusEvent) {
    const target =
        event.type === "focusin" ? event.target : event.relatedTarget;
    focused.value =
        target instanceof HTMLElement &&
        !!viewport.value?.contains(target) &&
        target.matches(":focus-visible");
}

function navigate(event: KeyboardEvent) {
    if (!viewport.value || !track.value) return;
    focused.value = true;
    const card = track.value.querySelector<HTMLElement>(".model-gallery__card");
    const step = (card?.offsetWidth ?? 240) + 16;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        // Keep keyboard navigation within the original, accessible image set.
        viewport.value.scrollLeft = Math.max(
            0,
            Math.min(
                cycleWidth - viewport.value.clientWidth,
                viewport.value.scrollLeft +
                    (event.key === "ArrowRight" ? step : -step),
            ),
        );
    } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        viewport.value.scrollLeft =
            event.key === "Home"
                ? 0
                : Math.max(0, cycleWidth - viewport.value.clientWidth);
    }
}

onMounted(() => {
    if (!viewport.value || !track.value) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => (reducedMotion.value = motion.matches);
    updateMotion();
    motion.addEventListener("change", updateMotion);

    const resize = new ResizeObserver(() => {
        cycleWidth =
            track.value?.firstElementChild?.getBoundingClientRect().width ?? 0;
    });
    resize.observe(track.value.firstElementChild!);
    const visibility = new IntersectionObserver(([entry]) => {
        inView = entry?.isIntersecting ?? false;
    });
    visibility.observe(viewport.value);

    let previousTime = 0;
    const animate = (time: number) => {
        const elapsed = previousTime ? Math.min(time - previousTime, 50) : 0;
        previousTime = time;
        if (viewport.value) {
            if (
                inView &&
                !document.hidden &&
                !paused.value &&
                !reducedMotion.value &&
                !focused.value &&
                pointerId === null
            ) {
                // Retain fractional pixels so slow scrolling works at any refresh rate.
                scrollPosition = wrap(scrollPosition + elapsed * 0.028);
                viewport.value.scrollLeft = scrollPosition;
            } else {
                scrollPosition = viewport.value.scrollLeft;
            }
        }
        frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    cleanup = () => {
        motion.removeEventListener("change", updateMotion);
        resize.disconnect();
        visibility.disconnect();
    };
});

onUnmounted(() => {
    cancelAnimationFrame(frame);
    cleanup?.();
});
</script>

<template>
    <section
        class="model-gallery"
        :class="{ 'model-gallery--reduced-motion': reducedMotion }"
        aria-label="Tactile model image gallery"
    >
        <div class="model-gallery__header">
            <div>
                <p class="model-gallery__heading">Explore our tactile models</p>
                <p :id="instructionsId" class="model-gallery__instructions">
                    Drag to explore · Click to enlarge
                    <span class="sr-only">
                        Use Tab to select a model and Enter to open it. Use the
                        left and right arrow keys to scroll the gallery.
                    </span>
                </p>
            </div>
            <button
                v-if="!reducedMotion"
                type="button"
                class="model-gallery__pause"
                :aria-pressed="paused"
                aria-label="Pause automatic gallery scrolling"
                @click="paused = !paused"
            >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path v-if="paused" d="m8 5 11 7-11 7Z" />
                    <path v-else d="M6 5h4v14H6zm8 0h4v14h-4z" />
                </svg>
                {{ paused ? "Resume" : "Pause" }}
            </button>
        </div>

        <LightboxImage :src="sources" :alt="descriptions">
            <template #default="{ open }">
                <div
                    ref="viewport"
                    class="model-gallery__viewport"
                    :class="{ 'is-dragging': dragging }"
                    role="group"
                    :aria-label="`${images.length} tactile model previews`"
                    :aria-describedby="instructionsId"
                    tabindex="0"
                    @focusin="updateFocus"
                    @focusout="updateFocus"
                    @keydown="navigate"
                    @pointerdown="startDrag"
                    @pointermove="moveDrag"
                    @pointerup="endDrag"
                    @pointercancel="endDrag"
                    @pointerleave="!dragging && endDrag($event)"
                    @lostpointercapture="endDrag"
                    @click.capture="preventDragClick"
                    @dragstart.prevent
                >
                    <div ref="track" class="model-gallery__track">
                        <div
                            v-for="copy in 2"
                            :key="copy"
                            class="model-gallery__group"
                            :aria-hidden="copy === 2 ? true : undefined"
                        >
                            <button
                                v-for="(image, index) in images"
                                :key="image.src"
                                type="button"
                                class="model-gallery__card"
                                :tabindex="copy === 2 ? -1 : undefined"
                                :aria-label="`Open ${image.title}, image ${index + 1} of ${images.length}`"
                                @click="
                                    paused = true;
                                    open(index);
                                "
                            >
                                <img
                                    :src="image.src"
                                    :alt="descriptions[index]"
                                    width="600"
                                    height="600"
                                    loading="lazy"
                                    decoding="async"
                                    draggable="false"
                                />
                                <span class="model-gallery__caption">
                                    <span class="model-gallery__title">{{
                                        image.title
                                    }}</span>
                                    <span
                                        class="model-gallery__expand"
                                        aria-hidden="true"
                                        >↗</span
                                    >
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </template>
        </LightboxImage>
    </section>
</template>

<style scoped>
.model-gallery {
    min-width: 0;
    margin: 2rem 0;
    color: var(--on-surface);
    font-family: var(--font-belanosima), sans-serif;
}

.model-gallery__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem 1rem;
    margin-bottom: 1rem;
}

.model-gallery__heading {
    margin: 0 0 0.35rem;
    font-size: clamp(1.5rem, 3vw, 1.85rem);
    line-height: 1.15;
}

.model-gallery__instructions {
    margin: 0;
    font-size: 1rem;
    line-height: 1.4;
}

.model-gallery__pause {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    min-height: 2.75rem;
    padding: 0.6rem 1rem;
    border: 0;
    border-radius: 999px;
    background: var(--accent);
    color: var(--on-accent);
    font: inherit;
    font-size: 1rem;
    cursor: pointer;
}

.model-gallery__pause svg {
    width: 1rem;
    height: 1rem;
}

.model-gallery__pause:hover {
    background: color-mix(in srgb, var(--accent) 85%, var(--secondary));
}

.model-gallery__viewport {
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    touch-action: pan-y pinch-zoom;
    cursor: grab;
    border-radius: 2rem;
}

.model-gallery__viewport::-webkit-scrollbar {
    display: none;
}

.model-gallery__viewport.is-dragging,
.model-gallery__viewport.is-dragging .model-gallery__card {
    cursor: grabbing;
}

.model-gallery__track,
.model-gallery__group {
    display: flex;
    width: max-content;
}

.model-gallery--reduced-motion .model-gallery__group[aria-hidden="true"] {
    display: none;
}

.model-gallery__group {
    flex-shrink: 0;
    gap: 1rem;
    padding: 0.25rem 1rem 0.75rem 0;
}

.model-gallery__card {
    display: flex;
    width: clamp(12rem, 25vw, 15rem);
    flex: 0 0 auto;
    flex-direction: column;
    align-items: stretch;
    overflow: hidden;
    padding: 1rem 0.85rem 0.85rem;
    border: 2px solid transparent;
    border-radius: 2rem;
    background: var(--surface-elevated);
    color: inherit;
    font: inherit;
    cursor: zoom-in;
    user-select: none;
    box-shadow: 0 0.35rem 0
        color-mix(in srgb, var(--surface) 75%, var(--primary));
    transition: border-color 160ms ease;
}

.model-gallery__card img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    object-fit: contain;
    pointer-events: none;
}

.model-gallery__caption {
    display: flex;
    min-height: 3.5rem;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-top: 0.75rem;
    text-align: left;
}

.model-gallery__title {
    font-size: 1.15rem;
    line-height: 1.2;
}

.model-gallery__expand {
    display: grid;
    width: 1.8rem;
    height: 1.8rem;
    flex-shrink: 0;
    place-items: center;
    border-radius: 50%;
    background: var(--accent);
    color: var(--on-accent);
    font-size: 1.1rem;
}

.model-gallery__card:hover {
    border-color: var(--accent);
}

.model-gallery__pause:focus-visible,
.model-gallery__viewport:focus-visible,
.model-gallery__card:focus-visible {
    outline: 3px solid var(--outline);
    outline-offset: -4px;
}

@media (prefers-reduced-motion: reduce) {
    .model-gallery__card {
        transition: none;
    }
}
</style>
