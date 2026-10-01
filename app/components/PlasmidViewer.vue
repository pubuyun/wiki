<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import PlasmidPlaceholder from "./Plasmid/Placeholder.vue";

const PlasmidViewerInteractive = defineAsyncComponent(
    () => import("./Plasmid/Interactive.client.vue"),
);

defineProps<{
    src: string;
    name?: string;
}>();
</script>

<template>
    <div class="my-6 w-full">
        <ClientOnly>
            <Suspense>
                <PlasmidViewerInteractive
                    :src="src"
                    :name="name"
                    class="!my-0"
                />
                <template #fallback>
                    <PlasmidPlaceholder />
                </template>
            </Suspense>
            <template #fallback>
                <PlasmidPlaceholder />
            </template>
        </ClientOnly>
    </div>
</template>
