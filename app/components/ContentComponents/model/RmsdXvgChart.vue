<script setup lang="ts">
withDefaults(
    defineProps<{
        xvg?: string | string[];
        src?: string | string[];
        title?: string;
        seriesName?: string | string[];
        heightClass?: string;
        embedded?: boolean;
    }>(),
    { title: "", heightClass: "min-h-[24rem]" },
);
</script>

<template>
    <div class="min-w-0" :class="heightClass">
        <ClientOnly>
            <LazyContentComponentsModelRmsdXvgRenderer
                :xvg="xvg"
                :src="src"
                :title="title"
                :series-name="seriesName"
                :height-class="heightClass"
                :embedded="embedded"
            />
            <template #fallback>
                <p
                    role="status"
                    class="m-0 flex items-center justify-center bg-secondary p-4 text-on-secondary"
                    :class="[
                        heightClass,
                        { 'rounded border border-surface-bright': !embedded },
                    ]"
                >
                    Loading RMSD chart...
                </p>
            </template>
        </ClientOnly>
    </div>
</template>
