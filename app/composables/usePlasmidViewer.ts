import {
    computed,
    reactive,
    ref,
    shallowRef,
    toValue,
    useId,
    watch,
    type MaybeRefOrGetter,
} from "vue";
import {
    detectCommonFeatures,
    renderPlasmidSVG,
    type PlasmidRecord,
} from "@carabennemsi/plasmid";
import {
    parseSnapGene,
    type SnapGeneFeature,
    type SnapGeneRecord,
} from "~/utils/snapgene.client";

type DisplayRecord = Omit<PlasmidRecord, "features"> & {
    features: SnapGeneFeature[];
};

const plasmidCache = new Map<string, SnapGeneRecord>();

function fileStem(url: string) {
    try {
        const baseUrl = import.meta.client
            ? window.location.href
            : "http://localhost/";
        const pathname = new URL(url, baseUrl).pathname;
        const fileName = decodeURIComponent(pathname.split("/").at(-1) ?? "");
        return fileName.replace(/\.dna$/i, "") || "Plasmid";
    } catch {
        return "Plasmid";
    }
}

function prefixSvgIds(svg: string, prefix: string) {
    return svg
        .replace(/\bid="([^"]+)"/g, (_match, id: string) => {
            return `id="${prefix}${id}"`;
        })
        .replace(
            /(\b(?:xlink:)?href)="#([^"]+)"/g,
            (_match, attribute: string, id: string) => {
                return `${attribute}="#${prefix}${id}"`;
            },
        )
        .replace(/url\(#([^)]+)\)/g, (_match, id: string) => {
            return `url(#${prefix}${id})`;
        });
}

export function usePlasmidViewer(
    source: MaybeRefOrGetter<string | undefined>,
    displayName?: MaybeRefOrGetter<string | undefined>,
) {
    const status = ref<"idle" | "loading" | "ready" | "error">("idle");
    const errorMessage = ref("");
    const parsedRecord = shallowRef<SnapGeneRecord>();
    const selectedIndex = ref<number>();
    const svgIdPrefix = `plasmid-${useId().replaceAll(":", "")}-`;
    let loadId = 0;

    watch(
        () => toValue(source),
        async (url, _previousUrl, onCleanup) => {
            const currentLoadId = ++loadId;
            const abortController = new AbortController();
            onCleanup(() => abortController.abort());

            selectedIndex.value = undefined;
            parsedRecord.value = undefined;
            errorMessage.value = "";
            status.value = "idle";

            if (!url) return;

            const cached = plasmidCache.get(url);
            if (cached) {
                parsedRecord.value = cached;
                status.value = "ready";
                return;
            }

            status.value = "loading";
            try {
                const response = await fetch(url, {
                    signal: abortController.signal,
                });
                if (!response.ok) {
                    throw new Error(
                        `Unable to load the DNA file (${response.status}).`,
                    );
                }

                const record = parseSnapGene(
                    await response.arrayBuffer(),
                    fileStem(url),
                );
                if (currentLoadId !== loadId) return;

                plasmidCache.set(url, record);
                parsedRecord.value = record;
                status.value = "ready";
            } catch (error) {
                if (
                    abortController.signal.aborted ||
                    currentLoadId !== loadId
                ) {
                    return;
                }

                status.value = "error";
                errorMessage.value =
                    error instanceof Error
                        ? error.message
                        : "Unable to render this DNA file.";
            }
        },
        { immediate: true },
    );

    const displayRecord = computed<DisplayRecord | undefined>(() => {
        const record = parsedRecord.value;
        if (!record) return undefined;

        const features: SnapGeneFeature[] = record.features.length
            ? record.features
            : detectCommonFeatures(record.sequence, record.circular).map(
                  (feature) => ({ ...feature, qualifiers: {} }),
              );
        const name = toValue(displayName)?.trim();

        return {
            ...record,
            ...(name ? { name } : {}),
            features,
        };
    });
    const features = computed(() => displayRecord.value?.features ?? []);
    const svg = computed(() => {
        const record = displayRecord.value;
        if (!record) return "";

        return prefixSvgIds(
            renderPlasmidSVG(record, {
                size: 900,
                detectFeatures: false,
            }),
            svgIdPrefix,
        );
    });
    const selectedFeature = computed(() => {
        const index = selectedIndex.value;
        return index === undefined ? undefined : features.value[index];
    });
    const selectedFeatureLength = computed(() => {
        const feature = selectedFeature.value;
        const record = displayRecord.value;
        if (!feature || !record) return 0;
        if (feature.end >= feature.start) {
            return feature.end - feature.start + 1;
        }

        return record.sequence.length - feature.start + 1 + feature.end;
    });
    const selectedFeatureDetails = computed(() =>
        Object.entries(selectedFeature.value?.qualifiers ?? {}).filter(
            ([key, values]) =>
                key.toLowerCase() !== "translation" && values.some(Boolean),
        ),
    );

    function selectFeature(index: number) {
        if (features.value[index]) selectedIndex.value = index;
    }

    return reactive({
        status,
        errorMessage,
        displayRecord,
        features,
        svg,
        selectedIndex,
        selectedFeature,
        selectedFeatureLength,
        selectedFeatureDetails,
        selectFeature,
    });
}

export type PlasmidViewerState = ReturnType<typeof usePlasmidViewer>;
