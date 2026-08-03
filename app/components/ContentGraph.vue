<script setup lang="ts">
import ContentGraphInteractive from "./ContentGraph/ContentGraphInteractive.client.vue";

defineOptions({ inheritAttrs: false });

defineProps<{
    src: string;
}>();
</script>

<template>
    <ClientOnly>
        <ContentGraphInteractive v-bind="$attrs" :src="src" />

        <template #fallback>
            <figure
                v-bind="$attrs"
                class="grid w-full place-items-center overflow-hidden rounded-2xl border-2 border-outline bg-surface-elevated text-sm text-on-surface shadow-sm sm:rounded-3xl lg:rounded-4xl portrait:hidden"
                style="height: min(560px, calc(100dvh - 5rem))"
                aria-label="Interactive graph"
                aria-busy="true"
            >
                <span role="status">Loading graph...</span>
            </figure>
        </template>
    </ClientOnly>
</template>
