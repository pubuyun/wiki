<template>
    <Transition name="fade">
        <div
            v-if="showLoading && isLoadingImageLoaded"
            class="fixed inset-0 z-9999 flex items-center justify-center bg-primary-bg backdrop-blur-sm"
        >
            <img :src="loadingImageUrl" class="h-96" />
            <span class="sr-only">Loading...</span>
        </div>
    </Transition>
</template>

<script setup lang="ts">
const showLoading = ref(false);
const canShowRouteLoading = ref(false);
const isLoadingImageLoaded = ref(false);

const nuxtApp = useNuxtApp();
const router = useRouter();

const loadingImageUrl =
    "https://static.igem.wiki/teams/6133/wiki/general/loading.webp";

const preloadLoadingImage = () => {
    const image = new Image();

    image.decoding = "async";
    image.onload = () => {
        isLoadingImageLoaded.value = true;
    };
    image.src = loadingImageUrl;
};

const runWhenIdle = (callback: () => void) => {
    if ("requestIdleCallback" in window) {
        window.requestIdleCallback(callback, { timeout: 3000 });
    } else {
        window.setTimeout(callback, 1000);
    }
};

onMounted(async () => {
    await router.isReady();

    canShowRouteLoading.value = true;

    onNuxtReady(() => {
        runWhenIdle(preloadLoadingImage);
    });
});

nuxtApp.hook("page:loading:start", () => {
    if (canShowRouteLoading.value && isLoadingImageLoaded.value) {
        showLoading.value = true;
    }
});

nuxtApp.hook("page:loading:end", () => {
    showLoading.value = false;
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
