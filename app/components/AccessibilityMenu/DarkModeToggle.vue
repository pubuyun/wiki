<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { Toggle } from "reka-ui";

const darkMode = useState<boolean>("dark-mode", () => false);
</script>

<template>
    <Toggle
        v-model="darkMode"
        class="bg-surface-elevated flex size-12 shrink-0 items-center justify-center rounded-xl border-[3px] border-transparent text-on-primary shadow-lg transition-[transform,border-color] hover:scale-105 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline data-[state=on]:border-primary"
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
