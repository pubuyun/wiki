<template>
    <Transition
        name="fade"
        enter-active-class="duration-300 ease-out"
        enter-from-class="transform opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="transform opacity-0"
    >
        <button
            @click="scrollToTop"
            v-show="visible"
            class="back-to-top fixed right-6 bottom-6 z-50 h-14 w-14 cursor-pointer border-none bg-transparent"
            aria-label="Back to top"
        >
            <img
                src="/general/BackToTop.png"
                alt="Back to top"
                class="h-full w-full object-contain"
            />
        </button>
    </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const visible = ref(false);

function onScroll() {
    visible.value = window.scrollY > 200;
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(() => {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
});

onUnmounted(() => {
    window.removeEventListener("scroll", onScroll);
});
</script>

<style scoped></style>
