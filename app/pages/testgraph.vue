<template>
    <div class="p-4">Congratulations! You found the test graph page.</div>
    <div class="flex min-h-32 w-full flex-1 flex-col">
        <VChart class="min-h-32 flex-1" :option="option" autoresize />
    </div>
</template>
<script setup lang="ts">
definePageMeta({
    layout: "static",
});

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
</script>
