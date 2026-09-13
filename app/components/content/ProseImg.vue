<template>
    <LightboxImage :src="[refinedSrc]" :alt="props.alt">
        <template #default="{ open }">
            <button
                v-if="props.alt"
                type="button"
                class="my-8 block w-full cursor-zoom-in rounded-lg border border-outline bg-secondary p-0 shadow-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-outline"
                :aria-label="`Open enlarged image: ${props.alt}`"
                @click="open(0)"
            >
                <component
                    :is="ImageComponent"
                    :src="refinedSrc"
                    :alt="props.alt"
                    :width="props.width"
                    :height="props.height"
                    class="w-full rounded-lg object-cover"
                />
            </button>
            <component
                :is="ImageComponent"
                v-else
                :src="refinedSrc"
                alt=""
                :width="props.width"
                :height="props.height"
                class="my-8 w-full rounded-lg border border-outline bg-secondary object-cover shadow-sm"
            />
        </template>
    </LightboxImage>
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
