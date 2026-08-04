<script setup lang="ts">
import { Toggle } from "reka-ui";

const dyslexiaMode = useState<boolean>("dyslexia-mode", () => false);
</script>

<template>
    <Toggle
        v-model="dyslexiaMode"
        class="flex size-12 shrink-0 items-center justify-center rounded-full bg-transparent transition-transform hover:scale-105 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline data-[state=on]:ring-[3px] data-[state=on]:ring-primary"
        :aria-label="`${dyslexiaMode ? 'Disable' : 'Enable'} dyslexia-friendly reading mode`"
        :title="`${dyslexiaMode ? 'Disable' : 'Enable'} dyslexia-friendly reading mode`"
    >
        <img
            src="https://static.igem.wiki/teams/6133/wiki/accessibility-menu-icons/dyslexia-mode1.avif"
            alt=""
            class="size-full rounded-full object-contain"
            aria-hidden="true"
        />
    </Toggle>
</template>
