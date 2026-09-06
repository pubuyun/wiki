<script setup lang="ts">
import PaintedReveal from "./PaintedReveal.vue";
import { HOME_CHAPTERS } from "~/utils/home-chapters";
useHead({
    noscript: [
        {
            innerHTML:
                "<style>.site-loading{display:none!important}.home-layout>header{visibility:visible!important}.painted-reveal{background:#fffff8!important}.painted-reveal__content{clip-path:none!important}</style>",
        },
    ],
});
</script>
<template>
    <section
        id="expelliodor"
        class="hero"
        :data-home-chapter="HOME_CHAPTERS.expelliodor"
        aria-labelledby="expelliodor-title"
    >
        <PaintedReveal
            ><div class="hero__copy">
                <h1 id="expelliodor-title">Expelliodor</h1>
                <h2>Greatbay 2026</h2>
            </div></PaintedReveal
        >
    </section>
</template>
<style scoped>
.hero {
    --home-nav-clearance: clamp(3.5rem, 4vw, 4.25rem);
    --hero-title-y: 0rem;
    --hero-subtitle-y: -1.25rem;
    --hero-copy-gap: 0.1em;

    position: relative;
    height: 100svh;
    min-height: 24rem;
    overflow: hidden;
    background: #03316d;
}
.hero__copy {
    width: max-content;
    margin-inline: auto;
    color: #03316d;
    font-family: var(--font-righteous);
}
h1 {
    margin: 0;
    transform: translateY(var(--hero-title-y));
    font-size: min(16.8vw, 18rem);
    font-weight: 400;
    line-height: 1.12;
    letter-spacing: -0.035em;
    white-space: nowrap;
}
h2 {
    margin: var(--hero-copy-gap) 0 0;
    transform: translateY(var(--hero-subtitle-y));
    text-align: right;
    font-size: min(4.5vw, 5rem);
    font-weight: 400;
    line-height: 1.2;
}
@media (orientation: portrait) {
    .hero {
        --hero-subtitle-y: -0.5rem;
        --hero-copy-gap: 0.5em;
    }
    h1 {
        font-size: 17vw;
    }
    h2 {
        font-size: 6vw;
        margin-top: 1em;
    }
}
</style>
