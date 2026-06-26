<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { Toggle } from "radix-vue";

const darkMode = useState<boolean>("dark-mode", () => false);
</script>

<template>
    <Toggle
        v-model:pressed="darkMode"
        class="flex size-9 shrink-0 items-center justify-center rounded-md text-primary-deep transition-colors hover:bg-primary-norm/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-deep data-[state=on]:bg-primary-bg data-[state=on]:text-primary-light"
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
