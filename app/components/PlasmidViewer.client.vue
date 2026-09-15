<template>
    <section
        class="my-6 w-full overflow-hidden rounded-xl border border-surface-bright bg-secondary text-on-secondary shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        :aria-label="`${name || 'Plasmid'} map and details`"
    >
        <div
            v-if="isWideLayout"
            class="grid min-w-0 lg:h-[clamp(32rem,55vw,38rem)] lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]"
        >
            <div
                class="flex min-h-80 items-center justify-center border-b border-surface-bright px-4 sm:px-6 lg:min-h-0 lg:border-r lg:border-b-0 dark:border-zinc-700"
            >
                <div
                    class="aspect-square h-auto w-full max-w-[38rem] lg:h-full lg:w-auto"
                >
                    <PlasmidMap :viewer="viewer" />
                </div>
            </div>
            <aside class="min-h-0" aria-label="Plasmid details">
                <PlasmidDetails :viewer="viewer" />
            </aside>
        </div>
        <TabsRoot v-else default-value="map" class="min-w-0">
            <TabsList
                class="grid grid-cols-2 gap-1 border-b border-surface-bright bg-surface-elevated p-1 dark:border-zinc-700 dark:bg-zinc-800"
                aria-label="Plasmid views"
            >
                <TabsTrigger
                    value="map"
                    class="rounded-lg px-4 py-2.5 font-semibold text-primary transition-colors outline-none hover:bg-primary/15 focus-visible:ring-2 focus-visible:ring-outline data-[state=active]:bg-primary data-[state=active]:text-on-primary"
                >
                    Plasmid map
                </TabsTrigger>
                <TabsTrigger
                    value="details"
                    class="rounded-lg px-4 py-2.5 font-semibold text-primary transition-colors outline-none hover:bg-primary/15 focus-visible:ring-2 focus-visible:ring-outline data-[state=active]:bg-primary data-[state=active]:text-on-primary"
                >
                    Details
                </TabsTrigger>
            </TabsList>

            <TabsContent value="map" class="min-w-0 outline-none">
                <div
                    class="flex min-h-80 items-center justify-center px-4 sm:px-6"
                >
                    <div class="aspect-square w-full max-w-[38rem]">
                        <PlasmidMap :viewer="viewer" />
                    </div>
                </div>
            </TabsContent>
            <TabsContent
                value="details"
                class="h-[min(38rem,70vh)] min-h-80 outline-none"
            >
                <aside class="h-full min-h-0" aria-label="Plasmid details">
                    <PlasmidDetails :viewer="viewer" />
                </aside>
            </TabsContent>
        </TabsRoot>
    </section>
</template>

<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "reka-ui";
import PlasmidDetails from "~/components/Plasmid/Details.vue";
import PlasmidMap from "~/components/Plasmid/Map.client.vue";
import { usePlasmidViewer } from "~/composables/usePlasmidViewer";

const props = defineProps<{
    src: string;
    name?: string;
}>();

let wideLayoutQuery = import.meta.client
    ? window.matchMedia("(min-width: 64rem)")
    : undefined;
const isWideLayout = ref(wideLayoutQuery?.matches ?? false);

function updateLayout(event: MediaQueryList | MediaQueryListEvent) {
    isWideLayout.value = event.matches;
}

onMounted(() => {
    wideLayoutQuery ??= window.matchMedia("(min-width: 64rem)");
    updateLayout(wideLayoutQuery);
    wideLayoutQuery.addEventListener("change", updateLayout);
});

onBeforeUnmount(() => {
    wideLayoutQuery?.removeEventListener("change", updateLayout);
});

const viewer = usePlasmidViewer(
    () => props.src,
    () => props.name,
);
</script>
