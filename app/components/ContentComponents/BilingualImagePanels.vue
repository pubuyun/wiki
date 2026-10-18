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
            class="not-prose flex w-fit max-w-full gap-1 rounded-xl border border-outline bg-secondary p-1"
        >
            <TabsTrigger
                v-for="version in versions"
                :key="version.value"
                :value="version.value"
                :lang="version.lang"
                class="min-h-11 cursor-pointer rounded-lg px-4 py-2 text-sm text-on-secondary outline-none hover:bg-accent/20 focus-visible:ring-2 focus-visible:ring-outline data-[state=active]:bg-accent data-[state=active]:font-bold data-[state=active]:text-on-accent"
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
