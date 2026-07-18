<template>
    <TooltipProvider v-if="matchedTerm" :delay-duration="150">
        <TooltipRoot v-model:open="tooltipOpen">
            <TooltipTrigger as-child>
                <button
                    ref="triggerEl"
                    type="button"
                    class="font-inherit hover:text-surface-bright inline cursor-help border-0 bg-transparent p-0 text-inherit not-italic underline decoration-primary decoration-2 underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    @click="toggleTooltipForTouch"
                >
                    <slot />
                </button>
            </TooltipTrigger>
            <TooltipPortal>
                <TooltipContent
                    ref="contentEl"
                    :side-offset="6"
                    class="z-50 max-w-xs rounded-md bg-surface-elevated px-3 py-2 text-sm leading-relaxed text-on-surface shadow-lg"
                >
                    <p>{{ matchedTerm.detail }}</p>
                    <NuxtLink
                        v-if="matchedTerm.link"
                        :to="matchedTerm.link"
                        class="mt-2 inline-block font-semibold text-primary underline decoration-primary/60 decoration-2 underline-offset-4"
                        target="_blank"
                    >
                        Learn more
                    </NuxtLink>
                    <TooltipArrow class="fill-surface-elevated" />
                </TooltipContent>
            </TooltipPortal>
        </TooltipRoot>
    </TooltipProvider>
    <em v-else class="italic">
        <slot />
    </em>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useSlots } from "vue";
import {
    TooltipArrow,
    TooltipContent,
    TooltipPortal,
    TooltipProvider,
    TooltipRoot,
    TooltipTrigger,
} from "reka-ui";

type GlossaryTerm = {
    term: string;
    detail: string;
    link?: string;
};

const slots = useSlots();
const tooltipOpen = ref(false);
const triggerEl = ref<HTMLElement | null>(null);
const contentEl = ref<HTMLElement | null>(null);

const { data: glossaryTerms } = await useAsyncData("glossary-terms", () =>
    queryCollection("glossary").all(),
);

const slotText = computed(() =>
    (slots.default?.()[0]?.children?.toString() ?? "").trim(),
);

const matchedTerm = computed(() => {
    const normalizedSlotText = normalizeTerm(slotText.value);

    if (!normalizedSlotText) {
        return null;
    }

    return (
        ((glossaryTerms.value ?? []) as GlossaryTerm[]).find(
            (item) => normalizeTerm(item.term) === normalizedSlotText,
        ) ?? null
    );
});

function normalizeTerm(term: string): string {
    return term.trim().toLocaleLowerCase();
}

function isTouchTooltipInteraction() {
    if (typeof window === "undefined") return false;

    return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

function toggleTooltipForTouch(event: MouseEvent) {
    if (!isTouchTooltipInteraction()) return;

    event.preventDefault();
    tooltipOpen.value = !tooltipOpen.value;
}

function closeTooltipOnOutsidePointer(event: PointerEvent) {
    if (!tooltipOpen.value || !isTouchTooltipInteraction()) return;

    const target = event.target;
    if (!(target instanceof Node)) return;

    if (
        triggerEl.value?.contains(target) ||
        contentEl.value?.contains(target)
    ) {
        return;
    }

    tooltipOpen.value = false;
}

onMounted(() => {
    document.addEventListener("pointerdown", closeTooltipOnOutsidePointer);
});

onBeforeUnmount(() => {
    document.removeEventListener("pointerdown", closeTooltipOnOutsidePointer);
});
</script>
