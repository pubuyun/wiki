<template>
    <CodeGroupCodeFlowchart
        v-if="parsedGraph.value"
        :graph="parsedGraph.value"
        :class="$props.class"
    />
    <CodeGroupCodeDictionary
        v-else-if="isDictLanguage"
        :source="props.code"
        :class="$props.class"
    />
    <div
        v-else-if="isGraphLanguage"
        :class="[
            $props.class,
            'my-6 overflow-hidden rounded-lg border-2 border-outline bg-surface-elevated shadow-sm',
        ]"
    >
        <p
            class="m-0 bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
        >
            Invalid Vue Flow JSON
        </p>
        <pre class="m-0 overflow-x-auto p-4 text-sm leading-6"><slot /></pre>
    </div>
    <pre
        v-else
        :class="[
            $props.class,
            'my-6 overflow-x-auto rounded-lg bg-white p-4 text-sm leading-6 shadow-sm dark:bg-[#24292e]',
        ]"
    ><slot /></pre>
</template>

<script setup lang="ts">
const props = defineProps({
    code: {
        type: String,
        default: "",
    },
    language: {
        type: String,
        default: null,
    },
    filename: {
        type: String,
        default: null,
    },
    highlights: {
        type: Array as () => number[],
        default: () => [],
    },
    meta: {
        type: String,
        default: null,
    },
    class: {
        type: String,
        default: null,
    },
});

const isGraphLanguage = computed(() =>
    ["graph", "vueflow", "vue-flow"].includes(
        props.language?.toLowerCase() ?? "",
    ),
);

const isDictLanguage = computed(() => props.language?.toLowerCase() === "dict");

const parsedGraph = computed(() => {
    if (!isGraphLanguage.value) return { value: null };

    try {
        const value = JSON.parse(props.code) as Record<string, unknown>;
        return {
            value:
                value &&
                Array.isArray(value.nodes) &&
                Array.isArray(value.edges)
                    ? value
                    : null,
        };
    } catch {
        return { value: null };
    }
});
</script>

<style>
pre code .line {
    display: block;
}
</style>
