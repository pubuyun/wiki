<template>
    <div
        class="flex min-h-dvh max-w-full flex-col overflow-hidden bg-surface p-4 text-on-surface lg:mt-11 lg:h-[calc(100dvh-2.75rem)] lg:min-h-0 xl:mt-14 xl:h-[calc(100dvh-3.5rem)]"
    >
        <SplitterGroup
            id="inclusivity-model-layout"
            :direction="isWideViewport ? 'horizontal' : 'vertical'"
            :keyboard-resize-by="2"
            class="min-h-0 flex-1"
        >
            <SplitterPanel
                id="inclusivity-model-files-panel"
                :default-size="isWideViewport ? 21 : 20"
                :min-size="isWideViewport ? 14 : 14"
            >
                <div class="flex h-full min-w-0 flex-col gap-4">
                    <button
                        type="button"
                        class="flex h-12 w-full shrink-0 items-center gap-3 rounded-xl bg-transparent px-4 text-left font-momo-trust-display text-xl text-primary transition-colors hover:bg-primary hover:text-on-primary focus-visible:bg-primary focus-visible:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline active:bg-primary active:text-on-primary"
                        @click="goBack"
                    >
                        <Icon
                            icon="lucide:arrow-left"
                            class="size-6 shrink-0"
                            aria-hidden="true"
                        />
                        <span>Back to Previous</span>
                    </button>

                    <aside
                        class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-surface-bright bg-secondary text-on-secondary"
                        aria-labelledby="inclusivity-model-files-heading"
                    >
                        <div
                            class="border-b border-surface-bright bg-surface-elevated px-4 py-3"
                        >
                            <h2
                                id="inclusivity-model-files-heading"
                                class="font-momo-trust-display text-lg leading-tight text-primary"
                            >
                                Model Files
                            </h2>
                        </div>

                        <nav
                            class="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-2 font-belanosima"
                            aria-label="Educational 3D models"
                        >
                            <ul class="flex min-w-0 flex-col gap-1">
                                <li
                                    v-for="model in models"
                                    :key="model.id"
                                    class="min-w-0"
                                >
                                    <NuxtLink
                                        :to="modelRoute(model.id, activeTab)"
                                        class="group flex h-10 min-w-0 items-center gap-2 rounded px-3 text-base no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
                                        :class="
                                            model.id === selectedModel?.id
                                                ? 'bg-primary text-on-primary hover:bg-primary hover:text-on-primary focus-visible:bg-primary focus-visible:text-on-primary'
                                                : 'text-on-secondary hover:bg-primary/20 focus-visible:bg-primary/20'
                                        "
                                        :aria-current="
                                            model.id === selectedModel?.id
                                                ? 'page'
                                                : undefined
                                        "
                                    >
                                        <Icon
                                            icon="lucide:box"
                                            class="size-4 shrink-0"
                                            :class="
                                                model.id === selectedModel?.id
                                                    ? 'text-on-primary'
                                                    : 'text-on-secondary/65'
                                            "
                                            aria-hidden="true"
                                        />
                                        <span class="min-w-0 flex-1 truncate">
                                            {{ model.title }}
                                        </span>
                                    </NuxtLink>
                                </li>
                            </ul>
                        </nav>
                    </aside>
                </div>
            </SplitterPanel>

            <SplitterResizeHandle
                id="inclusivity-model-files-viewer-handle"
                class="model-splitter shrink-0 cursor-col-resize rounded-full bg-transparent transition-colors outline-none data-[orientation=horizontal]:w-4 data-[orientation=vertical]:h-4 data-[orientation=vertical]:cursor-row-resize"
                aria-label="Resize model file list and 3D model viewer"
            />

            <SplitterPanel
                id="inclusivity-model-viewer-panel"
                :default-size="isWideViewport ? 47 : 48"
                :min-size="isWideViewport ? 30 : 32"
            >
                <main class="flex h-full min-w-0 flex-col gap-4">
                    <h1
                        class="w-fit max-w-full shrink-0 truncate rounded-xl bg-surface-elevated px-4 py-2 text-xl leading-none font-semibold text-on-surface shadow-sm"
                        :title="viewerTitle"
                    >
                        {{ viewerTitle }}
                    </h1>

                    <section
                        class="model-viewer-stage relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl border border-surface-bright bg-secondary transition-shadow"
                        :aria-label="`${viewerTitle} 3D model viewer`"
                    >
                        <ClientOnly>
                            <component
                                :is="'model-viewer'"
                                ref="modelViewerElement"
                                v-if="selectedModel && isModelViewerReady"
                                class="educational-model-viewer block size-full bg-secondary outline-none"
                                :src="selectedModel.modelUrl"
                                :poster="selectedModel.imageUrl"
                                :alt="`${selectedModel.title} 3D model`"
                                camera-controls
                                tabindex="0"
                                :auto-rotate="
                                    !prefersReducedMotion &&
                                    !hasUserTakenViewerControl
                                "
                                auto-rotate-delay="0"
                                rotation-per-second="14deg"
                                camera-orbit="-32deg 72deg auto"
                                field-of-view="24deg"
                                touch-action="pan-y"
                                interaction-prompt="auto"
                                environment-image="https://modelviewer.dev/shared-assets/environments/spruit_sunrise_1k_HDR.jpg"
                                tone-mapping="commerce"
                                shadow-intensity="1.15"
                                shadow-softness="0.45"
                                exposure="0.82"
                                loading="eager"
                                reveal="auto"
                                @load="handleModelLoad"
                                @poster-dismissed="handleModelLoad"
                                @camera-change="handleCameraChange"
                                @error="handleModelError"
                            />

                            <template #fallback>
                                <div
                                    class="grid size-full place-items-center p-6 text-center text-sm text-on-secondary"
                                    role="status"
                                >
                                    Loading 3D model viewer...
                                </div>
                            </template>
                        </ClientOnly>

                        <div
                            v-if="
                                selectedModel &&
                                (!isModelLoaded || modelLoadError)
                            "
                            class="pointer-events-none absolute inset-x-0 bottom-0 bg-surface-elevated/90 px-4 py-2 text-center text-sm text-on-surface"
                            role="status"
                        >
                            {{
                                modelLoadError ||
                                `Loading ${selectedModel.title}...`
                            }}
                        </div>
                    </section>
                </main>
            </SplitterPanel>

            <SplitterResizeHandle
                id="inclusivity-model-viewer-details-handle"
                class="model-splitter shrink-0 cursor-col-resize rounded-full bg-transparent transition-colors outline-none data-[orientation=horizontal]:w-4 data-[orientation=vertical]:h-4 data-[orientation=vertical]:cursor-row-resize"
                aria-label="Resize 3D model viewer and model information"
            />

            <SplitterPanel
                id="inclusivity-model-details-panel"
                :default-size="isWideViewport ? 32 : 32"
                :min-size="isWideViewport ? 22 : 24"
            >
                <aside
                    class="mr-3 mb-3 h-[calc(100%-0.75rem)] min-h-0 min-w-0 overflow-hidden rounded-xl border border-surface-bright bg-secondary text-on-secondary shadow-[12px_12px_0_var(--color-primary)]"
                    aria-label="Model information"
                >
                    <TabsRoot
                        v-model="activeTab"
                        class="flex h-full min-h-0 flex-col"
                    >
                        <TabsList
                            class="flex shrink-0 gap-1 overflow-hidden border-b border-surface-bright bg-surface-elevated p-1 font-momo-trust-display"
                            aria-label="Model information views"
                        >
                            <TabsTrigger
                                v-for="tab in tabs"
                                :key="tab.value"
                                :value="tab.value"
                                :aria-label="tab.label.join(' ')"
                                class="flex min-w-0 flex-1 items-center justify-center rounded-full px-2 py-2 text-center text-sm leading-tight text-primary transition-colors outline-none hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-outline data-[state=active]:bg-primary data-[state=active]:text-on-primary xl:text-base"
                            >
                                <span aria-hidden="true">
                                    <span class="block">{{
                                        tab.label[0]
                                    }}</span>
                                    <span class="block">{{
                                        tab.label[1]
                                    }}</span>
                                </span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="image"
                            class="min-h-0 flex-1 overflow-auto p-4 outline-none"
                        >
                            <figure
                                v-if="selectedModel"
                                class="flex min-h-full flex-col gap-3"
                            >
                                <img
                                    class="max-h-full min-h-0 w-full rounded-lg object-contain"
                                    :src="selectedModel.imageUrl"
                                    :alt="`Reference image for ${selectedModel.title}`"
                                    loading="eager"
                                    decoding="async"
                                />
                                <figcaption
                                    class="text-sm text-on-secondary/75"
                                >
                                    {{ selectedModel.title }}
                                </figcaption>
                            </figure>
                        </TabsContent>

                        <TabsContent
                            value="description-en"
                            class="min-h-0 flex-1 overflow-auto p-4 outline-none"
                        >
                            <ContentRenderer
                                v-if="englishDescription"
                                :value="englishDescription"
                                class="content paragraph overflow-wrap-anywhere min-w-0 text-on-secondary"
                            />
                            <p v-else class="text-sm text-on-secondary/75">
                                English description is not available.
                            </p>
                        </TabsContent>

                        <TabsContent
                            value="description-cn"
                            lang="zh-CN"
                            class="min-h-0 flex-1 overflow-auto p-4 outline-none"
                        >
                            <ContentRenderer
                                v-if="chineseDescription"
                                :value="chineseDescription"
                                class="content paragraph overflow-wrap-anywhere min-w-0 text-on-secondary"
                            />
                            <p v-else class="text-sm text-on-secondary/75">
                                Chinese description is not available.
                            </p>
                        </TabsContent>
                    </TabsRoot>
                </aside>
            </SplitterPanel>
        </SplitterGroup>
    </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { parseMarkdown } from "@nuxtjs/mdc/runtime";
import {
    SplitterGroup,
    SplitterPanel,
    SplitterResizeHandle,
    TabsContent,
    TabsList,
    TabsRoot,
    TabsTrigger,
} from "reka-ui";

definePageMeta({
    layout: "static",
    key: false,
});

type InclusivityModel = {
    id: string;
    title: string;
    imageUrl: string;
    modelUrl: string;
};

type InclusivityJsonModule = InclusivityModel | InclusivityModel[];
type ParsedMarkdownDocument = Awaited<ReturnType<typeof parseMarkdown>> & {
    id: string;
    title?: string;
};

const jsonModules = import.meta.glob<InclusivityJsonModule>(
    ["../../../data/inlcusivity/*.json", "../../../data/inclusivity/*.json"],
    {
        eager: true,
        import: "default",
    },
);

const markdownModules = import.meta.glob<string>(
    ["../../../data/inlcusivity/*.md", "../../../data/inclusivity/*.md"],
    {
        eager: true,
        import: "default",
        query: "?raw",
    },
);

const route = useRoute();
const router = useRouter();
const previousNonModelPath = ref<string | null>(null);
const activeTab = ref<TabValue>("image");
const isWideViewport = ref(true);
const prefersReducedMotion = ref(false);
const isModelLoaded = ref(false);
const isModelViewerReady = ref(false);
const hasUserTakenViewerControl = ref(false);
let viewportQuery: MediaQueryList | undefined;
let reducedMotionQuery: MediaQueryList | undefined;
let previousRouteModelId: string | undefined;

const tabValues = ["image", "description-en", "description-cn"] as const;
type TabValue = (typeof tabValues)[number];

const tabs = [
    { value: "image" as const, label: ["Reference", "Image"] },
    { value: "description-en" as const, label: ["English", "Description"] },
    { value: "description-cn" as const, label: ["Chinese", "Description"] },
];
const modelViewerMeshoptDecoderLocation =
    "https://cdn.jsdelivr.net/npm/meshoptimizer@0.18.1/meshopt_decoder.js";

const models = buildModels();
const firstModel = models[0];
const markdownDocuments = await buildMarkdownDocuments();

const selectedModel = computed(() => {
    const modelId = catchallSegments().at(0);
    return models.find((model) => model.id === modelId);
});
const viewerTitle = computed(() => selectedModel.value?.title ?? "3D Model");
const englishDescription = computed(() =>
    selectedModel.value
        ? markdownDocuments[`${selectedModel.value.id}_en`]
        : undefined,
);
const chineseDescription = computed(() =>
    selectedModel.value
        ? markdownDocuments[`${selectedModel.value.id}_cn`]
        : undefined,
);

function buildModels() {
    const modelMap = new Map<string, InclusivityModel>();

    for (const [path, moduleValue] of Object.entries(jsonModules)) {
        const records = Array.isArray(moduleValue)
            ? moduleValue
            : [moduleValue];
        const fallbackId = fileStem(path);

        for (const record of records) {
            const model = {
                ...record,
                id: record.id || fallbackId,
                title: record.title || titleizeSlug(record.id || fallbackId),
            };

            if (model.id && model.imageUrl && model.modelUrl) {
                modelMap.set(model.id, model);
            }
        }
    }

    return [...modelMap.values()].sort((a, b) =>
        a.title.localeCompare(b.title),
    );
}

async function buildMarkdownDocuments() {
    const documents: Record<string, ParsedMarkdownDocument> = {};

    await Promise.all(
        Object.entries(markdownModules).map(async ([path, markdown]) => {
            const id = fileStem(path);
            const parsed = await parseMarkdown(markdown);
            documents[id] = {
                ...parsed,
                body: {
                    ...parsed.body,
                    toc: parsed.toc,
                },
                id,
                title: parsed.data?.title || titleizeSlug(id),
            };
        }),
    );

    return documents;
}

function fileStem(path: string) {
    return (
        path
            .split("/")
            .pop()
            ?.replace(/\.[^.]+$/i, "") ?? path
    );
}

function titleizeSlug(value: string) {
    return value
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isTabValue(value: string | undefined): value is TabValue {
    return tabValues.includes(value as TabValue);
}

function catchallSegments() {
    const value = route.params.tab;
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
}

function catchallTab() {
    return catchallSegments().at(1);
}

function modelRoute(modelId: string, tab: TabValue) {
    return `/inclusivity/viewmodel/${encodeURIComponent(modelId)}/${tab}`;
}

function isModelPath(path: unknown): path is string {
    return (
        typeof path === "string" &&
        /\/inclusivity\/viewmodel(?:\/|$)/.test(path)
    );
}

function goBack() {
    if (previousNonModelPath.value) {
        void navigateTo(previousNonModelPath.value);
    } else if (window.history.length > 1) {
        router.back();
    } else {
        void navigateTo("/");
    }
}

function configureModelViewerDecoders() {
    const modelViewerGlobal = self as typeof self & {
        ModelViewerElement?: {
            meshoptDecoderLocation?: string;
        };
    };

    modelViewerGlobal.ModelViewerElement ??= {};
    modelViewerGlobal.ModelViewerElement.meshoptDecoderLocation =
        modelViewerMeshoptDecoderLocation;
}

function handleCameraChange(event: Event) {
    const cameraChangeEvent = event as CustomEvent<{ source?: string }>;
    if (cameraChangeEvent.detail?.source === "user-interaction") {
        hasUserTakenViewerControl.value = true;
    }
}

async function handleModelLoad(event: Event) {
    isModelLoaded.value = true;

    const viewer = event.currentTarget;
    if (!(viewer instanceof HTMLElement)) return;

    try {
        const { $needsRender, $scene } =
            await import("@google/model-viewer/lib/model-viewer-base.js");
        type ModelViewerScene = {
            model: {
                traverse: (callback: (object: unknown) => void) => void;
            } | null;
        };
        type ModelViewerMesh = {
            isMesh?: boolean;
            geometry?: {
                getAttribute: (name: string) => unknown;
                computeVertexNormals: () => void;
            };
        };
        const internalViewer = viewer as HTMLElement &
            Record<typeof $scene, ModelViewerScene> &
            Record<typeof $needsRender, () => void>;
        let normalsAdded = false;

        internalViewer[$scene].model?.traverse((object) => {
            const mesh = object as ModelViewerMesh;
            if (
                mesh.isMesh &&
                mesh.geometry &&
                !mesh.geometry.getAttribute("normal")
            ) {
                mesh.geometry.computeVertexNormals();
                normalsAdded = true;
            }
        });

        if (normalsAdded) internalViewer[$needsRender]();
    } catch (error) {
        console.warn("Unable to calculate missing model normals", error);
    }
}

function syncRouteState() {
    if (!firstModel) return;

    const routeTab = catchallTab();
    const routeModel = selectedModel.value;

    if (!routeModel || !isTabValue(routeTab)) {
        void navigateTo(modelRoute(firstModel.id, "image"), {
            replace: true,
        });
        return;
    }

    if (activeTab.value !== routeTab) activeTab.value = routeTab;
}

function updateViewportPreferences() {
    isWideViewport.value = viewportQuery?.matches ?? true;
    prefersReducedMotion.value = reducedMotionQuery?.matches ?? false;
}

watch(
    () => route.fullPath,
    () => {
        const routeModelId = catchallSegments().at(0);
        if (routeModelId !== previousRouteModelId) {
            isModelLoaded.value = false;
            previousRouteModelId = routeModelId;
        }
        syncRouteState();
    },
    { immediate: true },
);

watch(activeTab, (tab) => {
    const model = selectedModel.value;
    if (!model) return;

    const target = modelRoute(model.id, tab);
    if (route.path !== target) void navigateTo(target, { replace: true });
});

onMounted(async () => {
    configureModelViewerDecoders();

    try {
        const { ModelViewerElement } = await import("@google/model-viewer");
        ModelViewerElement.meshoptDecoderLocation =
            modelViewerMeshoptDecoderLocation;
        isModelViewerReady.value = true;
    } catch (error) {
        console.error(
            "Unable to initialise the educational 3D model viewer",
            error,
        );
    }

    const historyBack = window.history.state?.back;
    if (!isModelPath(historyBack) && typeof historyBack === "string") {
        previousNonModelPath.value = historyBack;
    }

    viewportQuery = window.matchMedia("(min-width: 1024px)");
    reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    viewportQuery.addEventListener("change", updateViewportPreferences);
    reducedMotionQuery.addEventListener("change", updateViewportPreferences);
    updateViewportPreferences();
});

onBeforeUnmount(() => {
    viewportQuery?.removeEventListener("change", updateViewportPreferences);
    reducedMotionQuery?.removeEventListener(
        "change",
        updateViewportPreferences,
    );
});
</script>

<style scoped>
.overflow-wrap-anywhere {
    overflow-wrap: anywhere;
}
</style>
