<script setup lang="ts">
import { Icon } from "@iconify/vue";
import DarkModeToggle from "./AccessibilityMenu/DarkModeToggle.vue";
import ColorblindModeToggle from "./AccessibilityMenu/ColorblindModeToggle.vue";
import DyslexiaModeToggle from "./AccessibilityMenu/DyslexiaModeToggle.vue";

const isOpen = ref(false);
</script>

<template>
    <aside
        class="fixed right-4 bottom-4 z-50"
        aria-label="Accessibility options"
    >
        <div class="grid grid-cols-2 gap-2">
            <!-- bottom-right -->
            <button
                type="button"
                class="flex size-12 items-center justify-center rounded-full border-[3px] bg-primary text-on-primary shadow-lg transition-[transform,border-color] hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
                style="grid-area: 2 / 2"
                :class="isOpen ? 'border-secondary' : 'border-transparent'"
                :aria-expanded="isOpen"
                :aria-label="
                    isOpen
                        ? 'Close accessibility options'
                        : 'Open accessibility options'
                "
                :title="
                    isOpen
                        ? 'Close accessibility options'
                        : 'Open accessibility options'
                "
                @click="isOpen = !isOpen"
            >
                <Icon
                    :icon="isOpen ? 'lucide:x' : 'lucide:accessibility'"
                    class="size-6"
                    aria-hidden="true"
                />
            </button>

            <!-- top-right -->
            <div class="size-12" style="grid-area: 1 / 2">
                <Transition
                    enter-active-class="accessibility-option-top-right-enter-active"
                    leave-active-class="accessibility-option-top-right-leave-active"
                >
                    <div v-if="isOpen" class="size-12">
                        <ColorblindModeToggle />
                    </div>
                </Transition>
            </div>

            <!-- top-left -->
            <div class="size-12" style="grid-area: 1 / 1">
                <Transition
                    enter-active-class="accessibility-option-top-left-enter-active"
                    leave-active-class="accessibility-option-top-left-leave-active"
                >
                    <div v-if="isOpen" class="size-12">
                        <DarkModeToggle />
                    </div>
                </Transition>
            </div>

            <!-- bottom-left -->
            <div class="size-12" style="grid-area: 2 / 1">
                <Transition
                    enter-active-class="accessibility-option-bottom-left-enter-active"
                    leave-active-class="accessibility-option-bottom-left-leave-active"
                >
                    <div v-if="isOpen" class="size-12">
                        <DyslexiaModeToggle />
                    </div>
                </Transition>
            </div>
        </div>
    </aside>
</template>

<style scoped>
.accessibility-option-top-left-enter-active,
.accessibility-option-top-left-leave-active,
.accessibility-option-top-right-enter-active,
.accessibility-option-top-right-leave-active,
.accessibility-option-bottom-left-enter-active,
.accessibility-option-bottom-left-leave-active {
    transform-origin: center;
    will-change: transform, opacity;
}

.accessibility-option-top-left-enter-active {
    --accessibility-option-x: 3.5rem;
    --accessibility-option-y: 3.5rem;
    animation: accessibility-option-in 260ms ease-out both;
}

.accessibility-option-top-left-leave-active {
    --accessibility-option-x: 3.5rem;
    --accessibility-option-y: 3.5rem;
    animation: accessibility-option-out 260ms ease-in both;
}

.accessibility-option-top-right-enter-active {
    --accessibility-option-x: 0;
    --accessibility-option-y: 3.5rem;
    animation: accessibility-option-in 180ms ease-out both;
}

.accessibility-option-top-right-leave-active {
    --accessibility-option-x: 0;
    --accessibility-option-y: 3.5rem;
    animation: accessibility-option-out 180ms ease-in both;
}

.accessibility-option-bottom-left-enter-active {
    animation: accessibility-option-bottom-left-in 420ms ease-in-out both;
}

.accessibility-option-bottom-left-leave-active {
    animation: accessibility-option-bottom-left-out 420ms ease-in-out both;
}

@keyframes accessibility-option-in {
    from {
        opacity: 0;
        transform: translate(
                var(--accessibility-option-x),
                var(--accessibility-option-y)
            )
            scale(0.9);
    }
    to {
        opacity: 1;
        transform: translate(0, 0) scale(1);
    }
}

@keyframes accessibility-option-out {
    from {
        opacity: 1;
        transform: translate(0, 0) scale(1);
    }
    to {
        opacity: 0;
        transform: translate(
                var(--accessibility-option-x),
                var(--accessibility-option-y)
            )
            scale(0.9);
    }
}

@keyframes accessibility-option-bottom-left-in {
    0% {
        opacity: 0;
        transform: translateX(3.5rem) scale(0.9);
    }
    34% {
        opacity: 1;
        transform: translate(3.5rem, -3.5rem) scale(0.96);
    }
    67% {
        opacity: 1;
        transform: translateY(-3.5rem) scale(0.98);
    }
    100% {
        opacity: 1;
        transform: translate(0, 0) scale(1);
    }
}

@keyframes accessibility-option-bottom-left-out {
    0% {
        opacity: 1;
        transform: translate(0, 0) scale(1);
    }
    33% {
        opacity: 1;
        transform: translateY(-3.5rem) scale(0.98);
    }
    66% {
        opacity: 1;
        transform: translate(3.5rem, -3.5rem) scale(0.96);
    }
    100% {
        opacity: 0;
        transform: translateX(3.5rem) scale(0.9);
    }
}
</style>
