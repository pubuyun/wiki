<script setup lang="ts">
withDefaults(
    defineProps<{
        alt?: string;
        eager?: boolean;
    }>(),
    {
        alt: "Cys-Gly-3M3SH precursor",
        eager: false,
    },
);
</script>

<template>
    <span
        class="precursor-sprite relative isolate block aspect-square"
        :role="alt ? 'img' : undefined"
        :aria-label="alt || undefined"
        :aria-hidden="alt ? undefined : 'true'"
    >
        <img
            class="pointer-events-none absolute inset-0 block size-full object-contain select-none"
            src="https://static.igem.wiki/teams/6133/wiki/homepage/precursorcys3m3sh.avif"
            alt=""
            :loading="eager ? 'eager' : 'lazy'"
            :fetchpriority="eager ? 'high' : 'low'"
            decoding="async"
            draggable="false"
        />
        <img
            class="pointer-events-none absolute inset-0 block size-full object-contain select-none"
            src="https://static.igem.wiki/teams/6133/wiki/homepage/precursorgly.avif"
            alt=""
            :loading="eager ? 'eager' : 'lazy'"
            :fetchpriority="eager ? 'high' : 'low'"
            decoding="async"
            draggable="false"
        />
    </span>
</template>
