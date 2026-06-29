<template>
    <div
        ref="animationLayer"
        class="pointer-events-none fixed inset-0 z-9999"
        aria-hidden="true"
    >
        <img
            v-for="effect in effects"
            :key="effect.id"
            class="pointer-events-none absolute h-32 w-32 max-w-none -translate-x-1/2 -translate-y-1/2 object-contain select-none"
            :src="`https://static.igem.wiki/teams/6133/wiki/general/clicking-animation.webp?click=${effect.id}`"
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

const effects = ref<{ id: number; x: number; y: number }[]>([]);
const animationLayer = ref<HTMLElement | null>(null);
let nextId = 0;

function playClickAnimation(event: PointerEvent) {
    const layer = animationLayer.value;

    if (!layer) {
        return;
    }

    const rect = layer.getBoundingClientRect();
    const id = nextId++;

    effects.value.push({
        id,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    });

    window.setTimeout(() => {
        effects.value = effects.value.filter((effect) => effect.id !== id);
    }, 650);
}

onMounted(() => {
    window.addEventListener("pointerdown", playClickAnimation, {
        capture: true,
        passive: true,
    });
});

onUnmounted(() => {
    window.removeEventListener("pointerdown", playClickAnimation, {
        capture: true,
    });
});
</script>
