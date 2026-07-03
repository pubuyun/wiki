<script setup lang="ts">
definePageMeta({
    layout: "static",
});
</script>

<template>
    <main class="flex-1">
        <div>this is the home page</div>
        <NuxtLink to="/description" class="text-text-emphasized underline"
            >Go to project description</NuxtLink
        >
    </main>
</template>
