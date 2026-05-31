<template>
    <div
        class="sticky top-36 mb-6 max-h-[calc(100vh-11rem)] scrollbar-none overflow-y-auto rounded-[3.5em] bg-azure"
    >
        <h2
            class="my-3 mt-10 mb-10 flex items-center justify-center text-center font-belanosima text-6xl font-semibold text-corn"
        >
            Content
        </h2>
        <div class="">
            <ExpandTitle
                v-for="(child, idx) in toc"
                :key="child.id"
                :h2="child"
                :color="colors[idx % colors.length]!"
                :flip="idx % 2 == 0"
            />
        </div>
    </div>
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

const colors = ["fill-sun", "fill-reef", "fill-corn", "fill-bremuda"];
</script>
