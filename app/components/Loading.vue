<template>
    <Transition name="fade">
        <div
            v-if="showLoading"
            class="fixed inset-0 z-9999 flex items-center justify-center bg-primary-deep backdrop-blur-sm"
        >
            <NuxtImg :src="loadingImageUrl" alt="Loading" class="h-96" />
            <span class="sr-only">Loading...</span>
        </div>
    </Transition>
</template>

<script setup lang="ts">
const showLoading = ref(false);
const canShowRouteLoading = ref(false);

const nuxtApp = useNuxtApp();
const router = useRouter();

onMounted(async () => {
    await router.isReady();
    canShowRouteLoading.value = true;
});

nuxtApp.hook("page:loading:start", () => {
    if (canShowRouteLoading.value) {
        showLoading.value = true;
    }
});

nuxtApp.hook("page:loading:end", () => {
    showLoading.value = false;
});

const loadingImageUrl =
    "https://static.igem.wiki/teams/6133/wiki/general/loading.webp";
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
