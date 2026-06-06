<template>
    <div class="grid leading-none">
        <img class="col-1 row-1 object-cover" :src="imgSrc" alt="" />
        <svg
            class="top-border col-1 row-1 self-end"
            viewBox="0 -10 40 10"
            preserveAspectRatio="none"
        >
            <path
                class="fill-white"
                d="M -6 0 L -6 -9 L 0 -9 c 1 0 2 0 3 1 Q 6 -5 9.148 -5.944 C 13 -7 17 -7 20 -5 C 23 -3 23.676 -3.951 26 -4 Q 30 -4 32 0 L 40 0"
                transform="translate(2,0.1)"
            />
            <path
                class="fill-cblue"
                d="M -6 0 L -6 -9 L 0 -9 c 1 0 2 0 3 1 Q 6 -5 9.148 -5.944 C 13 -7 17 -7 20 -5 C 23 -3 23.676 -3.951 26 -4 Q 30 -4 32 0 L 40 0"
                transform="translate(0,0.1)"
            />

            <text
                x="2"
                y="-1"
                :textLength="title.length > 12 ? 20 : undefined"
                lengthAdjust="spacingAndGlyphs"
                class="z-20 col-1 row-1 mx-auto w-full self-end justify-self-start fill-white p-14 text-start font-lilita-one text-[0.25em] font-bold text-white"
            >
                {{ title }}
            </text>
        </svg>
        <h1 class="sr-only">
            {{ title }}
        </h1>
        <!-- 为了Accessibility -->
    </div>
</template>
<script setup lang="ts">
defineProps<{
    imgSrc: string;
    title: string;
}>();
</script>
