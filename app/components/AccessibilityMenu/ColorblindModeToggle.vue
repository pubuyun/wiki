<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { Toggle } from "reka-ui";

const colorblindMode = useState<boolean>("colorblind-mode", () => false);
</script>

<template>
    <Toggle
        v-model="colorblindMode"
        class="flex size-12 shrink-0 items-center justify-center rounded-xl border-[3px] border-transparent bg-secondary text-on-secondary shadow-lg transition-[transform,border-color] hover:scale-105 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline data-[state=on]:border-primary"
        :aria-label="`${colorblindMode ? 'Disable' : 'Enable'} colorblind mode`"
        :title="`${colorblindMode ? 'Disable' : 'Enable'} colorblind mode`"
    >
        <Icon
            :icon="colorblindMode ? 'lucide:contrast' : 'lucide:palette'"
            class="size-5"
            aria-hidden="true"
        />
    </Toggle>
</template>
