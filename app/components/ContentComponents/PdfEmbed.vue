<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = withDefaults(
    defineProps<{
        src: string;
        title: string;
        height?: string | number;
    }>(),
    { height: 720 },
);

const preview = ref<HTMLElement | null>(null);
const shouldLoad = ref(false);
let nearViewport = false;
let observer: IntersectionObserver | undefined;
let unloadTimer: ReturnType<typeof setTimeout> | undefined;

const embedUrl = computed(() =>
    props.src.includes("#") ? props.src : `${props.src}#page=1&view=Fit`,
);
const documentUrl = computed(() => props.src.split("#")[0]);
const previewHeight = computed(() =>
    typeof props.height === "number" || /^\d+$/.test(props.height)
        ? `${props.height}px`
        : props.height,
);

function cancelUnload() {
    clearTimeout(unloadTimer);
}

function scheduleUnload() {
    cancelUnload();
    if (nearViewport || !shouldLoad.value) return;
    // Avoid rebuilding the native PDF viewer during a brief scroll away.
    unloadTimer = setTimeout(() => {
        if (!nearViewport && !preview.value?.contains(document.activeElement)) {
            shouldLoad.value = false;
        }
    }, 1500);
}

onMounted(() => {
    if (!preview.value || !("IntersectionObserver" in window)) return;

    observer = new IntersectionObserver(
        ([entry]) => {
            nearViewport = entry?.isIntersecting ?? false;
            if (nearViewport) {
                cancelUnload();
                shouldLoad.value = true;
            } else {
                scheduleUnload();
            }
        },
        // Mount before the preview enters the viewport, including on return.
        { rootMargin: "1000px 0px" },
    );
    observer.observe(preview.value);
});

onBeforeUnmount(() => {
    observer?.disconnect();
    cancelUnload();
});
</script>

<template>
    <figure class="my-6 min-w-0">
        <figcaption
            class="mb-3 flex flex-wrap items-baseline justify-between gap-2"
        >
            <span class="font-semibold">{{ title }}</span>
            <a
                :href="documentUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary focus-visible:outline-primary font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
                Open PDF<span class="sr-only"
                    >: {{ title }} (opens in a new tab)</span
                >
            </a>
        </figcaption>
        <div
            ref="preview"
            class="border-outline bg-surface text-on-surface overflow-hidden rounded-lg border"
            :style="{ height: previewHeight }"
            @focusout="scheduleUnload"
        >
            <iframe
                v-if="shouldLoad"
                :src="embedUrl"
                :title="`${title} (PDF)`"
                width="100%"
                :height="height"
                loading="eager"
                class="block h-full w-full border-0"
            />
            <div v-else class="flex h-full items-center justify-center p-6">
                <button
                    type="button"
                    class="text-primary focus-visible:outline-primary rounded-sm font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
                    :aria-label="`Load PDF preview: ${title}`"
                    @click="shouldLoad = true"
                >
                    Load PDF preview
                </button>
            </div>
        </div>
    </figure>
</template>
