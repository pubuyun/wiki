<template>
    <div class="grid leading-none">
        <img
            class="col-1 row-1 h-[90vh] w-full object-cover"
            :src="imgSrc"
            alt=""
        />
        <svg
            class="top-border col-1 row-1 self-end"
            viewBox="0 -10 40 10"
            preserveAspectRatio="none"
        >
            <path
                class="fill-textbg dark:fill-textcolor"
                d="M 0 0 L 0 -9 c 1.4 0 3.2 0.5 4.436 1.875 Q 7.8 -3.8 9.4 -4.8 Q 10.826 -5.635 12.333 -5.702 Q 15.642 -6.255 18.136 -3.995 C 22.382 -1.057 22.574 -4.4 22.612 -3.077 Q 29.325 -5.392 34.01 -1.444 Q 35.806 0.009 36.423 0"
                transform="translate(0,0.1)"
            />
            <path
                class="fill-primary-bg"
                d="M 0 0 V -9 c 0.3 0 1.473 0.275 3.585 2.585 q 2.067 1.96 4.483 0.805 q 1.642 -0.82 3.237 -0.836 q 1.606 -0.124 3.713 1.126 c 5.203 3.554 4.062 1.016 9.199 0.77 q 4.938 0.231 8.643 3.45 Q 34.109 0.086 34.417 0"
                transform="translate(0,0.1)"
            />

            <text
                x="1.5"
                y="-0.7"
                class="z-20 col-1 row-1 mx-auto w-full self-end justify-self-start fill-textbg p-14 text-start font-momo-trust-display text-textbg dark:fill-textcolor dark:text-textcolor"
                :font-size="title.length > 15 ? 2.8 : 3.3"
                :letter-spacing="title.length > 15 ? 0.05 : 0.05"
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
