<script setup lang="ts">
import { Icon } from "@iconify/vue";
import {
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogOverlay,
    AlertDialogPortal,
    AlertDialogRoot,
    AlertDialogTitle,
} from "reka-ui";

const MIN_TABLET_WIDTH = 600;
const MIN_TABLET_ASPECT_RATIO = 0.62;
const MAX_TABLET_ASPECT_RATIO = 0.85;

const open = ref(false);
const hasPrompted = ref(false);
const hasContinuedOnPortrait = ref(false);

let portraitQuery: MediaQueryList | undefined;

function isPortraitTabletLikeDevice() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;

    return (
        navigator.maxTouchPoints > 0 &&
        portraitQuery?.matches === true &&
        width >= MIN_TABLET_WIDTH &&
        aspectRatio >= MIN_TABLET_ASPECT_RATIO &&
        aspectRatio <= MAX_TABLET_ASPECT_RATIO
    );
}

function updatePromptVisibility() {
    if (!isPortraitTabletLikeDevice()) {
        open.value = false;
        return;
    }

    if (!hasPrompted.value && !hasContinuedOnPortrait.value) {
        hasPrompted.value = true;
        open.value = true;
    }
}

function continueOnPortrait() {
    hasContinuedOnPortrait.value = true;
    open.value = false;
}

onMounted(() => {
    portraitQuery = window.matchMedia("(orientation: portrait)");
    portraitQuery.addEventListener("change", updatePromptVisibility);
    window.addEventListener("resize", updatePromptVisibility, {
        passive: true,
    });

    updatePromptVisibility();
});

onBeforeUnmount(() => {
    portraitQuery?.removeEventListener("change", updatePromptVisibility);
    window.removeEventListener("resize", updatePromptVisibility);
});
</script>

<template>
    <AlertDialogRoot v-model:open="open">
        <AlertDialogPortal>
            <AlertDialogOverlay
                class="portrait-alert-overlay fixed inset-0 z-[2147483646] bg-[#011d42]/72 backdrop-blur-sm"
            />
            <AlertDialogContent
                class="portrait-alert-content fixed top-1/2 left-1/2 z-[2147483647] w-[min(90vw,30rem)] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-white/20 bg-[#03316d] px-7 py-9 text-center text-white shadow-2xl outline-none sm:px-10 sm:py-11"
            >
                <div
                    class="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-white/12 ring-1 ring-white/25"
                    aria-hidden="true"
                >
                    <Icon icon="lucide:refresh-cw" class="size-10" />
                </div>

                <AlertDialogTitle
                    class="font-righteous text-2xl leading-tight sm:text-3xl"
                >
                    Best viewed in landscape
                </AlertDialogTitle>
                <AlertDialogDescription
                    class="mx-auto mt-4 max-w-sm text-base leading-relaxed text-white/78 sm:text-lg"
                >
                    Rotate your device to landscape for the best experience with
                    this interactive page.
                </AlertDialogDescription>

                <AlertDialogAction
                    type="button"
                    class="mt-8 inline-flex cursor-pointer items-center justify-center rounded-full bg-white px-7 py-3 font-righteous text-base text-[#03316d] shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-95 sm:text-lg"
                    @click="continueOnPortrait"
                >
                    Continue on portrait
                </AlertDialogAction>
            </AlertDialogContent>
        </AlertDialogPortal>
    </AlertDialogRoot>
</template>

<style scoped>
.portrait-alert-overlay[data-state="open"] {
    animation: portrait-alert-fade-in 180ms ease-out;
}

.portrait-alert-overlay[data-state="closed"] {
    animation: portrait-alert-fade-out 140ms ease-in;
}

.portrait-alert-content[data-state="open"] {
    animation: portrait-alert-enter 220ms ease-out;
}

.portrait-alert-content[data-state="closed"] {
    animation: portrait-alert-leave 140ms ease-in;
}

@keyframes portrait-alert-fade-in {
    from {
        opacity: 0;
    }
}

@keyframes portrait-alert-fade-out {
    to {
        opacity: 0;
    }
}

@keyframes portrait-alert-enter {
    from {
        opacity: 0;
        transform: translate(-50%, -48%) scale(0.96);
    }
}

@keyframes portrait-alert-leave {
    to {
        opacity: 0;
        transform: translate(-50%, -48%) scale(0.98);
    }
}

@media (prefers-reduced-motion: reduce) {
    .portrait-alert-overlay,
    .portrait-alert-content {
        animation: none !important;
    }
}
</style>
