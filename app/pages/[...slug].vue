<script setup>
const route = useRoute();

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
// console.log(page.value.body.toc.links);
</script>

<template>
    <div v-if="page" class="flex flex-1 flex-col">
        <Banner v-if="page" :title="page.title" :imgSrc="page.meta?.banner" />
        <div
            class="flex h-full flex-1 flex-row gap-15 bg-cblue p-10 text-white"
        >
            <ContentBar class="w-1/5 shrink-0" :toc="page.body.toc.links" />
            <ContentRenderer v-if="page" :value="page" class="content flex-1" />
        </div>
    </div>
</template>

<style scoped></style>
