<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps<{
    src: string;
    title: string;
    aspectRatio: "16 / 9" | "4 / 5";
}>();

const panel = ref<HTMLElement | null>(null);
const fullscreenButton = ref<HTMLButtonElement | null>(null);
const shouldLoad = ref(false);
const isFullscreen = ref(false);
const supportsFullscreen = ref(false);
const statusMessage = ref("");
let observer: IntersectionObserver | undefined;

const embedUrl = computed(() => {
    // Preserve the video address and configure only the embedded player UI.
    const url = new URL(props.src);
    for (const [key, value] of Object.entries({
        loop: "1",
        autoplay: "0",
        title: "0",
        warningTitle: "0",
        controlBar: "0",
        peertubeLink: "0",
        p2p: "0",
    })) {
        url.searchParams.set(key, value);
    }
    return url.href;
});

function loadVideo() {
    shouldLoad.value = true;
    observer?.disconnect();
}

function updateFullscreen() {
    const wasFullscreen = isFullscreen.value;
    isFullscreen.value = document.fullscreenElement === panel.value;
    if (wasFullscreen || isFullscreen.value) {
        void nextTick(() => fullscreenButton.value?.focus());
    }
}

async function toggleFullscreen() {
    if (!panel.value) return;
    loadVideo();
    try {
        if (document.fullscreenElement === panel.value) {
            await document.exitFullscreen();
        } else {
            await panel.value.requestFullscreen();
        }
        statusMessage.value = "";
    } catch {
        statusMessage.value = "Fullscreen is unavailable in this browser.";
    }
}

onMounted(() => {
    supportsFullscreen.value = document.fullscreenEnabled;
    document.addEventListener("fullscreenchange", updateFullscreen);
    if (!("IntersectionObserver" in window) || !panel.value) {
        loadVideo();
        return;
    }
    // Begin several screens ahead; the iframe must not apply a second lazy gate.
    observer = new IntersectionObserver(
        ([entry]) => {
            if (entry?.isIntersecting) loadVideo();
        },
        { rootMargin: "3000px 0px" },
    );
    observer.observe(panel.value);
});

onBeforeUnmount(() => {
    observer?.disconnect();
    document.removeEventListener("fullscreenchange", updateFullscreen);
});
</script>

<template>
    <div
        ref="panel"
        class="video-panel rounded-2xl focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-outline"
        :style="{ aspectRatio }"
    >
        <!-- Center portrait content inside PeerTube's 16:9 player. -->
        <iframe
            v-if="shouldLoad"
            :src="embedUrl"
            :title="title"
            width="560"
            height="315"
            allow="fullscreen"
            allowfullscreen
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            loading="eager"
            :style="{
                width:
                    aspectRatio === '4 / 5'
                        ? `${(16 / 9 / (4 / 5)) * 100}%`
                        : '100%',
            }"
            class="video-panel__frame"
        />
        <slot />
        <button
            v-if="supportsFullscreen"
            ref="fullscreenButton"
            type="button"
            class="video-panel__fullscreen focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            :aria-label="`${isFullscreen ? 'Exit' : 'Enter'} fullscreen: ${title}`"
            :aria-pressed="isFullscreen"
            @click.stop="toggleFullscreen"
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
            >
                <path
                    v-if="!isFullscreen"
                    d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"
                />
                <path v-else d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" />
            </svg>
        </button>
        <span class="sr-only" role="status">{{ statusMessage }}</span>
    </div>
</template>

<style scoped>
.video-panel {
    position: relative;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    background: #111;
}

.video-panel__frame {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 50%;
    display: block;
    height: 100%;
    border: 0;
    transform: translateX(-50%);
}

.video-panel__fullscreen {
    position: absolute;
    inset: auto 0.5rem 0.5rem auto;
    display: grid;
    place-items: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;
    background: rgb(0 0 0 / 70%);
    color: #fff;
    cursor: pointer;
}

.video-panel__fullscreen svg {
    width: 1.25rem;
    height: 1.25rem;
}

.video-panel:fullscreen {
    width: 100%;
    height: 100%;
    border-radius: 0;
}

.video-panel:fullscreen .video-panel__frame {
    width: 100% !important;
}
</style>
