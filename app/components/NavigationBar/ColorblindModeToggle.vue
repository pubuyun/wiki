<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { Toggle } from "reka-ui";

const colorblindMode = useState<boolean>("colorblind-mode", () => false);
</script>

<template>
    <Toggle
        v-model="colorblindMode"
        class="text-text-emphasized flex size-9 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent-primary/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring data-[state=on]:bg-surface-page data-[state=on]:text-text-inverse"
        :aria-label="`${colorblindMode ? 'Disable' : 'Enable'} colorblind mode`"
        :title="`${colorblindMode ? 'Disable' : 'Enable'} colorblind mode`"
    >
        <Icon icon="lucide:palette" class="size-5" aria-hidden="true" />
    </Toggle>
</template>
