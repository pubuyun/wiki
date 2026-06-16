<template>
    <div class="relative flex flex-1 flex-col">
        <ClientOnly>
            <div
                class="w-2/3 md:h-[calc(100dvh-2.5rem)] lg:h-[calc(100dvh-3.25rem)] xl:h-[calc(100dvh-4rem)]"
            >
                <StructureViewer
                    ref="structureViewerRef"
                    structure-url="https://files.rcsb.org/download/6EXS.pdb"
                    structure-url-format="pdb"
                />
            </div>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: "static",
});
</script>

<style></style>
