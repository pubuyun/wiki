<script setup>
import { onBeforeUnmount, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { loadMolstar } from "~/utils/molstar.client";

const route = useRoute();
const runtimeConfig = useRuntimeConfig();

const props = defineProps({
    fileData: { type: [String, Array], default: "" },
    fileFormat: { type: String, default: "" },
    fileDataLabel: { type: String, default: "" },

    snapshotId: { type: String, default: "" },
    snapshotUrl: { type: String, default: "" },
    snapshotUrlType: { type: String, default: "molj" },

    structureUrl: { type: [String, Array], default: "" },
    structureUrlFormat: { type: String, default: "" },
    structureUrlIsBinary: { type: Boolean, default: false },

    mvsUrl: { type: String, default: "" },
    mvsFormat: { type: String, default: "mvsj" },
    mvsData: { type: String, default: "" },

    pdb: { type: String, default: "" },
    pdbDev: { type: String, default: "" },
    emdb: { type: String, default: "" },
    afdb: { type: String, default: "" },
    modelArchive: { type: String, default: "" },

    debugMode: { type: Boolean, default: false },
    timingMode: { type: Boolean, default: false },
    disabledExtensions: { type: Array, default: () => [] },
    hideControls: { type: Boolean, default: false },
    collapseLeftPanel: { type: Boolean, default: false },
    pdbProvider: { type: String, default: "pdbe" },
    emdbProvider: { type: String, default: "pdbe" },
    mapProvider: { type: String, default: "pdbe" },
    pixelScale: { type: Number, default: 1 },
    pickScale: { type: Number, default: 0.25 },
    pickPadding: { type: Number, default: 1 },
    transparency: { type: String, default: undefined },
    preferWebgl1: { type: Boolean, default: false },
    allowMajorPerformanceCaveat: { type: Boolean, default: false },
    powerPreference: { type: String, default: "high-performance" },
});

const viewerContainer = ref(null);
let molstarApi = null;
let molStarViewer = null;
let unmounted = false;

function queryString(query, name) {
    const value = query[name];
    return Array.isArray(value) ? value[0] : value;
}

function exchangeFileFormatToMolstarFormat(fileFormat = "") {
    switch (fileFormat.toLowerCase()) {
        case "cif":
        case "bcif":
        case "mmcif":
        case "mcif":
            return "mmcif";
        case "pdb":
        case "ent":
            return "pdb";
        case "pdbqt":
            return "pdbqt";
        case "gro":
            return "gro";
        case "xyz":
            return "xyz";
        case "mol":
            return "mol";
        case "sd":
        case "sdf":
            return "sdf";
        case "mol2":
            return "mol2";
        default:
            return "";
    }
}

async function loadData(data, format, dataLabel) {
    if (!molStarViewer) return;
    await molStarViewer.loadStructureFromData(data, format, { dataLabel });
}

watch(
    () => props.fileData,
    async (data) => {
        await loadData(
            data,
            exchangeFileFormatToMolstarFormat(props.fileFormat),
            props.fileDataLabel,
        );
    },
    { deep: true },
);

async function render() {
    molstarApi = await loadMolstar(runtimeConfig.public.molstarBaseUrl);

    if (unmounted || !viewerContainer.value) return;

    const query = route.query || {};
    const debugMode = queryString(query, "debug-mode");
    const timingMode = queryString(query, "timing-mode");

    if (debugMode === "1" || props.debugMode) {
        molstarApi.setDebugMode(true);
    }
    if (timingMode === "1" || props.timingMode) {
        molstarApi.setTimingMode(true);
    }

    const queryHideControls = queryString(query, "hide-controls");
    const hideControls = queryHideControls
        ? queryHideControls.trim() === "1"
        : props.hideControls;
    const queryCollapseLeftPanel = queryString(query, "collapse-left-panel");
    const collapseLeftPanel = queryCollapseLeftPanel
        ? queryCollapseLeftPanel.trim() === "1"
        : props.collapseLeftPanel;
    const pdbProvider =
        queryString(query, "pdb-provider")?.trim().toLowerCase() ||
        props.pdbProvider;
    const emdbProvider =
        queryString(query, "emdb-provider")?.trim().toLowerCase() ||
        props.emdbProvider;
    const mapProvider =
        queryString(query, "map-provider")?.trim().toLowerCase() ||
        props.mapProvider;
    const pixelScale =
        queryString(query, "pixel-scale")?.trim() || props.pixelScale;
    const pickScale =
        queryString(query, "pick-scale")?.trim() || props.pickScale;
    const pickPadding =
        queryString(query, "pick-padding")?.trim() || props.pickPadding;
    const transparency =
        queryString(query, "transparency")?.trim().toLowerCase() ||
        props.transparency;
    const preferWebgl1 =
        queryString(query, "prefer-webgl1")?.trim() === "1" ||
        props.preferWebgl1;
    const allowMajorPerformanceCaveat =
        queryString(query, "allow-major-performance-caveat")?.trim() === "1" ||
        props.allowMajorPerformanceCaveat;
    const powerPreference =
        queryString(query, "power-preference")?.trim().toLowerCase() ||
        props.powerPreference;

    const viewer = await molstarApi.Viewer.create(viewerContainer.value, {
        disabledExtensions: props.disabledExtensions,
        layoutShowControls: !hideControls,
        viewportShowExpand: false,
        collapseLeftPanel,
        pdbProvider,
        emdbProvider,
        volumeStreamingServer:
            mapProvider === "rcsb"
                ? "https://maps.rcsb.org"
                : "https://www.ebi.ac.uk/pdbe/densities",
        pixelScale: Number.parseFloat(pixelScale),
        pickScale: Number.parseFloat(pickScale),
        pickPadding: Number.isNaN(Number.parseFloat(pickPadding))
            ? 1
            : Number.parseFloat(pickPadding),
        transparency: transparency || undefined,
        preferWebgl1,
        allowMajorPerformanceCaveat,
        powerPreference,
    });

    if (unmounted) {
        viewer.dispose();
        return;
    }

    molStarViewer = viewer;

    const snapshotId =
        queryString(query, "snapshot-id")?.trim() || props.snapshotId;
    if (snapshotId) viewer.setRemoteSnapshot(snapshotId);

    const snapshotUrl =
        queryString(query, "snapshot-url")?.trim() || props.snapshotUrl;
    const snapshotUrlType =
        queryString(query, "snapshot-url-type")?.trim().toLowerCase() ||
        props.snapshotUrlType;
    if (snapshotUrl && snapshotUrlType) {
        viewer.loadSnapshotFromUrl(snapshotUrl, snapshotUrlType);
    }

    const structureUrl =
        queryString(query, "structure-url") || props.structureUrl;
    const structureUrlIsBinary =
        queryString(query, "structure-url-is-binary")?.trim() === "1" ||
        props.structureUrlIsBinary;

    if (Array.isArray(structureUrl)) {
        structureUrl.forEach((url) => {
            const format = url.split(".").pop();
            viewer.loadStructureFromUrl(
                url.trim(),
                exchangeFileFormatToMolstarFormat(format),
                structureUrlIsBinary,
                { label: url.split("/").pop() },
            );
        });
    } else if (structureUrl) {
        const structureUrlFormat =
            queryString(query, "structure-url-format")?.trim().toLowerCase() ||
            props.structureUrlFormat ||
            exchangeFileFormatToMolstarFormat(structureUrl.split(".").pop());
        viewer.loadStructureFromUrl(
            structureUrl.trim(),
            structureUrlFormat,
            structureUrlIsBinary,
            { label: structureUrl.split("/").pop() },
        );
    }

    const mvsUrl = queryString(query, "mvs-url")?.trim() || props.mvsUrl;
    const mvsData = queryString(query, "mvs-data")?.trim() || props.mvsData;
    const mvsFormat =
        queryString(query, "mvs-format")?.trim() || props.mvsFormat;
    if (mvsUrl && mvsData) {
        console.error(
            "Cannot specify mvs-url and mvs-data at the same time. Ignoring both.",
        );
    } else if (mvsUrl) {
        viewer.loadMvsFromUrl(mvsUrl, mvsFormat);
    } else if (mvsData) {
        viewer.loadMvsData(mvsData, mvsFormat);
    }

    const pdb = queryString(query, "pdb")?.trim() || props.pdb;
    if (pdb) viewer.loadPdb(pdb);

    const pdbDev = queryString(query, "pdb-dev")?.trim() || props.pdbDev;
    if (pdbDev) viewer.loadPdbDev(pdbDev);

    const emdb = queryString(query, "emdb")?.trim() || props.emdb;
    if (emdb) viewer.loadEmdb(emdb);

    const afdb = queryString(query, "afdb")?.trim() || props.afdb;
    if (afdb) viewer.loadAlphaFoldDb(afdb);

    const modelArchive =
        queryString(query, "model-archive")?.trim() || props.modelArchive;
    if (modelArchive) viewer.loadModelArchive(modelArchive);

    if (props.fileData && props.fileFormat) {
        await loadData(
            props.fileData,
            exchangeFileFormatToMolstarFormat(props.fileFormat),
            props.fileDataLabel,
        );
    }
}

const getExtension = () => Object.keys(molstarApi?.ExtensionMap ?? {});
const getViewer = () => molStarViewer;

defineExpose({ getExtension, getViewer });

onMounted(() => {
    render().catch((error) => {
        console.error("Failed to initialize Mol* viewer:", error);
    });
});

onBeforeUnmount(() => {
    unmounted = true;
    molStarViewer?.dispose();
    molStarViewer = null;
});
</script>

<template>
    <div ref="viewerContainer" class="molstar-viewer"></div>
</template>
