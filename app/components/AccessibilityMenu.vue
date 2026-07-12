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
        <div class="grid gap-2" :class="isOpen ? 'grid-cols-2' : 'grid-cols-1'">
            <button
                type="button"
                class="order-4 flex size-12 items-center justify-center rounded-full border-[3px] bg-primary text-on-primary shadow-lg transition-[transform,border-color] hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
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

            <template v-if="isOpen">
                <DarkModeToggle />
                <ColorblindModeToggle />
                <DyslexiaModeToggle />
            </template>
        </div>
    </aside>
</template>
