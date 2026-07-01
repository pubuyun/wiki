<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { Toggle } from "reka-ui";

const darkMode = useState<boolean>("dark-mode", () => false);
</script>

<template>
    <Toggle
        v-model="darkMode"
        class="flex size-9 shrink-0 items-center justify-center rounded-md text-text-brand transition-colors hover:bg-accent-primary/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring data-[state=on]:bg-surface-page data-[state=on]:text-text-inverse"
        :aria-label="`${darkMode ? 'Disable' : 'Enable'} dark mode`"
        :title="`${darkMode ? 'Disable' : 'Enable'} dark mode`"
    >
        <Icon
            :icon="darkMode ? 'lucide:moon' : 'lucide:sun'"
            class="size-5"
            aria-hidden="true"
        />
    </Toggle>
</template>
