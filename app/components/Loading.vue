<template>
    <Transition name="fade">
        <div
            v-if="isLoading"
            class="bg-primary-deep fixed inset-0 z-9999 flex items-center justify-center backdrop-blur-sm"
        >
            <img
                src="https://static.igem.wiki/teams/6133/wiki/general/loading.webp"
                alt="Loading"
                class="h-96"
            />
            <span class="sr-only">Loading...</span>
        </div>
    </Transition>
</template>

<script setup lang="ts">
const { isLoading } = useLoadingIndicator();
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
