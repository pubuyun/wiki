<script setup lang="ts">
import { provide, useId } from "vue";
import { scrollTableByKey } from "~/utils/scroll-table";

const props = defineProps<{ title: string }>();

const captionId = `protocol-${useId()}`;
let nestedTableCount = 0;
provide(
    "wiki-protocol-table-label",
    () => `${props.title}: data table ${++nestedTableCount}`,
);
</script>

<template>
    <div
        class="protocol-table my-8 max-w-full overflow-x-auto rounded-lg border border-outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-outline"
        role="region"
        :aria-labelledby="captionId"
        tabindex="0"
        @keydown.self="scrollTableByKey"
    >
        <table
            class="protocol-table__layout w-full table-fixed border-collapse text-left text-sm"
        >
            <caption :id="captionId" class="sr-only">
                {{
                    title
                }}: materials, equipment, and procedure
            </caption>
            <colgroup>
                <col class="w-[25%]" />
                <col class="w-[25%]" />
                <col class="w-[50%]" />
            </colgroup>
            <thead>
                <tr class="bg-primary text-on-primary">
                    <th scope="col" class="px-3 py-3 font-bold">
                        Materials &amp; reagents
                    </th>
                    <th scope="col" class="px-3 py-3 font-bold">Equipment</th>
                    <th scope="col" class="px-3 py-3 font-bold">Procedure</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="px-3 py-3 align-top leading-6">
                        <slot name="materials" />
                    </td>
                    <td class="px-3 py-3 align-top leading-6">
                        <slot name="equipment" />
                    </td>
                    <td class="px-3 py-3 align-top leading-6">
                        <slot name="procedure" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.protocol-table__layout {
    min-width: 40rem;
    overflow-wrap: normal;
    word-break: normal;
}

.protocol-table__layout > thead > tr > th,
.protocol-table__layout > tbody > tr > td {
    border-inline-end: 1px solid var(--color-outline);
}

.protocol-table__layout > thead > tr > th:last-child,
.protocol-table__layout > tbody > tr > td:last-child {
    border-inline-end: 0;
}

.protocol-table__layout > tbody > tr > td {
    border-block-start: 1px solid var(--color-outline);
    overflow-wrap: anywhere;
}

.protocol-table :deep(td > :first-child) {
    margin-block-start: 0;
}

.protocol-table :deep(td > :last-child) {
    margin-block-end: 0;
}

.protocol-table :deep(ul),
.protocol-table :deep(ol),
.protocol-table :deep(p) {
    font-size: inherit;
}

.protocol-table :deep(li) {
    line-height: 1.6;
}

.protocol-table :deep(table table) {
    font-size: 0.8125rem;
}

.protocol-table :deep(table table th),
.protocol-table :deep(table table td) {
    padding: 0.5rem;
}
</style>
