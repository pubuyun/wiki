<script setup lang="ts">
import { Toggle } from "reka-ui";

const highContrastMode = useState<boolean>("high-contrast-mode", () => false);
</script>

<template>
    <Toggle
        v-model="highContrastMode"
        class="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-outline bg-secondary text-on-secondary transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline data-[state=on]:bg-primary data-[state=on]:text-on-primary data-[state=on]:ring-[3px] data-[state=on]:ring-outline"
        aria-label="High contrast mode"
        title="High contrast mode"
    >
        <img
            src="https://static.igem.wiki/teams/6133/wiki/accessibility-menu-icons/colorblind-mode1.avif"
            alt=""
            class="size-full rounded-full object-contain"
            aria-hidden="true"
        />
    </Toggle>
</template>
