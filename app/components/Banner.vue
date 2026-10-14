<script setup lang="ts">
withDefaults(
    defineProps<{
        title: string;
        imgSrc?: string;
        imgWidth?: number;
        imgHeight?: number;
        imgPosition?: string;
        imgMobilePosition?: string;
        imgFit?: "cover" | "raised";
        imgBackground?: string;
    }>(),
    {
        imgPosition: "50% center",
        imgFit: "cover",
    },
);
</script>

<template>
    <header
        class="banner relative isolate grid min-w-0 overflow-hidden bg-surface"
        :class="{
            'banner--with-image': imgSrc,
            'banner--raised': imgFit === 'raised',
        }"
        :style="{
            '--banner-position': imgPosition,
            '--banner-mobile-position': imgMobilePosition ?? imgPosition,
            '--banner-background': imgBackground,
        }"
    >
        <img
            v-if="imgSrc"
            class="banner-image relative col-start-1 row-start-1 block h-auto w-full self-start"
            :src="imgSrc"
            :width="imgWidth"
            :height="imgHeight"
            fetchpriority="high"
            alt=""
        />
        <div
            class="banner-heading relative col-start-1 row-start-1 min-w-0 self-end"
        >
            <span class="banner-accent block" aria-hidden="true" />
            <h1
                class="banner-title min-w-0 font-momo-trust-display text-on-surface"
            >
                {{ title }}
            </h1>
        </div>
    </header>
</template>

<style scoped>
.banner {
    background-color: var(--banner-background, var(--surface));
}

.banner-image {
    object-fit: contain;
    object-position: var(--banner-position);
    z-index: -2;
}

/* Keep the illustration visible above a consistent, readable title area. */
.banner--with-image::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(
        180deg,
        rgb(4 23 47 / 0%) 20%,
        rgb(4 23 47 / 20%) 45%,
        rgb(4 23 47 / 82%) 72%,
        rgb(4 23 47 / 98%) 100%
    );
    pointer-events: none;
}

/* Blend below the title into the reading region's theme background. */
.banner--with-image::after {
    content: "";
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    height: clamp(2rem, 5cqi, 4rem);
    z-index: -1;
    background: linear-gradient(to bottom, transparent, var(--surface) 95%);
    pointer-events: none;
}

.banner--raised .banner-image {
    mask-image: linear-gradient(to bottom, #000 85%, transparent);
}

.banner-heading {
    padding-block: clamp(2rem, 5cqi, 4rem);
    padding-inline: clamp(1rem, 2.75cqi, 3rem);
}

.banner-accent {
    width: clamp(2.5rem, 5cqi, 4rem);
    height: 0.25rem;
    margin-bottom: clamp(1rem, 2cqi, 1.5rem);
    background-color: var(--accent);
}

.banner-title {
    max-width: 18ch;
    margin: 0;
    font-size: clamp(2.25rem, 6cqi, 5.5rem);
    line-height: 1.1;
    text-wrap: balance;
    overflow-wrap: anywhere;
}

.banner--with-image .banner-title {
    color: #f8ffff;
}

@media (max-width: 40rem) {
    .banner-image {
        object-position: var(--banner-mobile-position);
    }
}
</style>
