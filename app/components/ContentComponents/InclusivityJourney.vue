<script setup lang="ts">
import { defineAsyncComponent, nextTick, onMounted, ref, watch } from "vue";

const JourneyOverlay = defineAsyncComponent(
    () =>
        import("~/components/ContentComponents/inclusivity/InclusivityJourney/JourneyOverlay.client.vue"),
);
const storageKey = "expelliodor-inclusivity-journey-dismissed";
const route = useRoute();
const open = ref(false);
const replay = ref<HTMLButtonElement>();

function dismiss() {
    open.value = false;
    try {
        localStorage.setItem(storageKey, "true");
    } catch {
        // The tour remains usable when browser storage is unavailable.
    }
    nextTick(() => replay.value?.focus({ preventScroll: true }));
}

async function followJourney(destination: string) {
    dismiss();
    await nextTick();
    await navigateTo(destination);
    if (destination.startsWith("/inclusivity#")) {
        await nextTick();
        document.getElementById(destination.split("#")[1]!)?.scrollIntoView();
    }
}

onMounted(() => {
    if (route.path.replace(/\/$/, "") !== "/inclusivity" || route.hash) return;
    try {
        open.value = localStorage.getItem(storageKey) !== "true";
    } catch {
        open.value = true;
    }
});

watch(
    () => route.path,
    () => {
        open.value = false;
    },
);
</script>

<template>
    <div class="inclusivity-replay">
        <p>Every voice can move science forward.</p>
        <button
            ref="replay"
            type="button"
            aria-haspopup="dialog"
            @click="open = true"
        >
            Click to explore the animation <span aria-hidden="true">↗</span>
        </button>
        <ClientOnly>
            <JourneyOverlay
                v-if="open"
                @close="dismiss"
                @navigate="followJourney"
            />
        </ClientOnly>
    </div>
</template>

<style scoped>
.inclusivity-replay {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(1.5rem, 3vw, 2.5rem);
    margin: 1.5rem 0 2.5rem;
    padding: clamp(1.5rem, 4.5vw, 3.5rem);
    background: var(--secondary);
    color: var(--on-secondary);
    border: 2px solid var(--outline-variant);
    border-radius: clamp(1.5rem, 3vw, 3rem);
    font-family: var(--font-belanosima), sans-serif;
}
.inclusivity-replay p {
    margin: 0;
    color: inherit;
    font-size: clamp(1.5rem, 3vw, 2.5rem);
    font-family: var(--font-righteous), sans-serif;
    line-height: 1.3;
}
.inclusivity-replay button {
    display: inline-flex;
    gap: 1.25rem;
    align-items: center;
    border: 0;
    justify-content: center;
    max-width: 100%;
    min-height: 3.5rem;
    border-radius: 999px;
    padding: 1rem 1.75rem;
    background: var(--accent);
    color: var(--on-accent);
    cursor: pointer;
    font: inherit;
    font-size: clamp(1rem, 1.5vw, 1.25rem);
    font-weight: 700;
    line-height: 1.35;
    text-align: left;
    transition: background 0.2s;
}
.inclusivity-replay button:hover {
    background: color-mix(in srgb, var(--accent) 90%, var(--on-accent));
}
.inclusivity-replay button:focus-visible {
    outline: 3px solid var(--primary);
    outline-offset: 5px;
}
.inclusivity-replay button span {
    flex-shrink: 0;
    font-size: 1.5em;
    line-height: 1;
}
@media (prefers-reduced-motion: reduce) {
    .inclusivity-replay button {
        transition: none;
    }
}
</style>
