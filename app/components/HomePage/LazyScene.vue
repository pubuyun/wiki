<script setup lang="ts">
import {
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    shallowRef,
    watch,
    type Component,
} from "vue";

type SceneModule = { default: Component };

const props = withDefaults(
    defineProps<{
        loader: () => Promise<SceneModule>;
        enabled?: boolean;
        loadImmediately?: boolean;
        rootMargin?: string;
        minHeight?: string;
    }>(),
    {
        enabled: false,
        loadImmediately: false,
        rootMargin: "200% 0px",
        minHeight: "100svh",
    },
);

const emit = defineEmits<{
    loaded: [];
    error: [error: unknown];
}>();

const gate = ref<HTMLElement | null>(null);
const resolvedScene = shallowRef<Component>();
const isLoading = ref(false);
const loadError = ref<unknown>();

let isMounted = false;
let observer: IntersectionObserver | undefined;
let loadingPromise: Promise<void> | undefined;

function disconnectObserver() {
    observer?.disconnect();
    observer = undefined;
}

function loadScene() {
    if (resolvedScene.value) return Promise.resolve();
    if (loadingPromise) return loadingPromise;

    disconnectObserver();
    isLoading.value = true;
    loadError.value = undefined;

    loadingPromise = props
        .loader()
        .then(async (sceneModule) => {
            resolvedScene.value = sceneModule.default;
            await nextTick();
            emit("loaded");
        })
        .catch((error: unknown) => {
            loadError.value = error;
            emit("error", error);
        })
        .finally(() => {
            isLoading.value = false;
            loadingPromise = undefined;
        });

    return loadingPromise;
}

function armLoader() {
    disconnectObserver();

    if (!isMounted || !props.enabled || resolvedScene.value) return;

    if (
        props.loadImmediately ||
        !("IntersectionObserver" in window) ||
        !gate.value
    ) {
        void loadScene();
        return;
    }

    observer = new IntersectionObserver(
        ([entry]) => {
            if (entry?.isIntersecting) void loadScene();
        },
        { rootMargin: props.rootMargin },
    );
    observer.observe(gate.value);
}

watch(
    () => [props.enabled, props.loadImmediately, props.rootMargin],
    armLoader,
);

onMounted(() => {
    isMounted = true;
    armLoader();
});

onBeforeUnmount(disconnectObserver);
</script>

<template>
    <div ref="gate" :style="{ minHeight }" :aria-busy="isLoading || undefined">
        <component :is="resolvedScene" v-if="resolvedScene" />

        <slot v-else-if="isLoading" name="loading" />

        <slot v-else-if="loadError" name="error" :retry="loadScene">
            <div class="grid min-h-[inherit] place-items-center p-6">
                <button type="button" class="underline" @click="loadScene">
                    Retry loading this scene
                </button>
            </div>
        </slot>
    </div>
</template>
