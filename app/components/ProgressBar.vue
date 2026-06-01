<template>
    <ProgressRoot
        :model-value="progress"
        aria-label="Reading progress"
        class="h-2 w-full overflow-hidden bg-spray"
        style="transform: translateZ(0)"
    >
        <ProgressIndicator
            class="h-full w-full bg-azure"
            :style="{
                transform: `translateX(-${100 - progress}%)`,
                transition: 'transform 0.2s ease-out',
            }"
        />
    </ProgressRoot>
</template>
<script setup lang="ts">
import { ProgressIndicator, ProgressRoot } from "radix-vue";
defineProps<{
    progress: number;
}>();
</script>
