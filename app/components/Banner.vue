<template>
    <div class="grid leading-none">
        <img
            class="col-1 row-1 object-cover"
            :src="imgSrc"
            alt="Banner Image"
        />
        <svg
            class="top-border col-1 row-1 self-end"
            viewBox="0 -10 40 10"
            preserveAspectRatio="none"
        >
            <path
                class="fill-cblue"
                d="M 0 0 L 0 -9 c 1 0 2 0 3 1 Q 6 -5 9.148 -5.944 C 13 -7 17 -6 20 -4 C 22.45 -2.333 23.676 -3.951 26 -4 Q 29.246 -4.053 32 0 L 40 0"
                transform="translate(0,0.1)"
            />
        </svg>
        <h1
            class="z-20 col-1 row-1 mx-auto w-full self-end justify-self-start p-14 text-start font-lilita-one text-[10em] font-bold text-white"
        >
            {{ title }}
        </h1>
    </div>
</template>
<script setup lang="ts">
defineProps<{
    imgSrc: string;
    title: string;
}>();
</script>
