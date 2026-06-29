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
                class="fill-textbg"
                d="M 0 0 L 0 -9 c 1.4 0 3.2 0.5 4.436 1.875 Q 7.8 -3.8 9.4 -4.8 Q 10.788 -5.629 12.2 -6 Q 14.4 -6.3 15.4 -5.5 C 20.795 -1.028 22 -5.5 26.2 -5.5 Q 29.7 -5.5 31.7 -2.3 Q 32.363 -1.158 33.4 0"
                transform="translate(0,0.1)"
            />
            <path
                class="fill-primary-bg"
                d="M 0 0 V -9 c 0.3 0 1.473 0.275 3.585 2.585 q 2.067 1.96 4.483 0.805 q 1.642 -0.82 3.237 -0.836 q 1.509 0 2.779 1.04 c 4.291 3.395 4.703 -0.429 10.146 -0.422 Q 27.8 -5.9 30.3 -1.8 q 0.619 0.865 1.4 1.8"
                transform="translate(0,0.1)"
            />

            <text
                x="2"
                y="-1"
                :textLength="title.length > 12 ? 20 : undefined"
                lengthAdjust="spacingAndGlyphs"
                class="z-20 col-1 row-1 mx-auto w-full self-end justify-self-start fill-textbg p-14 text-start font-momo-trust-display text-[0.23em] text-textbg"
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
