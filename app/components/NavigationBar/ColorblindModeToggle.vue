<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { Toggle } from "reka-ui";

const colorblindMode = useState<boolean>("colorblind-mode", () => false);
</script>

<template>
    <Toggle
        v-model="colorblindMode"
        class="fixed right-4 bottom-4 z-50 flex size-9 shrink-0 items-center justify-center rounded-md border-2 border-outline-variant bg-surface-container-highest text-on-surface shadow-lg transition-colors hover:bg-secondary hover:text-on-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline data-[state=on]:border-primary data-[state=on]:bg-primary-container data-[state=on]:text-on-primary-container"
        :aria-label="`${colorblindMode ? 'Disable' : 'Enable'} colorblind mode`"
        :title="`${colorblindMode ? 'Disable' : 'Enable'} colorblind mode`"
    >
        <Icon icon="lucide:palette" class="size-5" aria-hidden="true" />
    </Toggle>
</template>
