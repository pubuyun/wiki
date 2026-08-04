<template>
    <Transition name="fade" @after-leave="handleLoadingAfterLeave">
        <div
            v-if="showLoading"
            class="fixed inset-0 z-9999 flex items-center justify-center bg-surface backdrop-blur-sm"
            role="status"
            aria-live="polite"
        >
            <div class="flex flex-col items-center">
                <p
                    class="mb-6 font-righteous text-4xl font-bold tracking-widest text-on-surface"
                >
                    Loading...
                </p>

                <img
                    ref="loadingImage"
                    :src="loadingImageUrl"
                    class="h-96"
                    alt=""
                    decoding="async"
                    fetchpriority="high"
                    @load="handleLoadingImageLoad"
                    @error="handleLoadingImageError"
                />
            </div>
            <span class="sr-only">Loading...</span>
        </div>
    </Transition>
</template>

<script setup>
const MIN_INITIAL_ANIMATION_MS = 600;

const showLoading = ref(true);
const canShowRouteLoading = ref(false);
const isLoadingImageLoaded = ref(false);
const isLoadingImageSettled = ref(false);
const isInitialLoading = ref(true);
const isInitialPageReady = ref(false);
const shouldSkipRouteLoading = ref(false);
const loadingImage = ref(null);
const isInitialLoadingComplete = useState(
    "initial-loading-complete",
    () => false,
);

const nuxtApp = useNuxtApp();
const router = useRouter();

const loadingImageUrl =
    "https://static.igem.wiki/teams/6133/wiki/general/loading.webp";

useHead({
    link: [
        {
            rel: "preload",
            as: "image",
            href: loadingImageUrl,
            fetchpriority: "high",
        },
    ],
});

let initialAnimationStartedAt = 0;
let initialLoadingTimer;

const finishInitialLoading = () => {
    if (
        !isInitialLoading.value ||
        !isInitialPageReady.value ||
        !isLoadingImageSettled.value
    ) {
        return;
    }

    const remainingTime = Math.max(
        0,
        MIN_INITIAL_ANIMATION_MS -
            (performance.now() - initialAnimationStartedAt),
    );

    window.clearTimeout(initialLoadingTimer);
    initialLoadingTimer = window.setTimeout(() => {
        isInitialLoading.value = false;
        showLoading.value = false;
    }, remainingTime);
};

const handleLoadingImageLoad = () => {
    if (initialAnimationStartedAt === 0) {
        initialAnimationStartedAt = performance.now();
    }

    isLoadingImageLoaded.value = true;
    isLoadingImageSettled.value = true;
    finishInitialLoading();
};

const handleLoadingImageError = () => {
    if (initialAnimationStartedAt === 0) {
        initialAnimationStartedAt = performance.now();
    }

    isLoadingImageSettled.value = true;
    finishInitialLoading();
};

const handleLoadingAfterLeave = () => {
    if (!isInitialLoading.value) {
        isInitialLoadingComplete.value = true;
    }
};

const categoryFromPath = (path) => {
    const [category] = path
        .split("?")[0]
        .split("#")[0]
        .split("/")
        .filter(Boolean);

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
    if (initialAnimationStartedAt === 0) {
        initialAnimationStartedAt = performance.now();
    }

    if (loadingImage.value?.complete) {
        if (loadingImage.value.naturalWidth > 0) {
            handleLoadingImageLoad();
        } else {
            handleLoadingImageError();
        }
    }

    await router.isReady();

    canShowRouteLoading.value = true;

    onNuxtReady(() => {
        isInitialPageReady.value = true;
        finishInitialLoading();
    });
});

onBeforeUnmount(() => {
    window.clearTimeout(initialLoadingTimer);
});

router.beforeEach((to, from) => {
    shouldSkipRouteLoading.value = isSameCategoryContentNavigation(to, from);
});

nuxtApp.hook("page:loading:start", () => {
    if (shouldSkipRouteLoading.value) {
        showLoading.value = false;
        return;
    }

    if (canShowRouteLoading.value && isLoadingImageLoaded.value) {
        showLoading.value = true;
    }
});

nuxtApp.hook("page:loading:end", () => {
    if (isInitialLoading.value) {
        isInitialPageReady.value = true;
        finishInitialLoading();
        return;
    }

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
