<script setup lang="ts">
definePageMeta({
    layout: "static",
});
</script>

<template>
    <article class="flex-1">
        <div>this is the home page</div>
        <NuxtLink to="/description" class="text-text-emphasized underline"
            >Go to project description</NuxtLink
        >
    </article>
</template>
