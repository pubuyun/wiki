<template>
    <div class="image-text">
        <div class="image-text__layout" :class="{ 'has-image': $slots.image }">
            <div class="image-text__text">
                <slot />
            </div>
            <div v-if="$slots.image" class="image-text__image">
                <!-- LightboxImage renders a div, which cannot sit inside a Markdown paragraph. -->
                <slot name="image" mdc-unwrap="p" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.image-text {
    container-type: inline-size;
    margin-block: 1.5rem;
    min-width: 0;
}

.image-text__layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
    gap: 1.5rem;
}

.image-text__text,
.image-text__image {
    min-width: 0;
    overflow-wrap: anywhere;
}

.image-text__text :deep(> :first-child) {
    margin-block-start: 0;
}

.image-text__text :deep(> :last-child) {
    margin-block-end: 0;
}

.image-text__image :deep(p),
.image-text__image :deep(button),
.image-text__image :deep(img) {
    margin-block: 0;
}

.image-text__image :deep(button),
.image-text__image :deep(img) {
    width: 100%;
    max-width: 100%;
}

.image-text__image :deep(img) {
    display: block;
    height: auto;
}

@container (min-width: 40rem) {
    .image-text__layout.has-image {
        grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
        gap: 2rem;
    }
}
</style>
