<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { Toggle } from "reka-ui";

const colorblindMode = useState<boolean>("colorblind-mode", () => false);
</script>

<template>
    <Toggle
        v-model="colorblindMode"
        class="colorblind-toggle fixed right-4 bottom-4 z-50 flex size-9 shrink-0 items-center justify-center rounded-md border-2 border-[#123a9c] bg-[#fff3b0] text-[#123a9c] shadow-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fff3b0] data-[state=on]:bg-[#ffe66d] data-[state=on]:text-[#123a9c] colorblind:border-[#56b4e9] colorblind:bg-[#56b4e9] colorblind:text-black colorblind:focus-visible:outline-[#56b4e9] colorblind:hover:ring-4 colorblind:hover:ring-[#56b4e9] colorblind:hover:ring-offset-8 colorblind:hover:ring-offset-black colorblind:data-[state=on]:border-[#7cc7f0] colorblind:data-[state=on]:bg-[#7cc7f0] colorblind:data-[state=on]:text-black dark:colorblind:border-[#f0e442] dark:colorblind:bg-[#f0e442] dark:colorblind:focus-visible:outline-[#f0e442] dark:colorblind:hover:ring-[#f0e442] dark:colorblind:data-[state=on]:border-[#fff45c] dark:colorblind:data-[state=on]:bg-[#fff45c] dark:colorblind:data-[state=on]:text-black"
        :aria-label="`${colorblindMode ? 'Disable' : 'Enable'} colorblind mode`"
        :title="`${colorblindMode ? 'Disable' : 'Enable'} colorblind mode`"
    >
        <Icon icon="lucide:palette" class="size-5" aria-hidden="true" />
    </Toggle>
</template>
