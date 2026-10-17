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
        <div>
            <p>Every voice can move science forward.</p>
        </div>
        <button
            ref="replay"
            type="button"
            aria-haspopup="dialog"
            @click="open = true"
        >
            Explore our inclusion journey <span aria-hidden="true">↗</span>
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
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin: 1.5rem 0 2.5rem;
    padding: 1.75rem;
    background: #03316d;
    color: #fff;
    border: 2px solid #a8d9f9;
    border-radius: 2rem;
    font-family: var(--font-belanosima), sans-serif;
}
.replay-eyebrow {
    color: #a8d9f9;
    font-size: 0.67rem;
    font-weight: 700;
    letter-spacing: 0.17em;
}
.inclusivity-replay p {
    margin: 0.55rem 0 0;
    font-size: 1.4rem;
    font-family: var(--font-righteous), sans-serif;
    line-height: 1.3;
}
.inclusivity-replay button {
    display: flex;
    gap: 1.25rem;
    align-items: center;
    border: 0;
    border-radius: 2rem;
    padding: 0.9rem 1.25rem;
    background: #ffe45c;
    color: #03316d;
    cursor: pointer;
    font: inherit;
    font-size: 0.85rem;
    font-weight: 700;
}
.inclusivity-replay button:hover {
    background: #ffb145;
}
.inclusivity-replay button:focus-visible {
    outline: 3px solid #fff;
    outline-offset: 5px;
}
</style>
