<script setup lang="ts">
import {
    CollapsibleContent,
    CollapsibleRoot,
    CollapsibleTrigger,
} from "reka-ui";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps<{
    title: string;
    id?: string;
    preview?: boolean;
    blurPreview?: boolean;
    headingTag?: "h2" | "h3" | "h4";
}>();

const previewEnabled = computed(() => props.preview || props.blurPreview);
const isOpen = ref(false);
const contentBody = ref<HTMLElement | null>(null);
const expandedHeight = ref(0);
let resizeObserver: ResizeObserver | undefined;

function updateExpandedHeight() {
    if (contentBody.value) {
        // Measure the unconstrained body so shorter content can shrink the card.
        expandedHeight.value = Math.ceil(
            contentBody.value.getBoundingClientRect().height,
        );
    }
}

onMounted(() => {
    updateExpandedHeight();
    if (contentBody.value) {
        resizeObserver = new ResizeObserver(updateExpandedHeight);
        resizeObserver.observe(contentBody.value);
    }
    window.addEventListener("resize", updateExpandedHeight);
});

onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    window.removeEventListener("resize", updateExpandedHeight);
});
</script>

<template>
    <CollapsibleRoot
        v-model:open="isOpen"
        :unmount-on-hide="false"
        class="flex min-w-0 flex-col transition-[gap] duration-300 motion-reduce:transition-none"
        :class="previewEnabled || isOpen ? 'gap-4' : 'gap-0'"
    >
        <component
            :is="headingTag || 'h2'"
            :id="id"
            class="flex scroll-mt-24 flex-row items-center justify-center gap-3 sm:gap-8"
        >
            <CollapsibleTrigger
                class="group flex h-min max-w-full min-w-0 rounded-4xl bg-accent text-on-accent transition-colors hover:bg-accent/90 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-outline"
            >
                <span
                    class="mx-3 my-1.5 flex min-w-0 items-center justify-center gap-2 p-2 text-center font-momo-trust-display text-3xl break-words sm:mx-6 sm:gap-3"
                >
                    {{ title }}
                    <svg
                        class="size-7 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <path d="m5 7.5 5 5 5-5" />
                    </svg>
                </span>
            </CollapsibleTrigger>
            <span
                aria-hidden="true"
                class="my-10 min-w-3 flex-1 border-3 border-t-2 border-accent"
            />
        </component>

        <CollapsibleContent force-mount class="relative">
            <div
                class="content paragraph collapsible-card overflow-wrap-anywhere relative min-w-0 rounded-2xl bg-secondary text-on-secondary sm:rounded-3xl lg:rounded-4xl"
                :data-preview="previewEnabled ? '' : undefined"
                :data-state="isOpen ? 'open' : 'closed'"
                :style="{ '--expanded-height': `${expandedHeight}px` }"
            >
                <div
                    ref="contentBody"
                    class="p-4 transition-[filter] duration-300 motion-reduce:transition-none sm:p-5 lg:p-6"
                    :inert="!isOpen"
                    :class="
                        previewEnabled && !isOpen
                            ? 'pointer-events-none blur-sm select-none'
                            : ''
                    "
                >
                    <slot />
                </div>
                <button
                    v-if="previewEnabled && !isOpen"
                    type="button"
                    class="absolute inset-0 w-full cursor-pointer rounded-[inherit] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-outline"
                    :aria-label="`Expand ${title}`"
                    @click.stop="isOpen = true"
                />
            </div>
        </CollapsibleContent>
    </CollapsibleRoot>
</template>

<style scoped>
.overflow-wrap-anywhere {
    overflow-wrap: anywhere;
}

.collapsible-card {
    max-height: 0;
    overflow: hidden;
    transition: max-height 300ms ease;
}

.collapsible-card[data-preview] {
    max-height: 9rem;
}

.collapsible-card[data-state="open"] {
    max-height: var(--expanded-height);
}

@media (prefers-reduced-motion: reduce) {
    .collapsible-card {
        transition: none;
    }
}
</style>
