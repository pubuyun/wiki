<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import VoicesScene from "./VoicesScene.vue";
import LiftScene from "./LiftScene.vue";
import ContributionsScene from "./ContributionsScene.vue";

const emit = defineEmits<{ close: []; navigate: [destination: string] }>();
const dialog = ref<HTMLDialogElement>();
const scroller = ref<HTMLElement>();
const content = ref<HTMLElement>();
const ready = ref(false);
const closing = ref(false);
let previousOverflow = "";
let resizeObserver: ResizeObserver | undefined;
let lenis: Lenis | undefined;
let lenisRaf: ((time: number) => void) | undefined;
let disposed = false;

function handleScrollRequest(event: Event) {
    const request = (
        event as CustomEvent<number | { top: number; immediate?: boolean }>
    ).detail;
    const { top, immediate = false } =
        typeof request === "number" ? { top: request } : request;
    if (lenis) lenis.scrollTo(top, { duration: 0.75, immediate });
    else
        scroller.value?.scrollTo({
            top,
            behavior: immediate ? "instant" : "smooth",
        });
}

function closeWithAnimation() {
    if (closing.value) return;
    closing.value = true;
    gsap.to(dialog.value, {
        autoAlpha: 0,
        scale: 0.985,
        duration: 0.38,
        ease: "power2.in",
        onComplete: () => emit("close"),
    });
}

onMounted(async () => {
    gsap.registerPlugin(ScrollTrigger);
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.value?.showModal();
    await nextTick();
    if (disposed || !scroller.value) return;
    scroller.value.addEventListener("inclusion:scroll-to", handleScrollRequest);
    if (content.value) {
        lenis = new Lenis({
            wrapper: scroller.value,
            content: content.value,
            duration: 0.85,
            smoothWheel: true,
            syncTouch: false,
        });
        // Keep ScrollTrigger on the wrapper's native scroll model, just as the
        // home layout does on window. Lenis eases that same scrollTop and emits
        // the update; no second proxy model is needed for this independent
        // overlay scroller.
        lenis.on("scroll", () => ScrollTrigger.update());
        lenisRaf = (time) => lenis?.raf(time * 1000);
        gsap.ticker.add(lenisRaf);
        gsap.ticker.lagSmoothing(0);
    }
    resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
    resizeObserver.observe(scroller.value);
    // Mount each scene only after Lenis is listening to the same wrapper that
    // its local ScrollTriggers use. Each scene can then own its own pin and
    // timeline without sharing a proxy or a cross-scene timeline.
    ready.value = true;
    await nextTick();
    await Promise.allSettled(
        Array.from(scroller.value.querySelectorAll("img")).map((img) =>
            img.decode(),
        ),
    );
    if (!disposed) {
        lenis?.resize();
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
    }
});

onBeforeUnmount(() => {
    disposed = true;
    resizeObserver?.disconnect();
    scroller.value?.removeEventListener(
        "inclusion:scroll-to",
        handleScrollRequest,
    );
    if (lenisRaf) gsap.ticker.remove(lenisRaf);
    lenis?.destroy();
    lenis = undefined;
    dialog.value?.close();
    document.body.style.overflow = previousOverflow;
});
</script>

<template>
    <Teleport to="body">
        <dialog
            ref="dialog"
            class="inclusion-dialog"
            aria-label="Our inclusion journey"
            @cancel.prevent="closeWithAnimation"
        >
            <button
                class="journey-close"
                type="button"
                autofocus
                aria-label="Close inclusion journey"
                @click="closeWithAnimation"
            >
                Close <span aria-hidden="true">×</span>
            </button>
            <main
                ref="scroller"
                class="journey-scroller"
                tabindex="0"
                aria-label="Scroll to explore our inclusion journey"
            >
                <div ref="content" class="journey-content">
                    <template v-if="ready && scroller">
                        <VoicesScene :scroller="scroller" />
                        <LiftScene :scroller="scroller" />
                        <ContributionsScene
                            :scroller="scroller"
                            @navigate="emit('navigate', $event)"
                            @close="closeWithAnimation"
                        />
                    </template>
                </div>
            </main>
        </dialog>
    </Teleport>
</template>

<style scoped>
.inclusion-dialog {
    --journey-background: var(--surface);
    --journey-text: var(--on-surface);
    --journey-card: var(--secondary);
    --journey-card-text: var(--on-secondary);
    --journey-muted: color-mix(in srgb, var(--on-surface) 85%, var(--surface));
    --journey-card-muted: color-mix(
        in srgb,
        var(--on-secondary) 85%,
        var(--secondary)
    );
    --journey-border: var(--outline-variant);
    --journey-highlight: var(--primary);
    --journey-body: system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
    position: fixed;
    inset: 0;
    width: 100%;
    max-width: none;
    height: 100dvh;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    background: var(--journey-background);
    color: var(--journey-text);
    overflow: hidden;
    font-family: var(--font-belanosima), sans-serif;
}
.inclusion-dialog::backdrop {
    background: var(--surface);
}
.journey-close {
    position: absolute;
    z-index: 20;
    right: clamp(1rem, 2.2vw, 2rem);
    top: clamp(1rem, 2vw, 1.75rem);
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.55rem 1.15rem;
    border: 2px solid var(--journey-border);
    border-radius: 2rem;
    background: var(--journey-card);
    color: var(--journey-card-text);
    font:
        400 1.05rem var(--font-belanosima),
        sans-serif;
    cursor: pointer;
    transition:
        background 0.2s,
        transform 0.2s;
}
.journey-close span {
    font: 400 1.7rem/1 sans-serif;
}
.journey-close:hover {
    background: var(--surface-elevated);
    color: var(--on-surface);
    transform: translateY(-2px);
}
.journey-close:focus-visible {
    outline: 3px solid var(--journey-highlight);
    outline-offset: 4px;
}
.journey-scroller {
    height: 100dvh;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.journey-scroller::-webkit-scrollbar {
    display: none;
}
.journey-content {
    position: relative;
    min-height: 100%;
}
.journey-scroller:focus-visible {
    outline: 3px solid var(--journey-highlight);
    outline-offset: -3px;
}
@media (prefers-reduced-motion: reduce) {
    .journey-close {
        transition: none;
    }
}
</style>
