<script setup lang="ts">
import { computed } from "vue";
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "reka-ui";
import ImagePanelLayout from "./ImagePanelLayout.vue";
import LightboxImage from "./LightboxImage.vue";

const props = withDefaults(
    defineProps<{
        srcEn: string | string[];
        srcZh: string | string[];
        altEn?: string | string[];
        altZh?: string | string[];
        caption?: string;
        label?: string;
        imageBackground?: string;
        autoLabels?: boolean;
        defaultLanguage?: "en" | "zh";
    }>(),
    {
        label: "Image language",
        imageBackground: "#fff",
        autoLabels: undefined,
        defaultLanguage: "en",
    },
);

const versions = computed(() => [
    {
        value: "en",
        lang: "en",
        name: "English",
        src: Array.isArray(props.srcEn) ? props.srcEn : [props.srcEn],
        alt: props.altEn,
    },
    {
        value: "zh",
        lang: "zh-CN",
        name: "中文",
        src: Array.isArray(props.srcZh) ? props.srcZh : [props.srcZh],
        alt: props.altZh,
    },
]);
</script>

<template>
    <TabsRoot :default-value="defaultLanguage" class="my-6 max-w-full min-w-0">
        <TabsList
            :aria-label="label"
            class="bilingual-image-tabs__list not-prose"
        >
            <TabsTrigger
                v-for="version in versions"
                :key="version.value"
                :value="version.value"
                :lang="version.lang"
                class="bilingual-image-tabs__trigger"
            >
                {{ version.name }}
            </TabsTrigger>
        </TabsList>

        <TabsContent
            v-for="version in versions"
            :key="version.value"
            :value="version.value"
            :lang="version.lang"
            class="min-w-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
        >
            <LightboxImage
                :src="version.src"
                :alt="version.alt"
                :caption="caption"
                :image-background="imageBackground"
            >
                <template #default="{ open }">
                    <ImagePanelLayout
                        :src="version.src"
                        :alt="version.alt"
                        :label="caption ?? label"
                        :image-background="imageBackground"
                        :auto-labels="autoLabels ?? version.src.length > 1"
                        @open="open"
                    />
                </template>
            </LightboxImage>
        </TabsContent>
    </TabsRoot>
</template>

<style scoped>
.bilingual-image-tabs__list {
    display: flex;
    gap: 1.75rem;
    max-width: 100%;
    border-bottom: 1px solid color-mix(in srgb, var(--outline) 25%, transparent);
}

.bilingual-image-tabs__trigger {
    flex-shrink: 0;
    min-height: 2.75rem;
    margin-bottom: -1px;
    border: 0;
    border-bottom: 2px solid transparent;
    padding: 0.5rem 0.125rem 0.75rem;
    background: transparent;
    color: color-mix(in srgb, var(--on-surface) 60%, transparent);
    font-family: var(--font-main);
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.5;
    letter-spacing: 0.025em;
    cursor: pointer;
    transition:
        color 180ms ease,
        border-color 180ms ease;
}

.bilingual-image-tabs__trigger:hover,
.bilingual-image-tabs__trigger[data-state="active"] {
    color: var(--accent);
}

.bilingual-image-tabs__trigger[data-state="active"] {
    border-bottom-color: currentColor;
}

.bilingual-image-tabs__trigger:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
}

@media (prefers-reduced-motion: reduce) {
    .bilingual-image-tabs__trigger {
        transition: none;
    }
}
</style>
