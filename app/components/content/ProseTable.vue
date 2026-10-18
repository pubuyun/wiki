<script setup lang="ts">
import { inject } from "vue";
import { scrollTableByKey } from "~/utils/scroll-table";

const captionId = inject<string | undefined>(
    "wiki-table-caption-id",
    undefined,
);
const protocolTableLabel = inject<(() => string) | undefined>(
    "wiki-protocol-table-label",
    undefined,
)?.();
</script>

<template>
    <div
        class="max-w-full overflow-x-auto rounded-lg border border-outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-outline"
        :class="{ 'my-8': !captionId }"
        role="region"
        :aria-label="
            captionId
                ? undefined
                : protocolTableLabel || 'Scrollable data table'
        "
        :aria-labelledby="captionId"
        tabindex="0"
        @keydown.self="protocolTableLabel && scrollTableByKey($event)"
    >
        <table
            class="w-full border-collapse text-left text-sm shadow-sm"
            :aria-labelledby="captionId"
        >
            <caption v-if="!captionId" class="sr-only">
                {{
                    protocolTableLabel || "Data table"
                }}
            </caption>
            <slot />
        </table>
    </div>
</template>

<style scoped>
table {
    /* Keep prose's emergency wrapping from shrinking columns to single letters. */
    overflow-wrap: normal;
    word-break: normal;
}

/* The rounded container draws the perimeter; cells draw the internal grid. */
:deep(tr > :first-child) {
    border-left: 0;
}

:deep(tr > :last-child) {
    border-right: 0;
}

:deep(thead > tr:first-child > *) {
    border-top: 0;
}

:deep(tbody:last-child > tr:last-child > *) {
    border-bottom: 0;
}
</style>
