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
            class="back-to-top fixed bottom-6 z-50 h-24 w-24 cursor-pointer border-none bg-transparent lg:hidden"
            aria-label="Back to top"
        >
            <svg
                class="pointer-events-none absolute inset-0 z-20 h-full w-full opacity-100"
                viewBox="0 -10 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <path
                        id="text-path"
                        d="M 0 0 Q 6.7519 -4.7341 15.8709 -6.0923"
                    />
                    <path
                        id="text-path-inner"
                        d="M 0 0 Q 6.7519 -4.7341 15.8709 -6.0923"
                        transform="translate(2,4) "
                    />
                </defs>
                <g transform="rotate(50 15 9) translate(2 0)">
                    <text
                        x="0"
                        y="0"
                        text-anchor="middle"
                        dominant-baseline="central"
                        class="fill-current font-momo-trust-display text-[0.25em] text-secondary"
                    >
                        <textPath href="#text-path" startOffset="50%">
                            BACK
                        </textPath>
                    </text>
                    <text
                        x="0"
                        y="0"
                        text-anchor="middle"
                        dominant-baseline="central"
                        class="fill-current font-momo-trust-display text-[0.25em] text-secondary"
                    >
                        <textPath href="#text-path-inner" startOffset="50%">
                            TO TOP
                        </textPath>
                    </text>
                </g>
            </svg>
            <img
                src="https://static.igem.wiki/teams/6133/wiki/general/backtotop-new.avif"
                alt="Back to top"
                class="absolute inset-0 z-10 h-full w-full object-contain"
                loading="lazy"
                decoding="async"
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

<style scoped>
.back-to-top {
    right: 2px !important;
}
@media (min-width: 640px) {
    .back-to-top {
        right: 24px !important;
    }
}
</style>
