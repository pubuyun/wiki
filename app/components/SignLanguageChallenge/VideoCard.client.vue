<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { loadSignVideo } from "~/composables/useSequentialSignVideoLoader.client";

const props = defineProps<{
    videoId: string;
    index: number;
    assignment?: { id: string; label: string };
    isCorrect: boolean;
    hasError: boolean;
}>();

const emit = defineEmits<{
    place: [wordId: string];
    remove: [];
}>();

const card = ref<HTMLElement>();
const animationImage = ref<HTMLImageElement>();
const visibleSource = ref<string>();
const pausedFrame = ref<string>();
const loadState = ref<"idle" | "loading" | "loaded" | "error">("idle");
const isPaused = ref(false);
const animationRun = ref(0);
let observer: IntersectionObserver | undefined;
let visibilityFrame: number | undefined;

function stopVisibilityTracking() {
    observer?.disconnect();
    document.removeEventListener("scroll", scheduleVisibilityCheck, true);
    document.removeEventListener("click", scheduleVisibilityCheck);
    window.removeEventListener("resize", scheduleVisibilityCheck);
    if (visibilityFrame !== undefined) cancelAnimationFrame(visibilityFrame);
    visibilityFrame = undefined;
}

function checkVisibility() {
    visibilityFrame = undefined;
    const rect = card.value?.getBoundingClientRect();
    if (
        rect &&
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom >= -600 &&
        rect.top <= window.innerHeight + 600
    ) {
        void load();
    }
}

function scheduleVisibilityCheck() {
    if (visibilityFrame !== undefined || loadState.value !== "idle") return;
    visibilityFrame = requestAnimationFrame(checkVisibility);
}

async function load() {
    if (loadState.value === "loading" || loadState.value === "loaded") return;
    loadState.value = "loading";
    stopVisibilityTracking();

    try {
        visibleSource.value = await loadSignVideo(props.videoId);
        isPaused.value = false;
        pausedFrame.value = undefined;
        loadState.value = "loaded";
    } catch {
        loadState.value = "error";
    }
}

function pauseAnimation() {
    const image = animationImage.value;
    if (!image?.naturalWidth || !image.naturalHeight) return;

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    pausedFrame.value = canvas.toDataURL("image/png");
    isPaused.value = true;
}

function playAnimation() {
    isPaused.value = false;
    pausedFrame.value = undefined;
    animationRun.value += 1;
}

function togglePlayback() {
    if (isPaused.value) playAnimation();
    else pauseAnimation();
}

function onDrop(event: DragEvent) {
    if (props.isCorrect) return;
    const wordId = event.dataTransfer?.getData("text/plain");
    if (wordId) emit("place", wordId);
}

function onDragStart(event: DragEvent) {
    if (!props.assignment || props.isCorrect || !event.dataTransfer) {
        event.preventDefault();
        return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", props.assignment.id);
}

function activateSlot() {
    if (props.isCorrect) return;
    if (props.assignment) emit("remove");
    else emit("place", "");
}

onMounted(() => {
    document.addEventListener("scroll", scheduleVisibilityCheck, true);
    document.addEventListener("click", scheduleVisibilityCheck);
    window.addEventListener("resize", scheduleVisibilityCheck);
    scheduleVisibilityCheck();

    if (typeof window.IntersectionObserver === "function") {
        observer = new window.IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) void load();
            },
            { rootMargin: "600px 0px" },
        );
        if (card.value) observer.observe(card.value);
    }
});

onBeforeUnmount(stopVisibilityTracking);
</script>

<template>
    <article
        ref="card"
        class="overflow-hidden rounded-2xl border bg-surface-bright shadow-sm transition-colors"
        :class="
            hasError
                ? 'border-red-500 ring-2 ring-red-500/35'
                : isCorrect
                  ? 'border-emerald-500'
                  : 'border-outline-variant/45'
        "
    >
        <div
            class="group relative grid aspect-[4/3] w-full place-items-center overflow-hidden bg-secondary text-on-secondary"
            :aria-busy="loadState === 'loading'"
        >
            <img
                v-if="visibleSource && !isPaused"
                :key="animationRun"
                ref="animationImage"
                :src="visibleSource"
                alt=""
                class="size-full object-contain p-3"
                draggable="false"
            />
            <img
                v-else-if="pausedFrame"
                :src="pausedFrame"
                alt=""
                class="size-full object-contain p-3"
                draggable="false"
            />
            <span
                v-else-if="loadState === 'error'"
                class="flex flex-col items-center gap-2 px-4 text-sm"
            >
                <Icon icon="lucide:circle-alert" class="size-7" />
                Animation unavailable
            </span>
            <span v-else class="flex flex-col items-center gap-2 text-sm">
                <Icon icon="lucide:loader-circle" class="size-7 animate-spin" />
                {{ loadState === "idle" ? "Waiting to load" : "Loading" }}
            </span>
            <span
                v-if="loadState === 'loaded'"
                class="absolute right-3 bottom-3"
            >
                <button
                    type="button"
                    class="grid size-10 place-items-center rounded-full border border-outline-variant bg-surface/90 text-on-surface shadow-md transition-transform outline-none hover:scale-105 focus-visible:ring-3 focus-visible:ring-outline focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                    :aria-label="`${isPaused ? 'Play' : 'Pause'} sign ${index + 1} animation`"
                    :aria-pressed="isPaused"
                    :title="isPaused ? 'Play' : 'Pause'"
                    @click="togglePlayback"
                >
                    <Icon
                        :icon="isPaused ? 'lucide:play' : 'lucide:pause'"
                        class="size-5"
                        aria-hidden="true"
                    />
                </button>
            </span>
            <button
                v-else-if="loadState === 'error'"
                type="button"
                class="absolute right-3 bottom-3 rounded-full border border-outline-variant bg-surface px-3 py-2 text-xs font-semibold text-on-surface outline-none focus-visible:ring-3 focus-visible:ring-outline"
                :aria-label="`Retry loading sign ${index + 1} animation`"
                @click="load"
            >
                Retry
            </button>
        </div>

        <div class="p-3">
            <div class="mb-2 flex items-center justify-between gap-2 text-xs">
                <span class="font-semibold text-on-surface/70">
                    Sign {{ index + 1 }}
                </span>
                <span
                    v-if="isCorrect"
                    class="flex items-center gap-1 text-emerald-700 dark:text-emerald-300"
                >
                    <Icon icon="lucide:circle-check" class="size-4" />
                    Correct
                </span>
                <span
                    v-else-if="hasError"
                    class="flex items-center gap-1 font-semibold text-red-700 dark:text-red-300"
                >
                    <Icon icon="lucide:circle-x" class="size-4" />
                    Try again
                </span>
            </div>

            <div
                role="button"
                :tabindex="isCorrect ? -1 : 0"
                :draggable="Boolean(assignment && !isCorrect)"
                class="flex min-h-12 items-center justify-center rounded-xl border-2 border-dashed px-3 py-2 text-center text-sm font-semibold transition-colors outline-none focus-visible:border-solid focus-visible:ring-4 focus-visible:ring-outline focus-visible:ring-offset-4 focus-visible:ring-offset-surface-bright"
                :class="[
                    isCorrect
                        ? 'border-emerald-500 bg-emerald-500/15 text-on-surface'
                        : hasError
                          ? 'border-red-500 bg-red-500/10 text-red-800 dark:text-red-200'
                          : assignment
                            ? 'border-primary bg-primary text-on-primary'
                            : 'border-outline-variant bg-surface text-on-surface/65 hover:border-primary hover:bg-primary/10',
                ]"
                :aria-label="
                    assignment
                        ? `${assignment.label} in answer slot for sign ${index + 1}. ${isCorrect ? 'Correct.' : 'Press to return it to the word bank.'}`
                        : `Empty answer slot for sign ${index + 1}. Press to place the selected word.`
                "
                :aria-invalid="hasError || undefined"
                @click="activateSlot"
                @keydown.enter.prevent="activateSlot"
                @keydown.space.prevent="activateSlot"
                @dragstart="onDragStart"
                @dragover.prevent
                @drop.prevent="onDrop"
            >
                <span v-if="assignment">{{ assignment.label }}</span>
                <span v-else>Drop or place a word here</span>
            </div>
        </div>
    </article>
</template>
