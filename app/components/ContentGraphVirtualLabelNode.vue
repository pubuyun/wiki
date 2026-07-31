<script setup lang="ts">
defineProps<{
    data: {
        label?: string;
    };
}>();
</script>

<template>
    <div
        class="virtual-label pointer-events-none w-max max-w-96 origin-top-left [transform:scale(var(--content-graph-label-scale,1))] rounded-br-xl bg-primary px-3 py-[0.45rem] font-belanosima text-base leading-[1.15] whitespace-nowrap text-on-primary will-change-transform"
    >
        {{ data.label }}
    </div>
</template>
