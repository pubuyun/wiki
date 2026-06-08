<script setup lang="ts">
import { resolveComponent } from "vue";
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

const NuxtLink = resolveComponent("NuxtLink");
const isExpanded = ref(false);
const expandedList = ref<HTMLDivElement | null>(null);
const hasChildren = computed(
    () => props.h2.children && props.h2.children.length > 0,
);

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
        <!-- <button @click="toggleExpand" class="grid" :aria-expanded="isExpanded"> -->
        <component
            :is="hasChildren ? 'button' : NuxtLink"
            :to="hasChildren ? undefined : `#${h2.id}`"
            @click="hasChildren ? toggleExpand() : undefined"
            class="grid"
            :aria-expanded="hasChildren ? isExpanded : undefined"
        >
            <svg
                class="col-1 row-1 w-full"
                preserveAspectRatio="none"
                viewBox="-25 -15 50 30"
            >
                <path
                    d="M 8.8 -5.8 C 13.1 -6.1 19.3 -4 19 -0.4 Q 18.3 4.8 11.2 6.7 C 6.9 7.6 3.775 4.962 -0.6 5.6 C -6.5 6.7 -5.225 8.013 -10.043 9.052 Q -13.997 9.624 -16.957 9.348 Q -21.22 8.953 -24.9 4.8 Q -28.5 -0.4 -24.3 -4.9 Q -15.9 -13 -4.8 -10.6 Q -2.5 -9.8 1.1 -6.9 Q 3 -5.3 8.8 -5.8 Z"
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
                    class="fill-current font-momo-trust-display text-[0.3em] text-cblue"
                >
                    {{ h2.text }}
                </text>
            </svg>
        </component>
        <!-- </button> -->
    </div>
    <Transition
        @after-enter="keepExpandedContentVisible"
        enter-active-class="transition-all duration-500 ease-out overflow-hidden"
        enter-from-class="opacity-0 -translate-y-2 max-h-0"
        enter-to-class="opacity-100 translate-y-0 max-h-96"
        leave-active-class="transition-all duration-500 ease-in overflow-hidden"
        leave-from-class="opacity-100 translate-y-0 max-h-96"
        leave-to-class="opacity-0 -translate-y-2 max-h-0"
    >
        <div
            v-if="isExpanded && h2.children?.length"
            ref="expandedList"
            class="overflow-hidden"
        >
            <ul
                class="mx-6 list-disc space-y-2 marker:text-2xl marker:text-cblue"
            >
                <li v-for="value in h2.children" :key="value.id">
                    <NuxtLink
                        :to="`#${value.id}`"
                        class="block text-center font-momo-trust-display text-cblue hover:text-corn lg:text-lg xl:text-xl"
                    >
                        {{ value.text }}
                    </NuxtLink>
                </li>
            </ul>
        </div>
    </Transition>
</template>
