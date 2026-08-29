<template>
    <section
        class="my-6 w-full overflow-hidden rounded-xl border border-surface-bright bg-secondary text-on-secondary shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        :aria-label="`${name || 'Plasmid'} map and details`"
    >
        <div
            class="grid min-w-0 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]"
        >
            <div
                class="min-h-[32rem] border-b border-surface-bright lg:h-[42rem] lg:min-h-0 lg:border-r lg:border-b-0 dark:border-zinc-700"
            >
                <PlasmidMap :viewer="viewer" />
            </div>
            <aside class="min-h-0 lg:h-[42rem]" aria-label="Plasmid details">
                <PlasmidDetails :viewer="viewer" />
            </aside>
        </div>
    </section>
</template>

<script setup lang="ts">
import PlasmidDetails from "~/components/Plasmid/Details.vue";
import PlasmidMap from "~/components/Plasmid/Map.client.vue";
import { usePlasmidViewer } from "~/composables/usePlasmidViewer";

const props = defineProps<{
    src: string;
    name?: string;
}>();

const viewer = usePlasmidViewer(
    () => props.src,
    () => props.name,
);
</script>
