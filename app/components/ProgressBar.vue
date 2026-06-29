<template>
    <ProgressRoot
        :model-value="Math.min(Math.max(progress, 0), 100)"
        aria-label="Reading progress"
        class="bg-primary-light h-2 w-full overflow-hidden"
        style="transform: translateZ(0)"
    >
        <ProgressIndicator
            class="h-full w-full bg-primary-norm"
            :style="{
                transform: `translateX(-${100 - progress}%)`,
                transition: 'transform 0.2s ease-out',
            }"
        />
    </ProgressRoot>
</template>
<script setup lang="ts">
import { ProgressIndicator, ProgressRoot } from "reka-ui";

defineProps<{
    progress: number;
}>();
</script>
