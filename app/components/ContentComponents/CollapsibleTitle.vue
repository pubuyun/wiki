<script setup lang="ts">
import {
    CollapsibleContent,
    CollapsibleRoot,
    CollapsibleTrigger,
} from "reka-ui";
import { useId } from "vue";

withDefaults(
    defineProps<{
        title: string;
        id?: string;
        headingTag?: "h3" | "h4" | "h5" | "h6";
    }>(),
    { headingTag: "h3" },
);

const contentId = `collapsible-title-${useId()}`;

// Match the corresponding ProseH3–ProseH6 typography and spacing.
const headingClasses = {
    h3: "mt-8 mb-3 scroll-mt-24 font-main text-xl leading-snug font-bold text-balance wrap-anywhere text-on-surface sm:mt-10 sm:text-[1.375rem] dark:text-primary",
    h4: "mt-7 mb-3 scroll-mt-24 font-main text-lg leading-snug font-bold text-balance wrap-anywhere text-on-surface sm:mt-8 dark:text-primary",
    h5: "mt-6 mb-2 scroll-mt-24 font-main text-base leading-snug font-bold text-balance wrap-anywhere text-on-surface sm:mt-7 dark:text-primary",
    h6: "mt-6 mb-2 scroll-mt-24 font-main text-sm leading-snug font-bold text-balance wrap-anywhere text-on-surface dark:text-primary",
};
</script>

<template>
    <CollapsibleRoot
        :default-open="false"
        :unmount-on-hide="false"
        class="min-w-0"
    >
        <component
            :is="headingTag"
            :id="id"
            :class="headingClasses[headingTag]"
        >
            <CollapsibleTrigger
                :aria-controls="contentId"
                class="group flex w-full min-w-0 items-start gap-2 rounded-sm text-left text-inherit focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
                <svg
                    class="mt-[0.5em] size-3 shrink-0 text-primary transition-transform duration-200 group-data-[state=open]:rotate-90 motion-reduce:transition-none"
                    viewBox="0 0 12 12"
                    fill="currentColor"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path d="M3 1 9 6 3 11Z" />
                </svg>
                <span class="min-w-0 wrap-anywhere">
                    <slot name="title">{{ title }}</slot>
                </span>
            </CollapsibleTrigger>
        </component>
        <CollapsibleContent as-child>
            <div :id="contentId" class="flow-root min-w-0 pl-5">
                <slot />
            </div>
        </CollapsibleContent>
    </CollapsibleRoot>
</template>
