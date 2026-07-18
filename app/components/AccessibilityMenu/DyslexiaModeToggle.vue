<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { Toggle } from "reka-ui";

const dyslexiaMode = useState<boolean>("dyslexia-mode", () => false);
</script>

<template>
    <Toggle
        v-model="dyslexiaMode"
        class="bg-surface-navigation flex size-12 shrink-0 items-center justify-center rounded-xl border-[3px] border-transparent text-on-surface shadow-lg transition-[transform,border-color] hover:scale-105 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline data-[state=on]:border-primary"
        :aria-label="`${dyslexiaMode ? 'Disable' : 'Enable'} dyslexia-friendly reading mode`"
        :title="`${dyslexiaMode ? 'Disable' : 'Enable'} dyslexia-friendly reading mode`"
    >
        <Icon
            :icon="dyslexiaMode ? 'lucide:book-open-text' : 'lucide:book-open'"
            class="size-5"
            aria-hidden="true"
        />
    </Toggle>
</template>
