<template>
    <TooltipProvider v-if="matchedTerm" :delay-duration="150">
        <TooltipRoot v-model:open="tooltipOpen">
            <TooltipTrigger as-child>
                <button
                    ref="triggerEl"
                    type="button"
                    class="font-inherit inline cursor-help border-0 bg-transparent p-0 text-inherit not-italic underline decoration-primary decoration-2 underline-offset-4 transition-colors hover:text-outline-variant focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:hover:text-surface-bright"
                    @click="toggleTooltipForTouch"
                >
                    <slot />
                </button>
            </TooltipTrigger>
            <TooltipPortal>
                <TooltipContent
                    ref="contentEl"
                    :side-offset="6"
                    class="z-50 max-w-xs overflow-visible bg-transparent p-0"
                >
                    <div class="relative isolate">
                        <div
                            aria-hidden="true"
                            class="pointer-events-none absolute inset-0 z-0 translate-x-1 translate-y-1 rounded-xl bg-primary"
                        ></div>

                        <div
                            class="inline-annotation-content relative z-10 rounded-xl bg-surface-elevated px-3 py-2 text-on-surface shadow-lg"
                        >
                            <p>{{ matchedTerm.detail }}</p>

                            <NuxtLink
                                v-if="matchedTerm.link"
                                :to="matchedTerm.link"
                                class="inline-annotation-content mt-2 inline-block font-semibold text-on-surface underline underline-offset-2"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Learn more about {{ slotText }}
                            </NuxtLink>
                        </div>
                    </div>

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
import {
    computed,
    onBeforeUnmount,
    onMounted,
    ref,
    useSlots,
    type VNode,
} from "vue";
import {
    TooltipArrow,
    TooltipContent,
    TooltipPortal,
    TooltipProvider,
    TooltipRoot,
    TooltipTrigger,
} from "reka-ui";

type GlossaryTerm = {
    term: string | string[];
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

function textFromNodes(nodes: VNode[]): string {
    return nodes
        .map((node) => {
            if (typeof node.children === "string") return node.children;
            if (Array.isArray(node.children)) {
                return node.children
                    .map((child) =>
                        typeof child === "object" && child !== null
                            ? textFromNodes([child as VNode])
                            : String(child ?? ""),
                    )
                    .join("");
            }
            if (node.children && typeof node.children === "object") {
                const nestedSlot = (
                    node.children as { default?: () => VNode[] }
                ).default;
                return nestedSlot ? textFromNodes(nestedSlot()) : "";
            }
            return "";
        })
        .join("");
}

const slotText = computed(() => textFromNodes(slots.default?.() ?? []).trim());

const matchedTerm = computed(() => {
    const normalizedSlotText = normalizeTerm(slotText.value);

    if (!normalizedSlotText) {
        return null;
    }

    return (
        ((glossaryTerms.value ?? []) as GlossaryTerm[]).find((item) =>
            (Array.isArray(item.term) ? item.term : [item.term]).some(
                (term) => normalizeTerm(term) === normalizedSlotText,
            ),
        ) ?? null
    );
});

function normalizeTerm(term: string): string {
    return term
        .replace(/<\/?sub>/gi, "")
        .trim()
        .toLocaleLowerCase();
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
