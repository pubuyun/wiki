<script setup lang="ts">
interface ToCLink {
    id: string;
    depth: number;
    text: string;
    children?: ToCLink[];
}
const props = defineProps<{
    h2: ToCLink;
    color: string;
    flip: boolean;
}>();

const isExpanded = ref(false);
const expandedList = ref<HTMLUListElement | null>(null);

async function toggleExpand() {
    isExpanded.value = !isExpanded.value;
}

function keepExpandedContentVisible() {
    expandedList.value?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
    });
}
</script>
<template>
    <div class="flex justify-center gap-5">
        <button @click="toggleExpand" class="grid" :aria-expanded="isExpanded">
            <svg
                class="col-1 row-1 w-full"
                preserveAspectRatio="none"
                viewBox="-25 -15 50 30"
            >
                <path
                    d="M 8 -8 Q 15 -12 19 0 Q 20 3 8 8 Q 4 10 -1 7 Q -5 5 -10 8 Q -14 10 -18 10 Q -23 10 -26 4 Q -28 -2 -23 -7 Q -15 -14 -10 -11 Q -5.806 -8.239 -3 -6 Q 0 -4 8 -8 Z"
                    :class="color"
                    :transform="
                        flip ? 'scale(1, -1) translate(5,0)' : 'translate(5,0)'
                    "
                />
                <text
                    x="0"
                    y="0"
                    text-anchor="middle"
                    dominant-baseline="central"
                    class="fill-current font-belanosima text-[0.3em] font-semibold text-cblue"
                >
                    {{ h2.text }}
                </text>
            </svg>
        </button>
    </div>
    <Transition
        @after-enter="keepExpandedContentVisible"
        enter-active-class="transition-all duration-300"
        enter-from-class="opacity-0 -translate-y-2 max-h-0"
        enter-to-class="opacity-100 translate-y-0 max-h-96"
        leave-active-class="transition-all duration-300"
        leave-from-class="opacity-100 translate-y-0 max-h-96"
        leave-to-class="opacity-0 -translate-y-2 max-h-0"
    >
        <ul
            ref="expandedList"
            v-if="isExpanded && h2.children?.length"
            class="ml-20 list-disc space-y-2 marker:text-2xl marker:text-cblue"
        >
            <li v-for="value in h2.children" :key="value.id" class="">
                <a
                    :href="`#${value.id}`"
                    class="block font-belanosima text-2xl text-cblue hover:text-corn"
                >
                    {{ value.text }}
                </a>
            </li>
        </ul>
    </Transition>
</template>
