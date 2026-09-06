<template>
    <Transition
        :name="loadingTransitionName"
        @after-leave="handleLoadingAfterLeave"
    >
        <div
            v-if="showLoading"
            class="site-loading fixed inset-0 z-9999"
            :class="{ 'site-loading--home': isHomeOpening }"
            :role="isHomeOpening ? 'progressbar' : 'status'"
            aria-live="polite"
            aria-label="Loading page"
            :aria-valuemin="isHomeOpening ? 0 : undefined"
            :aria-valuemax="isHomeOpening ? 100 : undefined"
            :aria-valuenow="isHomeOpening ? displayedProgress : undefined"
        >
            <template v-if="isHomeOpening">
                <div ref="homeFill" class="home-loader__fill" />
                <div class="home-loader__readout" aria-hidden="true">
                    <span class="home-loader__percentage"
                        >{{ displayedProgress }}%</span
                    >
                    <p ref="homeWordmark" class="home-loader__wordmark">
                        <span
                            v-for="(character, index) in loaderCharacters"
                            :key="`${character}-${index}`"
                            class="home-loader__character"
                            >{{ character }}</span
                        >
                        <span class="home-loader__caret" aria-hidden="true" />
                    </p>
                </div>
                <div ref="homeErase" class="home-loader__erase" />
                <span class="sr-only">Loading {{ displayedProgress }}%</span>
            </template>

            <div v-else class="route-loader">
                <p class="route-loader__label">Loading...</p>
                <img
                    ref="loadingImage"
                    :src="loadingImageUrl"
                    class="route-loader__image"
                    alt=""
                    decoding="async"
                    fetchpriority="high"
                    @load="handleLoadingImageLoad"
                    @error="handleLoadingImageError"
                />
                <span class="sr-only">Loading...</span>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { gsap } from "gsap";

const MIN_INITIAL_ANIMATION_MS = 600;
const route = useRoute();
const initialRouteIsHome = route.path === "/";

const showLoading = ref(true);
const canShowRouteLoading = ref(false);
const isLoadingImageLoaded = ref(false);
const isLoadingImageSettled = ref(false);
const isInitialLoading = ref(true);
const isInitialPageReady = ref(false);
const shouldSkipRouteLoading = ref(false);
const displayedProgress = ref(0);
const loadingImage = ref<HTMLImageElement>();
const homeFill = ref<HTMLElement>();
const homeErase = ref<HTMLElement>();
const homeWordmark = ref<HTMLElement>();
const isInitialLoadingComplete = useState(
    "initial-loading-complete",
    () => false,
);

const nuxtApp = useNuxtApp();
const router = useRouter();
const loaderCharacters = Array.from("Expelliodor");
const loadingImageUrl =
    "https://static.igem.wiki/teams/6133/wiki/general/loading.webp";
const isHomeOpening = computed(
    () => initialRouteIsHome && isInitialLoading.value,
);
const loadingTransitionName = computed(() =>
    isHomeOpening.value ? "home-loading" : "fade",
);

if (!initialRouteIsHome) {
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
}

let initialAnimationStartedAt = 0;
let initialLoadingTimer: ReturnType<typeof window.setTimeout> | undefined;
let loaderTimeline: gsap.core.Timeline | undefined;
let loaderSequenceReady = false;
let loaderExitStarted = false;

function updateProgress(value: number) {
    displayedProgress.value = Math.min(100, Math.round(value));
}

function finishHomeLoader() {
    if (
        !isHomeOpening.value ||
        !isInitialPageReady.value ||
        !loaderSequenceReady ||
        loaderExitStarted
    )
        return;

    loaderExitStarted = true;
    const progress = { value: displayedProgress.value };
    loaderTimeline = gsap
        .timeline({
            onComplete: () => {
                showLoading.value = false;
            },
        })
        .to(progress, {
            value: 100,
            duration: 0.28,
            ease: "power2.out",
            onUpdate: () => updateProgress(progress.value),
        })
        .to(
            homeFill.value,
            {
                scaleX: 1.015,
                duration: 0.28,
                ease: "power2.out",
            },
            "<",
        )
        .to(
            homeErase.value,
            {
                scaleX: 1.015,
                duration: 0.66,
                ease: "power3.inOut",
            },
            "+=0.08",
        );
}

function startHomeLoader() {
    const characters = homeWordmark.value?.querySelectorAll<HTMLElement>(
        ".home-loader__character",
    );
    const caret = homeWordmark.value?.querySelector<HTMLElement>(
        ".home-loader__caret",
    );
    if (!homeFill.value || !homeErase.value || !characters?.length) return;

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;
    gsap.set(homeFill.value, { scaleX: reduceMotion ? 1.015 : 0 });
    gsap.set(homeErase.value, { scaleX: 0 });
    gsap.set(characters, {
        display: reduceMotion ? "inline-block" : "none",
        opacity: reduceMotion ? 1 : 0,
    });
    if (caret) gsap.set(caret, { opacity: reduceMotion ? 0 : 1 });

    if (reduceMotion) {
        updateProgress(100);
        loaderSequenceReady = true;
        finishHomeLoader();
        return;
    }

    const progress = { value: 0 };
    const timeline = gsap.timeline({
        onComplete: () => {
            loaderSequenceReady = true;
            finishHomeLoader();
        },
    });
    loaderTimeline = timeline;
    timeline.to(
        progress,
        {
            value: 72,
            duration: 0.9,
            ease: "power1.out",
            onUpdate: () => updateProgress(progress.value),
        },
        0,
    );
    timeline
        .to(
            homeFill.value,
            {
                scaleX: 0.72,
                duration: 0.9,
                ease: "power2.inOut",
            },
            0,
        )
        .to(
            characters,
            {
                display: "inline-block",
                opacity: 1,
                duration: 0.001,
                stagger: 0.055,
                ease: "none",
            },
            0.12,
        )
        .to(
            caret,
            {
                opacity: 0,
                duration: 0.1,
                ease: "none",
            },
            ">+=0.12",
        )
        .to(progress, {
            value: 92,
            duration: 0.58,
            ease: "power1.inOut",
            onUpdate: () => updateProgress(progress.value),
        })
        .to(
            homeFill.value,
            {
                scaleX: 0.92,
                duration: 0.58,
                ease: "power1.inOut",
            },
            "<",
        );
}

function finishInitialLoading() {
    if (!isInitialLoading.value || !isInitialPageReady.value) return;
    if (isHomeOpening.value) {
        finishHomeLoader();
        return;
    }
    if (!isLoadingImageSettled.value) return;

    const remainingTime = Math.max(
        0,
        MIN_INITIAL_ANIMATION_MS -
            (performance.now() - initialAnimationStartedAt),
    );
    window.clearTimeout(initialLoadingTimer);
    initialLoadingTimer = window.setTimeout(() => {
        showLoading.value = false;
    }, remainingTime);
}

function handleLoadingImageLoad() {
    if (initialAnimationStartedAt === 0)
        initialAnimationStartedAt = performance.now();
    isLoadingImageLoaded.value = true;
    isLoadingImageSettled.value = true;
    finishInitialLoading();
}

function handleLoadingImageError() {
    if (initialAnimationStartedAt === 0)
        initialAnimationStartedAt = performance.now();
    isLoadingImageSettled.value = true;
    finishInitialLoading();
}

function preloadRouteLoadingImage() {
    if (isLoadingImageSettled.value) return;
    const image = new Image();
    image.decoding = "async";
    image.onload = handleLoadingImageLoad;
    image.onerror = handleLoadingImageError;
    image.src = loadingImageUrl;
}

function handleLoadingAfterLeave() {
    if (!isInitialLoading.value) return;
    isInitialLoading.value = false;
    isInitialLoadingComplete.value = true;

    if (initialRouteIsHome) {
        if (window.requestIdleCallback)
            window.requestIdleCallback(preloadRouteLoadingImage);
        else window.setTimeout(preloadRouteLoadingImage, 1);
    }
}

function categoryFromPath(path: string) {
    const [category] = path
        .split("?")[0]!
        .split("#")[0]!
        .split("/")
        .filter(Boolean);
    return category ?? "";
}

function isSameCategoryContentNavigation(to: typeof route, from: typeof route) {
    if (!from.matched.length || to.path === from.path) return false;
    const toCategory = categoryFromPath(to.path);
    const fromCategory = categoryFromPath(from.path);
    return Boolean(toCategory && toCategory === fromCategory);
}

onMounted(async () => {
    initialAnimationStartedAt = performance.now();
    if (initialRouteIsHome) startHomeLoader();
    else if (loadingImage.value?.complete) {
        if (loadingImage.value.naturalWidth > 0) handleLoadingImageLoad();
        else handleLoadingImageError();
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
    loaderTimeline?.kill();
});

router.beforeEach((to, from) => {
    shouldSkipRouteLoading.value = isSameCategoryContentNavigation(to, from);
});

nuxtApp.hook("page:loading:start", () => {
    if (shouldSkipRouteLoading.value) {
        showLoading.value = false;
        return;
    }
    if (canShowRouteLoading.value && isLoadingImageLoaded.value)
        showLoading.value = true;
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
.site-loading {
    --home-loader-background: #03316d;
    --home-loader-foreground: #347ed1;
    --home-loader-ink: #fffff8;

    overflow: hidden;
    background: var(--home-loader-background);
}
.home-loader__fill,
.home-loader__erase {
    position: absolute;
    inset: 0;
    transform: scaleX(0);
    transform-origin: left center;
    will-change: transform;
}
.home-loader__fill {
    z-index: 1;
    background: var(--home-loader-foreground);
}
.home-loader__erase {
    z-index: 3;
    background: var(--home-loader-background);
}
.home-loader__readout {
    position: absolute;
    z-index: 2;
    inset: 0;
    color: var(--home-loader-ink);
    font-family: var(--font-momo-trust-display), sans-serif;
}
.home-loader__percentage {
    position: absolute;
    top: 50%;
    left: clamp(1.5rem, 4vw, 5rem);
    min-width: 3ch;
    transform: translateY(-50%);
    font-family: var(--font-righteous), sans-serif;
    font-size: clamp(1.5rem, 3vw, 3.25rem);
    font-variant-numeric: tabular-nums;
    line-height: 1;
}
.home-loader__wordmark {
    position: absolute;
    top: 50%;
    left: 50%;
    margin: 0;
    transform: translate(-50%, -50%);
    white-space: nowrap;
    font-size: clamp(2rem, 5.4vw, 6rem);
    line-height: 1;
    letter-spacing: -0.035em;
}
.home-loader__character {
    display: none;
    opacity: 0;
    will-change: opacity;
}
.home-loader__caret {
    display: inline-block;
    width: 0.075em;
    height: 0.78em;
    margin-left: 0.08em;
    background: currentColor;
    vertical-align: -0.04em;
    animation: loader-caret-blink 0.64s steps(1, end) infinite;
    will-change: opacity;
}
@keyframes loader-caret-blink {
    0%,
    48% {
        visibility: visible;
    }
    49%,
    100% {
        visibility: hidden;
    }
}
.route-loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: var(--color-on-surface);
    background: var(--color-surface);
    backdrop-filter: blur(0.25rem);
}
.route-loader__label {
    margin: 0 0 1.5rem;
    font-family: var(--font-righteous), sans-serif;
    font-size: 2.25rem;
    font-weight: 700;
    letter-spacing: 0.12em;
}
.route-loader__image {
    height: 24rem;
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
.home-loading-leave-active {
    transition: none;
}

@media (max-width: 40rem) {
    .home-loader__percentage {
        top: auto;
        bottom: 2rem;
        transform: none;
    }
    .home-loader__wordmark {
        font-size: clamp(2rem, 12vw, 4rem);
    }
}
@media (prefers-reduced-motion: reduce) {
    .home-loading-leave-active {
        transition: opacity 0.12s linear;
    }
    .home-loading-leave-to {
        opacity: 0;
    }
}
</style>
