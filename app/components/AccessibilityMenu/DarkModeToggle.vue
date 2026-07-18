<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { SwitchRoot, SwitchThumb } from "reka-ui";

const darkMode = useState<boolean>("dark-mode", () => false);
</script>

<template>
    <SwitchRoot
        v-model="darkMode"
        class="flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-secondary p-1 shadow-md transition-[background-color,border-color,transform] hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
        :aria-label="`${darkMode ? 'Disable' : 'Enable'} dark mode`"
        :title="`${darkMode ? 'Disable' : 'Enable'} dark mode`"
    >
        <SwitchThumb
            class="flex size-5 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm transition-transform duration-200 will-change-transform data-[state=checked]:translate-x-6"
        >
            <Icon
                :icon="darkMode ? 'lucide:moon' : 'lucide:sun'"
                class="size-3.5"
                aria-hidden="true"
            />
        </SwitchThumb>
    </SwitchRoot>
</template>
