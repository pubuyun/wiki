<template>
    <div
        class="structure-viewer relative isolate h-full w-full overflow-hidden"
    >
        <MolstarViewer
            v-if="showViewer"
            :show-left-panel="false"
            :show-log="false"
            :hide-controls="true"
            :key="structureUrl"
            :structure-url="structureUrl"
            :structure-url-format="structureUrlFormat"
            :disabled-extensions="[
                'volseg',
                'backgrounds',
                'model-export',
                'mp4-export',
                'geo-export',
            ]"
        />
    </div>
</template>

<script setup>
import MolstarViewer from "./MolStar/MolStarViewer.vue";

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

    document.querySelectorAll(".molstar-viewer").forEach((element) => {
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
.structure-viewer :deep(.molstar-viewer) {
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

.structure-viewer :deep(.msp-layout-main),
.structure-viewer :deep(.msp-layout-top) {
    left: 0;
}
</style>
