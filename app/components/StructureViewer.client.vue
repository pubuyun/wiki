<template>
    <div class="flex min-h-0 w-full flex-col gap-3">
        <nav
            class="flex gap-2 overflow-x-auto px-4"
            aria-label="Structure examples"
        >
            <button
                v-for="entry in pdbEntries"
                :key="entry.id"
                type="button"
                class="border-primary-dark/20 text-primary-dark hover:border-primary-dark hover:bg-primary-dark flex min-w-34 flex-col gap-0.5 rounded-lg border bg-white px-3 py-2 text-left transition-colors duration-[160ms] hover:text-white"
                :class="{
                    'border-primary-dark bg-primary-dark text-white':
                        entry.id === selectedPdb,
                }"
                @click="selectedPdb = entry.id"
            >
                <span class="font-righteous text-base leading-[1.1]">
                    {{ entry.id }}
                </span>
                <span class="text-[0.8125rem] leading-[1.2] opacity-[0.78]">
                    {{ entry.name }}
                </span>
            </button>
        </nav>

        <div
            class="structure-viewer relative isolate h-128 w-128 overflow-hidden"
        >
            <MolstarViewer
                :key="selectedPdb"
                :structure-url="selectedStructureUrl"
                structure-url-format="pdb"
                hide-controls
            />
        </div>
    </div>
</template>

<script setup>
import "molstar/build/viewer/molstar";
import MolstarViewer from "molstar-viewer-vue";

const pdbEntries = [
    { id: "1CAG", name: "Polyglutamine" },
    { id: "1TUP", name: "p53 and DNA" },
    { id: "4HHB", name: "Hemoglobin" },
    { id: "6VXX", name: "SARS-CoV-2 spike" },
];

const selectedPdb = ref(pdbEntries[0].id);

const selectedStructureUrl = computed(
    () => `https://files.rcsb.org/download/${selectedPdb.value}.pdb`,
);
</script>

<style scoped>
.structure-viewer :deep(#molStarWrapper) {
    position: relative;
    top: auto;
    left: auto;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.structure-viewer :deep(.msp-plugin),
.structure-viewer :deep(.msp-layout-expanded),
.structure-viewer :deep(.msp-layout-standard),
.structure-viewer :deep(.msp-layout-standard-reactive) {
    position: absolute;
    inset: 0;
    width: auto;
    height: auto;
    overflow: hidden;
}

.structure-viewer :deep(.msp-layout-region),
.structure-viewer :deep(.msp-scrollable-container) {
    max-height: 100%;
}

.structure-viewer :deep(.msp-layout-left),
.structure-viewer :deep(.msp-layout-bottom) {
    display: none;
}

.structure-viewer :deep(.msp-layout-main),
.structure-viewer :deep(.msp-layout-top) {
    left: 0;
}
</style>
