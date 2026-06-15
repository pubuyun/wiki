<!-- <template>
    <div class="p-4">Congratulations! You found the test page.</div>
    <div class="flex w-full flex-col">
        <VChart :option="option" autoresize />
    </div>
</template>
<script setup lang="ts">
const option = {
    title: {
        text: "Example Chart",
    },
    tooltip: {},
    xAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },
    yAxis: {
        type: "value",
    },
    series: [
        {
            type: "bar",
            data: [120, 200, 150, 80, 70],
        },
    ],
};
</script> -->
<template>
    <div class="relative flex flex-1 flex-col">
        <ClientOnly>
            <StructureViewer />
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: "static",
});
</script>

<style></style>
