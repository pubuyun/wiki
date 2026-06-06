<template>
    <nav
        class="sticky top-36 mb-6 max-h-[calc(100vh-11rem)] rounded-[3.5em] bg-white font-nunito shadow-lg"
        aria-labelledby="toc-title"
    >
        <h2
            id="toc-title"
            class="mx-auto flex w-5/6 -translate-y-1/2 items-center justify-center rounded-full bg-sun py-2 text-center text-5xl leading-none font-black text-cblue"
        >
            Content
        </h2>
        <div
            v-if="canScrollUp"
            class="pointer-events-none absolute top-15 left-0 z-10 h-8 w-full bg-linear-to-b from-white to-transparent"
        />
        <div
            class="max-h-[calc(100vh-18rem)] scrollbar-none overflow-y-auto"
            ref="contentScroll"
            @scroll="updateScrollGradients"
        >
            <ExpandTitle
                v-for="(child, idx) in toc"
                :key="child.id"
                :h2="child"
                :color="colors[idx % colors.length]!"
                :flip="idx % 2 == 0"
            />
        </div>
        <div
            v-if="canScrollDown"
            class="pointer-events-none absolute bottom-12 left-0 z-10 h-8 w-full rounded-b-2xl bg-linear-to-t from-white to-transparent"
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
