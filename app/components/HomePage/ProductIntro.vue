<script setup lang="ts">
const THINKING_IMAGE =
    "https://static.igem.wiki/teams/6133/wiki/homepage/thinking.avif";

const THINKING_IMAGE_LAYOUT = {
    landscape: {
        left: "clamp(2.5rem, 14vw, 16rem)",
        bottom: "clamp(2.5rem, 8svh, 7rem)",
        width: "clamp(11rem, 20vw, 23rem)",
    },
    portrait: {
        left: "clamp(1rem, 8vw, 4rem)",
        bottom: "clamp(2rem, 7svh, 5rem)",
        width: "clamp(8.5rem, 38vw, 15rem)",
    },
} as const;

const thinkingImageStyle = {
    "--thinking-image-left": THINKING_IMAGE_LAYOUT.landscape.left,
    "--thinking-image-bottom": THINKING_IMAGE_LAYOUT.landscape.bottom,
    "--thinking-image-width": THINKING_IMAGE_LAYOUT.landscape.width,
    "--thinking-image-left-portrait": THINKING_IMAGE_LAYOUT.portrait.left,
    "--thinking-image-bottom-portrait": THINKING_IMAGE_LAYOUT.portrait.bottom,
    "--thinking-image-width-portrait": THINKING_IMAGE_LAYOUT.portrait.width,
};
</script>

<template>
    <section
        class="product-intro relative h-svh min-h-screen overflow-hidden bg-[#07366f] text-white"
        :style="thinkingImageStyle"
        aria-labelledby="product-intro-question"
    >
        <p id="product-intro-question" class="product-intro__question">
            This raises the question: is there a safer, more targeted and more
            inclusive way to prevent underarm odor?
        </p>

        <p class="product-intro__answer">
            <span aria-hidden="true">—</span>
            Absolutely
        </p>

        <img
            class="product-intro__character"
            :src="THINKING_IMAGE"
            alt="A character thinking about the question"
            loading="eager"
            decoding="async"
            draggable="false"
        />
    </section>
</template>

<style scoped>
.product-intro {
    font-family: var(--font-righteous), sans-serif;
}

.product-intro__question {
    position: absolute;
    top: clamp(8rem, 28svh, 18rem);
    left: 50%;
    width: min(82vw, 90rem);
    margin: 0;
    transform: translateX(-50%);
    font-size: clamp(1.75rem, 3.35vw, 4rem);
    line-height: 1.22;
    letter-spacing: 0.005em;
    text-align: center;
    text-wrap: balance;
}

.product-intro__answer {
    position: absolute;
    top: clamp(24rem, 63svh, 39rem);
    left: 50%;
    margin: 0;
    transform: translateX(-50%);
    font-size: clamp(2rem, 3.5vw, 4.25rem);
    line-height: 1;
    white-space: nowrap;
}

.product-intro__character {
    position: absolute;
    bottom: var(--thinking-image-bottom);
    left: var(--thinking-image-left);
    width: var(--thinking-image-width);
    height: auto;
    object-fit: contain;
    user-select: none;
}

@media (orientation: portrait) {
    .product-intro__question {
        top: clamp(6rem, 16svh, 11rem);
        width: min(88vw, 42rem);
        font-size: clamp(1.65rem, 6.2vw, 3.25rem);
        line-height: 1.2;
    }

    .product-intro__answer {
        top: clamp(22rem, 52svh, 35rem);
        font-size: clamp(1.8rem, 7vw, 3.5rem);
    }

    .product-intro__character {
        bottom: var(--thinking-image-bottom-portrait);
        left: var(--thinking-image-left-portrait);
        width: var(--thinking-image-width-portrait);
    }
}
</style>
