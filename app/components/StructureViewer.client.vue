<template>
    <div
        class="structure-viewer relative isolate h-full w-full overflow-hidden"
    >
        <MolstarViewer
            v-if="showViewer"
            :key="structureUrl"
            :structure-url="structureUrl"
            :structure-url-format="structureUrlFormat"
            :hide-controls
        />
    </div>
</template>

<script setup>
import "molstar/build/viewer/molstar";
import MolstarViewer from "molstar-viewer-vue";

defineProps({
    structureUrl: {
        type: String,
        required: true,
    },
    structureUrlFormat: {
        type: String,
        required: true,
    },
});

const showViewer = ref(true);

function cleanupMolstarDomState() {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.touchAction = "";

    document.querySelectorAll("#molStarWrapper").forEach((element) => {
        if (!element.closest(".structure-viewer")) {
            element.remove();
        }
    });
}

onBeforeUnmount(() => {
    cleanupMolstarDomState();
});
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
