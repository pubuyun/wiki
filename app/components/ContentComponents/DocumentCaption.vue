<script setup lang="ts">
import ProseEm from "../content/ProseEm.vue";
import ProseStrong from "../content/ProseStrong.vue";

withDefaults(
    defineProps<{
        text: string;
        as?: "span" | "figcaption" | "p";
    }>(),
    { as: "span" },
);
</script>

<template>
    <component :is="as" class="document-caption">
        <MDC :value="text" v-slot="{ body }">
            <MDCRenderer
                v-if="body"
                :body="body"
                :prose="false"
                :components="{ em: ProseEm, strong: ProseStrong, p: 'span' }"
                tag="span"
            />
        </MDC>
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
