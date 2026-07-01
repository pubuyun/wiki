<template>
    <div
        class="relative flex flex-1 flex-col gap-4 p-4 text-text-main lg:flex-row"
    >
        <aside class="flex w-full flex-col gap-4 lg:w-1/3">
            <SelectRoot v-model="selectedBinderKey">
                <SelectTrigger
                    class="text-text-emphasized inline-flex h-10 w-full items-center justify-between gap-2 rounded border border-accent-primary bg-surface-content px-3 text-left text-sm outline-none hover:bg-accent-warm focus:ring-2 focus:ring-focus-ring"
                    aria-label="Select binder"
                >
                    <SelectValue placeholder="Select binder" />
                    <SelectIcon>
                        <Icon icon="lucide:chevron-down" class="h-4 w-4" />
                    </SelectIcon>
                </SelectTrigger>

                <SelectPortal>
                    <SelectContent
                        class="text-text-emphasized z-100 max-h-80 overflow-hidden rounded border border-accent-primary bg-surface-content shadow-lg"
                        position="popper"
                        :side-offset="4"
                    >
                        <SelectViewport class="p-1">
                            <SelectItem
                                v-for="binder in selectedBinders"
                                :key="binder.optionKey"
                                :value="binder.optionKey"
                                class="data-highlighted:text-text-emphasized relative flex min-h-9 cursor-pointer items-center rounded px-8 py-2 text-sm outline-none select-none data-highlighted:bg-accent-warm"
                            >
                                <SelectItemIndicator
                                    class="absolute left-2 inline-flex items-center"
                                >
                                    <Icon icon="lucide:check" class="h-4 w-4" />
                                </SelectItemIndicator>
                                <SelectItemText>
                                    {{ binder.expname ?? binder.name }}
                                </SelectItemText>
                            </SelectItem>
                        </SelectViewport>
                    </SelectContent>
                </SelectPortal>
            </SelectRoot>

            <pre
                class="text-text-emphasized min-h-0 flex-1 rounded border border-accent-primary bg-surface-content p-4 text-sm leading-6 wrap-break-word whitespace-pre-wrap"
                >{{ selectedBinderText }}</pre
            >
        </aside>

        <ClientOnly>
            <div
                class="min-h-128 w-full lg:h-[calc(100dvh-3.25rem)] lg:min-h-0 lg:w-2/3 xl:h-[calc(100dvh-4rem)]"
            >
                <StructureViewer
                    ref="structureViewerRef"
                    :structure-url="selectedBinderStructureUrl"
                    structure-url-format="pdb"
                />
            </div>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import {
    SelectContent,
    SelectIcon,
    SelectItem,
    SelectItemIndicator,
    SelectItemText,
    SelectPortal,
    SelectRoot,
    SelectTrigger,
    SelectValue,
    SelectViewport,
} from "reka-ui";
import cycle1Binders from "~/data/model/cycle1binders.json";
import cycle2Binders from "~/data/model/cycle2binders.json";

definePageMeta({
    layout: "static",
});

type BinderValue = string | number | boolean | null | undefined;
type BinderRecord = Record<string, BinderValue> & {
    _id: string;
    name: string;
    selected?: boolean;
    expname?: string;
    _pdb_url?: string;
};
type BinderOption = BinderRecord & {
    cycle: string;
    optionKey: string;
};

const allBinders = [
    ...(cycle1Binders as BinderRecord[]).map((binder) => ({
        ...binder,
        cycle: "Cycle 1",
    })),
    ...(cycle2Binders as BinderRecord[]).map((binder) => ({
        ...binder,
        cycle: "Cycle 2",
    })),
].map((binder, index) => ({
    ...binder,
    optionKey: `${binder.cycle}:${binder._id}:${index}`,
}));

const selectedBinders = allBinders.filter(
    (binder): binder is BinderOption => binder.selected === true,
);
const selectedBinderKey = ref(selectedBinders[0]?.optionKey ?? "");

const selectedBinder = computed(() =>
    selectedBinders.find(
        (binder) => binder.optionKey === selectedBinderKey.value,
    ),
);

const selectedBinderStructureUrl = computed(
    () => selectedBinder.value?._pdb_url ?? "",
);

const selectedBinderText = computed(() => {
    if (!selectedBinder.value) return "";

    return Object.entries(selectedBinder.value)
        .filter(([key]) => key !== "optionKey" && !key.startsWith("_"))
        .map(([key, value]) => `${key}: ${value ?? ""}`)
        .join("\n");
});
</script>

<style></style>
