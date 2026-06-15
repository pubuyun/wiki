<template>
    <div class="pointer-events-none fixed inset-0 z-9999" aria-hidden="true">
        <img
            v-for="effect in effects"
            :key="effect.id"
            class="pointer-events-none absolute h-32 w-32 max-w-none -translate-x-1/2 -translate-y-1/2 object-contain select-none"
            :src="clickImageSrc"
            alt=""
            :style="{
                left: `${effect.x}px`,
                top: `${effect.y}px`,
            }"
        />
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import clickImageSrc from "../../images/general/click.webp";

const effects = ref<{ id: number; x: number; y: number }[]>([]);
let nextId = 0;

function playClickAnimation(event: MouseEvent) {
    const id = nextId++;

    effects.value.push({
        id,
        x: event.clientX,
        y: event.clientY,
    });

    window.setTimeout(() => {
        effects.value = effects.value.filter((effect) => effect.id !== id);
    }, 650);
}

onMounted(() => {
    window.addEventListener("mousedown", playClickAnimation, {
        capture: true,
        passive: true,
    });
});

onUnmounted(() => {
    window.removeEventListener("mousedown", playClickAnimation, {
        capture: true,
    });
});
</script>
