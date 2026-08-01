<script setup lang="ts">
import { Fragment, type VNode, isVNode, reactive, useId } from "vue";
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "reka-ui";
import {
    layoutFlowchart,
    parseFlowchartDefinition,
} from "~/utils/flowchart-layout";

const props = withDefaults(
    defineProps<{
        defaultValue?: string;
        collapsedHeight?: number;
        openText?: string;
        closeText?: string;
        label?: string;
        sync?: string;
    }>(),
    {
        defaultValue: "0",
        collapsedHeight: 320,
        openText: "Expand",
        closeText: "Collapse",
        label: "Code examples",
        sync: undefined,
    },
);

const slots = defineSlots<{
    default(): VNode[];
}>();
const selected = ref(props.defaultValue);
const expanded = reactive<Record<string, boolean>>({});
const groupId = `code-group-${useId().replace(/:/g, "")}`;

function flattenVNodes(value: unknown): VNode[] {
    if (Array.isArray(value)) return value.flatMap(flattenVNodes);
    if (!isVNode(value)) return [];
    if (value.type === Fragment) return flattenVNodes(value.children);
    return [value];
}

const items = computed(() =>
    flattenVNodes(slots.default?.()).map((vnode, index) => {
        const language = String(vnode.props?.language ?? "").toLowerCase();
        return {
            isGraph: ["graph", "vueflow", "vue-flow"].includes(language),
            label:
                String(
                    vnode.props?.filename ?? vnode.props?.language ?? "",
                ).trim() || `Code ${index + 1}`,
            vnode,
            value: String(index),
        };
    }),
);

const flowchartHeight = computed(() => {
    const graphItem = items.value.find((item) => item.isGraph);
    const code = graphItem?.vnode.props?.code;
    if (typeof code !== "string") return undefined;

    try {
        const definition = parseFlowchartDefinition(JSON.parse(code));
        if (!definition) return undefined;
        return Math.max(
            320,
            definition.height ?? layoutFlowchart(definition).height,
        );
    } catch {
        return undefined;
    }
});

function isExpanded(value: string) {
    return expanded[value] ?? false;
}

function toggleExpanded(value: string) {
    expanded[value] = !isExpanded(value);
}

function paneStyle(item: (typeof items.value)[number]) {
    if (item.isGraph || isExpanded(item.value)) return undefined;
    return {
        height: `${flowchartHeight.value ?? Math.max(120, props.collapsedHeight)}px`,
    };
}

onMounted(() => {
    if (!props.sync) return;

    const key = `content-code-group-${props.sync}`;
    const saved = localStorage.getItem(key);
    if (saved && items.value.some((item) => item.value === saved)) {
        selected.value = saved;
    }

    watch(selected, (value) => localStorage.setItem(key, value));
});
</script>

<template>
    <TabsRoot
        v-model="selected"
        :default-value="props.defaultValue"
        class="my-6 min-w-0 overflow-hidden rounded-xl border-2 border-outline bg-white shadow-sm dark:bg-[#24292e]"
    >
        <TabsList
            class="flex min-w-0 gap-1 overflow-x-auto border-b-2 border-outline bg-secondary p-2 font-belanosima"
            :aria-label="props.label"
        >
            <TabsTrigger
                v-for="item in items"
                :key="item.value"
                :value="item.value"
                class="shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-sm text-on-secondary transition-colors outline-none hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-outline data-[state=active]:bg-primary data-[state=active]:text-on-primary"
            >
                {{ item.label }}
            </TabsTrigger>
        </TabsList>

        <TabsContent
            v-for="item in items"
            :key="item.value"
            :value="item.value"
            class="min-w-0 outline-none"
            :class="{
                'flex flex-col': !item.isGraph && !isExpanded(item.value),
            }"
            :style="paneStyle(item)"
            :force-mount="true"
            :hidden="selected !== item.value"
        >
            <div
                :id="`${groupId}-${item.value}`"
                class="min-w-0 [&>figure]:my-0 [&>figure]:border-0 [&>pre]:my-0 [&>pre]:rounded-none [&>pre]:shadow-none"
                :class="{
                    'min-h-0 flex-1 overflow-hidden':
                        !item.isGraph && !isExpanded(item.value),
                }"
            >
                <component :is="item.vnode" />
            </div>

            <button
                v-if="!item.isGraph"
                type="button"
                class="group flex w-full cursor-pointer items-center justify-center gap-2 border-t-2 border-outline bg-surface px-4 py-2.5 font-belanosima text-sm text-on-surface transition-colors hover:bg-surface-bright focus-visible:ring-2 focus-visible:ring-outline focus-visible:outline-none focus-visible:ring-inset"
                :aria-controls="`${groupId}-${item.value}`"
                :aria-expanded="isExpanded(item.value)"
                @click="toggleExpanded(item.value)"
            >
                <span>
                    {{
                        isExpanded(item.value)
                            ? props.closeText
                            : props.openText
                    }}
                    {{ item.label }}
                </span>
                <svg
                    viewBox="0 0 20 20"
                    class="size-4 fill-current transition-transform duration-200"
                    :class="{ 'rotate-180': isExpanded(item.value) }"
                    aria-hidden="true"
                >
                    <path
                        d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z"
                    />
                </svg>
            </button>
        </TabsContent>
    </TabsRoot>
</template>
