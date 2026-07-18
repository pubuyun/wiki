<template>
    <div
        class="grid min-h-dvh max-w-full gap-4 overflow-hidden bg-surface p-4 text-on-surface lg:h-[calc(100dvh-4rem)] lg:min-h-0 lg:grid-cols-[minmax(12rem,0.7fr)_minmax(0,1.5fr)_minmax(18rem,1fr)]"
    >
        <div
            v-if="isUnsupportedViewport"
            class="fixed inset-0 z-[1000] flex items-center justify-center bg-surface p-8 text-center text-on-surface"
            role="alert"
            aria-live="assertive"
        >
            <div class="flex max-w-md flex-col items-center gap-4">
                <Icon icon="lucide:rotate-cw" class="size-12" />
                <h1 class="text-2xl font-semibold">
                    A large landscape screen is required
                </h1>
                <p class="text-sm text-on-surface/75">
                    Returning to the previous page in 3 seconds...
                </p>
            </div>
        </div>

        <aside
            class="border-surface-bright flex min-h-96 min-w-0 flex-col overflow-hidden rounded-xl border bg-secondary text-on-secondary"
            aria-label="Binder files"
        >
            <button
                type="button"
                class="border-surface-bright flex h-12 shrink-0 items-center gap-2 border-b px-4 text-left text-sm font-semibold transition-colors hover:bg-primary hover:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-outline"
                @click="goBack"
            >
                <Icon icon="lucide:arrow-left" class="size-4" />
                Back to Previous
            </button>

            <div
                ref="treeScrollContainerRef"
                class="min-h-0 flex-1 overflow-auto p-2"
            >
                <TreeRoot
                    v-model="selectedTreeNode"
                    v-model:expanded="expandedKeys"
                    :items="treeItems"
                    :get-key="(item) => item.key"
                    class="flex min-w-max flex-col gap-0.5"
                    aria-label="Model data files"
                >
                    <template #default="{ flattenItems }">
                        <TreeItem
                            v-for="item in flattenItems"
                            :key="item._id"
                            v-slot="{ isExpanded, isSelected }"
                            v-bind="item.bind"
                            as="button"
                            type="button"
                            class="group flex h-8 min-w-full items-center gap-1.5 rounded px-2 text-left text-sm transition-colors outline-none hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-outline data-[selected]:bg-primary data-[selected]:text-on-primary"
                            :style="{
                                paddingLeft: `${(item.level - 1) * 16 + 8}px`,
                            }"
                            @select="
                                item.hasChildren && $event.preventDefault()
                            "
                        >
                            <Icon
                                v-if="item.hasChildren"
                                icon="lucide:chevron-right"
                                class="size-4 shrink-0 transition-transform"
                                :class="{ 'rotate-90': isExpanded }"
                            />
                            <span v-else class="w-4 shrink-0" />
                            <Icon
                                :icon="
                                    item.hasChildren
                                        ? isExpanded
                                            ? 'lucide:folder-open'
                                            : 'lucide:folder'
                                        : 'lucide:file-json'
                                "
                                class="size-4 shrink-0"
                                :class="
                                    isSelected
                                        ? 'text-on-primary'
                                        : 'text-on-secondary/65'
                                "
                            />
                            <span class="max-w-72 truncate pr-2">
                                {{ item.value.label }}
                            </span>
                        </TreeItem>
                    </template>
                </TreeRoot>
            </div>
        </aside>

        <section
            class="border-surface-bright min-h-128 min-w-0 overflow-hidden rounded-xl border bg-secondary lg:min-h-0"
            aria-label="Molecular structure viewer"
        >
            <ClientOnly>
                <StructureViewer
                    :structure-url="selectedBinder?._pdb_url ?? ''"
                    structure-url-format="pdb"
                />
                <template #fallback>
                    <div class="grid h-full place-items-center text-sm">
                        Loading structure viewer...
                    </div>
                </template>
            </ClientOnly>
        </section>

        <aside
            class="border-surface-bright min-h-128 min-w-0 overflow-hidden rounded-xl border bg-secondary text-on-secondary lg:min-h-0"
            aria-label="Binder details"
        >
            <TabsRoot v-model="activeTab" class="flex h-full min-h-0 flex-col">
                <TabsList
                    class="border-surface-bright flex shrink-0 overflow-x-auto border-b p-1"
                    aria-label="Binder detail views"
                >
                    <TabsTrigger
                        v-for="tab in tabs"
                        :key="tab.value"
                        :value="tab.value"
                        class="shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-outline data-[state=active]:bg-primary data-[state=active]:text-on-primary"
                    >
                        {{ tab.label }}
                    </TabsTrigger>
                </TabsList>

                <TabsContent
                    value="info"
                    class="min-h-0 flex-1 overflow-auto p-4 outline-none"
                >
                    <dl
                        v-if="selectedBinder"
                        class="divide-surface-bright/30 divide-y"
                    >
                        <div
                            v-for="([key, value], index) in visibleProperties"
                            :key="`${key}:${index}`"
                            class="grid gap-1 py-3 first:pt-0 sm:grid-cols-[minmax(8rem,0.8fr)_minmax(0,1.2fr)] sm:gap-3"
                        >
                            <dt class="text-sm font-semibold break-words">
                                {{ key }}
                            </dt>
                            <dd
                                class="text-sm break-words text-on-secondary/80"
                            >
                                {{ formatValue(value) }}
                            </dd>
                        </div>
                    </dl>
                </TabsContent>

                <TabsContent
                    value="md-graph"
                    class="min-h-0 flex-1 overflow-auto p-3 outline-none"
                >
                    <ClientOnly>
                        <LazyRmsdXvgChart
                            v-if="activeTab === 'md-graph' && selectedBinder"
                            :key="selectedBinder._id"
                            :src="[
                                selectedBinder._rmsd_lig_url,
                                selectedBinder._rmsd_prot_url,
                            ]"
                            title="RMSD"
                            :series-name="['Ligand', 'Protein']"
                            height-class="min-h-[32rem] lg:h-full"
                        />
                        <template #fallback>
                            <div
                                class="min-h-[32rem] lg:h-full"
                                aria-hidden="true"
                            />
                        </template>
                    </ClientOnly>
                </TabsContent>

                <TabsContent value="vmd-animation" class="min-h-0 flex-1" />
                <TabsContent value="experiment-result" class="min-h-0 flex-1" />
            </TabsRoot>
        </aside>
    </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import {
    TabsContent,
    TabsList,
    TabsRoot,
    TabsTrigger,
    TreeItem,
    TreeRoot,
} from "reka-ui";

definePageMeta({
    layout: "static",
    key: (route) => {
        const value = route.params.tab;
        const segments = Array.isArray(value) ? value : value ? [value] : [];

        return segments.slice(0, -1).join("/") || "viewbinder";
    },
});

type BinderValue = string | number | boolean | null | undefined;
type BinderRecord = Record<string, BinderValue> & {
    _id: string;
    name: string;
    _pdb_url: string;
    _rmsd_lig_url: string;
    _rmsd_prot_url: string;
};

type TreeNode = {
    key: string;
    label: string;
    children?: TreeNode[];
    loadRecord?: () => Promise<BinderRecord>;
};

const modules = import.meta.glob<BinderRecord>(
    "../../data/model/cycle*/{selected,rejected}/{proteina,rosetta}/*.json",
    { import: "default" },
);

function titleCase(segment: string) {
    if (/^cycle\d+$/i.test(segment)) {
        return segment.replace(/cycle/i, "Cycle ");
    }

    return segment.charAt(0).toUpperCase() + segment.slice(1);
}

function buildTree(): TreeNode[] {
    const roots: TreeNode[] = [];

    for (const [path, loadRecord] of Object.entries(modules).sort(([a], [b]) =>
        a.localeCompare(b),
    )) {
        const relativePath = path.split("/model/")[1];
        if (!relativePath) continue;

        const segments = relativePath.split("/");
        let siblings = roots;
        let key = "";

        segments.forEach((segment, index) => {
            key = key ? `${key}/${segment}` : segment;
            const isFile = index === segments.length - 1;
            let node = siblings.find((item) => item.key === key);

            if (!node) {
                node = {
                    key,
                    label: isFile
                        ? segment.replace(/\.json$/i, "")
                        : titleCase(segment),
                    ...(isFile ? { loadRecord } : { children: [] }),
                };
                siblings.push(node);
            }

            if (node.children) siblings = node.children;
        });
    }

    return roots;
}

function flattenTree(nodes: TreeNode[]): TreeNode[] {
    return nodes.flatMap((node) => [
        node,
        ...(node.children ? flattenTree(node.children) : []),
    ]);
}

const treeItems = buildTree();
const allTreeNodes = flattenTree(treeItems);
const firstFileNode = allTreeNodes.find((node) => node.loadRecord);
const route = useRoute();
const router = useRouter();
const previousNonBinderPath = ref<string | null>(null);
const isUnsupportedViewport = ref(false);
const treeScrollContainerRef = ref<HTMLElement | null>(null);
let viewportReturnTimer: ReturnType<typeof setTimeout> | undefined;
let viewportQuery: MediaQueryList | undefined;

const tabValues = [
    "info",
    "md-graph",
    "vmd-animation",
    "experiment-result",
] as const;
type TabValue = (typeof tabValues)[number];

function isTabValue(value: string | undefined): value is TabValue {
    return tabValues.includes(value as TabValue);
}

function catchallSegments() {
    const value = route.params.tab;
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
}

function catchallTab() {
    return catchallSegments().at(-1);
}

function binderRoute(node: TreeNode, tab: TabValue) {
    const [cycle = "", status = "", source = ""] = node.key.split("/");
    const name = node.label;
    const segments = [cycle, status, source, name, tab].map((segment) =>
        encodeURIComponent(segment),
    );

    return `/viewbinder/${segments.join("/")}`;
}

function findRouteNode() {
    const currentTab = catchallTab();
    if (!isTabValue(currentTab)) return undefined;

    return allTreeNodes.find(
        (node) =>
            node.loadRecord && binderRoute(node, currentTab) === route.path,
    );
}

const initialTab = catchallTab();
const selectedTreeNode = ref<TreeNode | undefined>(
    findRouteNode() ?? firstFileNode,
);
const expandedKeys = ref(
    allTreeNodes.filter((node) => node.children).map((node) => node.key),
);
const activeTab = ref<TabValue>(isTabValue(initialTab) ? initialTab : "info");

const tabs = [
    { value: "info", label: "Info" },
    { value: "md-graph", label: "MD Graph" },
    { value: "vmd-animation", label: "VMD Animation" },
    { value: "experiment-result", label: "Experiment Result" },
];

watch(
    () => route.fullPath,
    () => {
        const routeNode = findRouteNode();
        const routeTab = catchallTab();

        if (!routeNode || !isTabValue(routeTab)) {
            if (firstFileNode) {
                void navigateTo(binderRoute(firstFileNode, "info"), {
                    replace: true,
                });
            }
            return;
        }

        if (selectedTreeNode.value?.key !== routeNode.key) {
            selectedTreeNode.value = routeNode;
        }
        if (activeTab.value !== routeTab) activeTab.value = routeTab;
    },
    { immediate: true },
);

watch([selectedTreeNode, activeTab], ([node, tab]) => {
    if (!node?.loadRecord) return;

    const target = binderRoute(node, tab);
    if (route.path !== target) void navigateTo(target, { replace: true });
});

function centerSelectedTreeNode(behavior: ScrollBehavior) {
    const container = treeScrollContainerRef.value;
    const selectedItem = container?.querySelector<HTMLElement>(
        '[role="treeitem"][data-selected]',
    );
    if (!container || !selectedItem) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = selectedItem.getBoundingClientRect();
    const top =
        container.scrollTop +
        itemRect.top -
        containerRect.top -
        container.clientHeight / 2 +
        itemRect.height / 2;

    container.scrollTo({ top: Math.max(0, top), behavior });
}

watch(
    () => selectedTreeNode.value?.key,
    async (key) => {
        if (!key || !import.meta.client) return;
        await nextTick();
        centerSelectedTreeNode("smooth");
    },
);

const selectedBinder = shallowRef<BinderRecord>();
let recordLoadId = 0;

watch(
    () => selectedTreeNode.value,
    async (node) => {
        const loadId = ++recordLoadId;
        selectedBinder.value = undefined;
        if (!node?.loadRecord) return;

        const record = await node.loadRecord();
        if (loadId === recordLoadId) selectedBinder.value = record;
    },
    { immediate: true },
);

const visibleProperties = computed(() =>
    Object.entries(selectedBinder.value ?? {}).filter(
        ([key]) => !key.startsWith("_"),
    ),
);

function formatValue(value: BinderValue) {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
}

function isBinderPath(path: unknown): path is string {
    return typeof path === "string" && /\/viewbinder(?:\/|$)/.test(path);
}

function goBack() {
    if (previousNonBinderPath.value) {
        void navigateTo(previousNonBinderPath.value);
    } else if (window.history.length > 1) {
        router.back();
    } else {
        void navigateTo("/");
    }
}

function clearViewportReturnTimer() {
    if (viewportReturnTimer !== undefined) {
        clearTimeout(viewportReturnTimer);
        viewportReturnTimer = undefined;
    }
}

function updateViewportSupport() {
    isUnsupportedViewport.value = viewportQuery?.matches ?? false;
    clearViewportReturnTimer();

    if (isUnsupportedViewport.value) {
        viewportReturnTimer = setTimeout(goBack, 3000);
    }
}

onMounted(() => {
    const historyBack = window.history.state?.back;
    if (!isBinderPath(historyBack) && typeof historyBack === "string") {
        previousNonBinderPath.value = historyBack;
    }

    viewportQuery = window.matchMedia("(max-width: 1023px)");
    viewportQuery.addEventListener("change", updateViewportSupport);
    updateViewportSupport();

    void nextTick(() => centerSelectedTreeNode("auto"));
});

onBeforeUnmount(() => {
    clearViewportReturnTimer();
    viewportQuery?.removeEventListener("change", updateViewportSupport);
});
</script>
