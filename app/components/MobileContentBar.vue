<template>
    <nav
        class="content-bar-mobile w-full min-w-0 rounded-2xl bg-secondary font-belanosima text-on-secondary shadow-lg"
        aria-label="On this page"
    >
        <AccordionRoot
            v-model="mobileExpandedItem"
            type="single"
            collapsible
            class="w-full lg:hidden"
        >
            <AccordionItem value="toc">
                <AccordionHeader as="h2">
                    <AccordionTrigger
                        class="group flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left text-xl text-on-secondary focus-visible:ring-2 focus-visible:ring-outline focus-visible:outline-none"
                    >
                        <span
                            id="mobile-toc-title"
                            class="min-w-0 truncate"
                            title="On this page"
                            >On this page</span
                        >
                        <span
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
        <!-- CSS selects the desktop list before first paint, without a mount-time expansion. -->
        <div class="hidden lg:block">
            <h2 class="truncate px-5 py-4 text-xl">On this page</h2>
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
                        :class="link.depth === 3 ? 'text-sm' : 'text-lg'"
                        @click="scrollToHash($event, link.id)"
                    >
                        {{ link.text }}
                    </a>
                </li>
            </ul>
        </div>
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
const mobileExpandedItem = ref("");

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
