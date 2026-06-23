<template>
    <Transition name="fade">
        <div
            v-if="isLoading"
            class="bg-primary-deep fixed inset-0 z-9999 flex items-center justify-center backdrop-blur-sm"
        >
            <img
                v-if="isImageReady"
                :src="loadingImageUrl"
                alt="Loading"
                class="h-96"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
            />
            <span class="sr-only">Loading...</span>
        </div>
    </Transition>
</template>

<script setup lang="ts">
const { isLoading } = useLoadingIndicator();

const loadingImageUrl =
    "https://static.igem.wiki/teams/6133/wiki/general/loading.webp";
const isImageReady = ref(false);

let loadImageAfterPageLoad: (() => void) | undefined;

onMounted(() => {
    loadImageAfterPageLoad = () => {
        const image = new Image();

        image.decoding = "async";
        image.setAttribute("fetchpriority", "low");
        image.onload = () => {
            isImageReady.value = true;
        };
        image.src = loadingImageUrl;
    };

    if (document.readyState === "complete") {
        loadImageAfterPageLoad();
    } else {
        window.addEventListener("load", loadImageAfterPageLoad, { once: true });
    }
});

onBeforeUnmount(() => {
    if (loadImageAfterPageLoad) {
        window.removeEventListener("load", loadImageAfterPageLoad);
    }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
