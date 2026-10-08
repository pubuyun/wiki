<template>
    <nav
        class="content-bar-mobile w-full min-w-0 rounded-2xl bg-secondary font-belanosima text-on-secondary shadow-lg"
        aria-labelledby="mobile-toc-title"
    >
        <AccordionRoot
            v-model="expandedItem"
            type="single"
            :collapsible="!isLargeScreen"
            class="w-full"
        >
            <AccordionItem value="toc">
                <AccordionHeader as="h2">
                    <AccordionTrigger
                        :disabled="isLargeScreen"
                        class="group flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left text-xl text-on-secondary focus-visible:ring-2 focus-visible:ring-outline focus-visible:outline-none"
                    >
                        <span
                            id="mobile-toc-title"
                            class="min-w-0 truncate"
                            title="On this page"
                            >On this page</span
                        >
                        <span
                            v-if="!isLargeScreen"
                            class="shrink-0 text-2xl leading-none transition-transform duration-200 group-data-[state=open]:rotate-180"
                            aria-hidden="true"
                        >
                            ^
                        </span>
                    </AccordionTrigger>
                </AccordionHeader>
                <AccordionContent
                    class="overflow-hidden data-[state=closed]:animate-[mobile-content-bar-slide-up_200ms_ease-in] data-[state=open]:animate-[mobile-content-bar-slide-down_250ms_ease-out]"
                >
                    <ul class="space-y-2 px-5 pt-1 pb-5">
                        <li
                            v-for="link in flatToc"
                            :key="link.id"
                            :class="link.depth === 3 ? 'pl-5' : ''"
                        >
                            <a
                                :href="`#${link.id}`"
                                :title="link.text"
                                class="block truncate rounded-lg px-2 py-1 text-base text-on-secondary hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-outline focus-visible:outline-none"
                                :class="
                                    link.depth === 3 ? 'text-sm' : 'text-lg'
                                "
                                @click="scrollToHash($event, link.id)"
                            >
                                {{ link.text }}
                            </a>
                        </li>
                    </ul>
                </AccordionContent>
            </AccordionItem>
        </AccordionRoot>
    </nav>
</template>

<script setup lang="ts">
import {
    AccordionContent,
    AccordionHeader,
    AccordionItem,
    AccordionRoot,
    AccordionTrigger,
} from "reka-ui";

interface ToCLink {
    id: string;
    depth: number;
    text: string;
    children?: ToCLink[];
}

const props = defineProps<{
    toc: ToCLink[];
}>();

const { scrollToHash } = useHashScroll();
const isLargeScreen = ref(false);
const mobileExpandedItem = ref("");
const expandedItem = computed({
    get: () => (isLargeScreen.value ? "toc" : mobileExpandedItem.value),
    set: (value: string | undefined) => {
        mobileExpandedItem.value = value ?? "";
    },
});

let largeScreenQuery: MediaQueryList | undefined;
function updateScreenSize() {
    isLargeScreen.value = largeScreenQuery?.matches ?? false;
}

onMounted(() => {
    largeScreenQuery = window.matchMedia("(min-width: 64rem)");
    updateScreenSize();
    largeScreenQuery.addEventListener("change", updateScreenSize);
});

onBeforeUnmount(() => {
    largeScreenQuery?.removeEventListener("change", updateScreenSize);
});

const flatToc = computed(() =>
    props.toc.flatMap((link) => [
        link,
        ...(link.children?.map((child) => ({ ...child, depth: 3 })) ?? []),
    ]),
);
</script>

<style>
@keyframes mobile-content-bar-slide-down {
    from {
        height: 0;
    }
    to {
        height: var(--reka-accordion-content-height);
    }
}

@keyframes mobile-content-bar-slide-up {
    from {
        height: var(--reka-accordion-content-height);
    }
    to {
        height: 0;
    }
}
</style>
