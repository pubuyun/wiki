<template>
    <nav
        class="sticky top-34 mb-6 max-h-[calc(100vh-11rem)] flex-col rounded-[3.5em] bg-azure px-1 py-10 font-momo-trust-display shadow-lg"
        aria-labelledby="toc-title"
    >
        <!-- <h2
            id="toc-title"
            class="mx-auto flex w-5/6 -translate-y-1/2 items-center justify-center rounded-full bg-sun py-2 text-center text-5xl leading-none text-cblue"
        >
            Content
        </h2> -->
        <h2 class="sr-only" id="toc-title">Table of contents</h2>

        <div
            class="max-h-full min-h-0 w-full flex-1 scrollbar-none overflow-y-auto"
            ref="contentScroll"
            @scroll="updateScrollGradients"
        >
            <ExpandTitle
                v-for="(child, idx) in toc"
                :key="child.id"
                :h2="child"
                :color="colors[idx % colors.length]!"
                :flip="idx % 2 == 1"
            />
        </div>
        <!-- top gradient -->
        <div
            v-if="canScrollUp"
            class="pointer-events-none absolute top-10 right-1 left-1 z-10 h-8 rounded-t-lg bg-linear-to-b from-azure to-transparent"
        />

        <!-- bottom gradient -->
        <div
            v-if="canScrollDown"
            class="pointer-events-none absolute right-1 bottom-10 left-1 z-10 h-8 rounded-b-lg bg-linear-to-t from-azure to-transparent"
        />
    </nav>
</template>
<script setup lang="ts">
import ExpandTitle from "./ContentBar/ExpandTitle.vue";

interface ToCLink {
    id: string;
    depth: number;
    text: string;
    children?: ToCLink[];
}
defineProps<{
    toc: ToCLink[];
}>();

const colors = [
    "fill-corn",
    "fill-spray",
    "fill-persimmon",
    "fill-reef",
    "fill-sun",
    "fill-vred",
    "fill-azure",
    "fill-bermuda",
];

const contentScroll = ref<HTMLDivElement | null>(null);
const canScrollUp = ref(false);
const canScrollDown = ref(false);

function updateScrollGradients() {
    const el = contentScroll.value;
    if (!el) return;

    const scrollTop = el.scrollTop;
    const clientHeight = el.clientHeight;
    const scrollHeight = el.scrollHeight;

    canScrollUp.value = scrollTop > 0;
    canScrollDown.value = scrollTop + clientHeight < scrollHeight - 1;
}
watch(contentScroll, (newVal) => {
    if (newVal) {
        updateScrollGradients();
    }
});
</script>
