<template>
    <div class="relative z-0 flex min-h-screen flex-col">
        <header class="sticky top-0 z-100 flex w-full flex-col">
            <NavigationBar />
            <ProgressBar :progress="progress" />
        </header>
        <main class="flex flex-1"><slot /></main>

        <BackToTop />
    </div>
</template>
<script setup lang="ts">
const progress = ref(0);
function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
    progress.value = (scrollTop / docHeight) * 100;
}
onMounted(() => {
    window.addEventListener("scroll", updateProgress);
});
onUnmounted(() => {
    window.removeEventListener("scroll", updateProgress);
});
</script>
