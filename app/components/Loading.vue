<template>
    <Transition name="fade">
        <div
            v-if="showLoading && isLoadingImageLoaded"
            class="fixed inset-0 z-9999 flex items-center justify-center bg-surface-page backdrop-blur-sm"
        >
            <div class="flex flex-col items-center">
                <p
                    class="mb-6 font-righteous text-4xl font-bold tracking-widest text-text-inverse"
                >
                    Loading...
                </p>

                <img :src="loadingImageUrl" class="h-96" />
            </div>
            <span class="sr-only">Loading...</span>
        </div>
    </Transition>
</template>

<script setup>
const showLoading = ref(false);
const canShowRouteLoading = ref(false);
const isLoadingImageLoaded = ref(false);
const shouldSkipRouteLoading = ref(false);

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

const runWhenIdle = (callback) => {
    if ("requestIdleCallback" in window) {
        window.requestIdleCallback(callback, { timeout: 3000 });
    } else {
        window.setTimeout(callback, 1000);
    }
};

const categoryFromPath = (path) => {
    const [category] = path.split("?")[0].split("#")[0].split("/").filter(Boolean);

    return category ?? "";
};

const isSameCategoryContentNavigation = (to, from) => {
    if (!from.matched.length || to.path === from.path) {
        return false;
    }

    const toCategory = categoryFromPath(to.path);
    const fromCategory = categoryFromPath(from.path);

    return Boolean(toCategory && toCategory === fromCategory);
};

onMounted(async () => {
    await router.isReady();

    canShowRouteLoading.value = true;

    onNuxtReady(() => {
        runWhenIdle(preloadLoadingImage);
    });
});

router.beforeEach((to, from) => {
    shouldSkipRouteLoading.value = isSameCategoryContentNavigation(to, from);
});

nuxtApp.hook("page:loading:start", () => {
    if (shouldSkipRouteLoading.value) {
        showLoading.value = false;
        return;
    }

    if (
        canShowRouteLoading.value &&
        isLoadingImageLoaded.value
    ) {
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
