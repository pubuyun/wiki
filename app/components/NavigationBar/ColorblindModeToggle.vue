<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { Toggle } from "reka-ui";

const colorblindMode = useState<boolean>("colorblind-mode", () => false);
</script>

<template>
    <Toggle
        v-model="colorblindMode"
        class="fixed right-4 bottom-4 z-50 flex size-9 shrink-0 items-center justify-center rounded-md border-2 border-border-default bg-surface-popover text-text-emphasized shadow-lg transition-colors hover:bg-interactive-hover-bg hover:text-interactive-hover-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring data-[state=on]:border-accent-warm data-[state=on]:bg-active-bg data-[state=on]:text-active-text"
        :aria-label="`${colorblindMode ? 'Disable' : 'Enable'} colorblind mode`"
        :title="`${colorblindMode ? 'Disable' : 'Enable'} colorblind mode`"
    >
        <Icon icon="lucide:palette" class="size-5" aria-hidden="true" />
    </Toggle>
</template>
