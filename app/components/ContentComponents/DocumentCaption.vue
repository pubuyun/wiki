<script setup lang="ts">
import ProseEm from "../content/ProseEm.vue";
import ProseStrong from "../content/ProseStrong.vue";
import type { MinimarkTree } from "minimark";

withDefaults(
    defineProps<{
        text: string;
        body?: MinimarkTree | null;
        as?: "span" | "figcaption" | "p" | "div";
    }>(),
    { as: "span" },
);
</script>

<template>
    <component :is="as" class="document-caption">
        <ContentRenderer
            v-if="body"
            :value="body"
            :prose="false"
            :components="{ em: ProseEm, strong: ProseStrong, p: 'span' }"
            :tag="as === 'div' ? 'div' : 'span'"
        />
        <template v-else>{{ text }}</template>
    </component>
</template>

<style scoped>
.document-caption {
    display: block;
    margin: 1rem 0 0;
    font-family: "Times New Roman", serif;
    font-size: 1rem;
    line-height: 1.5;
    text-align: justify;
    overflow-wrap: anywhere;
}
</style>
