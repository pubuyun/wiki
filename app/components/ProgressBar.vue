<template>
    <div class="h-2 w-full bg-spray">
        <div class="h-2 bg-azure" :style="{ width: `${progress}%` }"></div>
    </div>
</template>
<script setup lang="ts">
defineProps<{
    progress: number;
}>();
</script>
