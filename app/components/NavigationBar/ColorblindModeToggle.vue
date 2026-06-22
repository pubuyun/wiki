<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { Toggle } from "radix-vue";

const colorblindMode = useState<boolean>("colorblind-mode", () => false);
</script>

<template>
    <Toggle
        v-model:pressed="colorblindMode"
        class="flex size-9 shrink-0 items-center justify-center rounded-md text-primary-deep transition-colors hover:bg-primary-norm/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-deep data-[state=on]:bg-primary-deep data-[state=on]:text-primary-light"
        :aria-label="`${colorblindMode ? 'Disable' : 'Enable'} colorblind mode`"
        :title="`${colorblindMode ? 'Disable' : 'Enable'} colorblind mode`"
    >
        <Icon icon="lucide:palette" class="size-5" aria-hidden="true" />
    </Toggle>
</template>
