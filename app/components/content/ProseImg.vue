<template>
    <ContentComponentsLightboxImage
        :src="[refinedSrc]"
        :alt="props.alt"
        :caption="props.title"
    >
        <template #default="{ open }">
            <button
                v-if="props.alt"
                type="button"
                class="block w-full cursor-zoom-in rounded-lg border border-outline bg-secondary p-0 shadow-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-outline"
                :class="{ 'my-8': !props.title }"
                :aria-label="`Open enlarged image: ${props.alt}`"
                @click="open(0)"
            >
                <component
                    :is="ImageComponent"
                    :src="refinedSrc"
                    :alt="props.alt"
                    :width="props.width"
                    :height="props.height"
                    class="h-auto w-full rounded-lg object-cover"
                    decoding="async"
                />
            </button>
            <component
                :is="ImageComponent"
                v-else
                :src="refinedSrc"
                alt=""
                :width="props.width"
                :height="props.height"
                class="h-auto w-full rounded-lg border border-outline bg-secondary object-cover shadow-sm"
                :class="{ 'my-8': !props.title }"
                decoding="async"
            />
        </template>
    </ContentComponentsLightboxImage>
</template>

<script setup lang="ts">
import { withTrailingSlash, withLeadingSlash, joinURL } from "ufo";
import { useRuntimeConfig, computed } from "#imports";

import ImageComponent from "#build/mdc-image-component.mjs";

const props = defineProps({
    src: {
        type: String,
        default: "",
    },
    alt: {
        type: String,
        default: "",
    },
    title: {
        type: String,
        default: "",
    },
    width: {
        type: [String, Number],
        default: undefined,
    },
    height: {
        type: [String, Number],
        default: undefined,
    },
});

const refinedSrc = computed(() => {
    if (props.src?.startsWith("/") && !props.src.startsWith("//")) {
        const _base = withLeadingSlash(
            withTrailingSlash(useRuntimeConfig().app.baseURL),
        );
        if (_base !== "/" && !props.src.startsWith(_base)) {
            return joinURL(_base, props.src);
        }
    }
    return props.src;
});
</script>
