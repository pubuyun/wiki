<script setup lang="ts">
defineProps<{
    // Consume Vue Flow's internal ID so it cannot shadow a document anchor.
    id: string;
    data: {
        label?: string;
        depth?: number;
    };
}>();
</script>

<template>
    <div
        class="virtual-label pointer-events-none w-max rounded-full px-5 py-3 font-belanosima leading-[1.1]"
        :class="{ 'virtual-label--nested': (data.depth ?? 0) > 0 }"
    >
        {{ data.label }}
    </div>
</template>

<style scoped>
.virtual-label {
    background: var(--graph-title);
    color: var(--graph-title-text);
    font-size: var(--graph-label-font-size);
    max-width: inherit;
    overflow-wrap: anywhere;
}

.virtual-label--nested {
    background: var(--graph-title-nested);
    color: var(--graph-title-nested-text);
    font-size: calc(
        var(--graph-label-font-size) * var(--graph-nested-label-scale, 0.89)
    );
}
</style>
