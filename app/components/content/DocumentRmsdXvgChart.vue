<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "reka-ui";
import {
    getDocumentRmsdItems,
    type DocumentRmsdDataset,
    type DocumentRmsdItem,
} from "~/utils/document-rmsd";

const props = withDefaults(
    defineProps<{
        items?: DocumentRmsdItem[];
        collection?: DocumentRmsdDataset;
        label?: string;
    }>(),
    {
        label: "RMSD charts",
    },
);

const charts = computed(() =>
    (
        props.items ??
        (props.collection ? getDocumentRmsdItems(props.collection) : [])
    ).map((item, index) => ({
        ...item,
        value: String(index),
        sources: item.proteinUrl
            ? [item.proteinUrl, item.ligandUrl]
            : [item.ligandUrl],
        seriesNames: item.proteinUrl
            ? ["Protein", item.ligandLabel || "Ligand"]
            : [item.ligandLabel || "Ligand"],
    })),
);
const selected = ref("0");
const orientation = ref<"horizontal" | "vertical">("horizontal");
let orientationQuery: MediaQueryList | undefined;

function updateOrientation() {
    orientation.value = orientationQuery?.matches ? "vertical" : "horizontal";
}

onMounted(() => {
    orientationQuery = window.matchMedia("(orientation: landscape)");
    updateOrientation();
    orientationQuery.addEventListener("change", updateOrientation);
});

onBeforeUnmount(() => {
    orientationQuery?.removeEventListener("change", updateOrientation);
});

watch(charts, (items) => {
    if (!items.some((item) => item.value === selected.value)) {
        selected.value = items[0]?.value ?? "0";
    }
});
</script>

<template>
    <div class="not-prose my-6 max-w-full min-w-0">
        <TabsRoot
            v-if="charts.length"
            v-model="selected"
            :orientation="orientation"
            class="rmsd-tabs min-w-0 overflow-hidden rounded-xl border border-outline bg-secondary text-on-secondary"
        >
            <TabsList
                :aria-label="label"
                class="rmsd-tabs-list flex min-w-0 gap-1 border-b border-outline p-2"
            >
                <TabsTrigger
                    v-for="item in charts"
                    :key="item.value"
                    :value="item.value"
                    class="rmsd-tab min-h-11 shrink-0 cursor-pointer rounded-lg px-4 py-2 text-sm text-on-secondary outline-none hover:bg-accent/20 focus-visible:ring-2 focus-visible:ring-outline data-[state=active]:bg-accent data-[state=active]:font-bold data-[state=active]:text-on-accent"
                >
                    {{ item.name }}
                </TabsTrigger>
            </TabsList>
            <TabsContent
                v-for="item in charts"
                :key="item.value"
                :value="item.value"
                class="min-w-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-outline"
            >
                <ClientOnly>
                    <RmsdXvgChart
                        v-if="selected === item.value"
                        :key="item.sources.join('|')"
                        :src="item.sources"
                        :series-name="item.seriesNames"
                        title="RMSD"
                        embedded
                        height-class="min-h-[24rem] sm:min-h-[28rem]"
                    />
                    <template #fallback>
                        <p
                            role="status"
                            class="flex min-h-96 items-center justify-center"
                        >
                            Loading RMSD chart...
                        </p>
                    </template>
                </ClientOnly>
                <p class="px-4 py-3 text-right text-sm leading-relaxed">
                    The RMSD chart is plotted from the
                    <a
                        :href="item.ligandUrl"
                        class="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
                        >original xvg file</a
                    >.
                </p>
            </TabsContent>
        </TabsRoot>
        <p v-else role="status">No RMSD data available.</p>
    </div>
</template>

<style scoped>
.rmsd-tabs-list {
    overflow-x: auto;
}

@media (orientation: landscape) {
    .rmsd-tabs {
        display: grid;
        grid-template-columns: clamp(7rem, 20%, 12rem) minmax(0, 1fr);
    }

    .rmsd-tabs-list {
        flex-direction: column;
        align-self: stretch;
        max-height: 32rem;
        overflow-x: hidden;
        overflow-y: auto;
        border-bottom: 0;
        border-right: 1px solid var(--color-outline);
    }

    .rmsd-tab {
        text-align: left;
        overflow-wrap: anywhere;
    }
}
</style>
