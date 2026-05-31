<template>
    <pre
        :class="[
            $props.class,
            'my-6 overflow-x-auto rounded-lg p-4 text-sm leading-6 shadow-sm',
        ]"
    ><slot /></pre>
</template>

<script setup lang="ts">
defineProps({
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
</script>

<style>
pre code .line {
    display: block;
}
</style>
