<script setup>
const route = useRoute();

definePageMeta({
    pageTransition: {
        name: "content",
        mode: "out-in",
    },
});

const { data: page } = await useAsyncData(`content-${route.path}`, () =>
    queryCollection("content").path(route.path).first(),
);

if (!page.value) {
    throw createError({
        statusCode: 404,
        statusMessage: "Page not found",
        fatal: true,
    });
}
console.log(page);
</script>

<template>
    <div>
        <ContentRenderer
            v-if="page"
            :value="page"
            class="content"
            enter-active-class="transition-all duration-400"
            enter-from-class="opacity-0 blur-sm"
            leave-active-class="transition-all duration-400"
            leave-to-class="opacity-0 blur-sm"
        />
    </div>
</template>

<style scoped>
/* .content-enter-active,
.content-leave-active {
    transition: all 0.4s;
}
.content-enter-from,
.content-leave-to {
    opacity: 0;
    filter: blur(1rem);
} */
</style>
