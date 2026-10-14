<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const ContentGraphInteractive = defineAsyncComponent(
    () => import("./ContentGraph/ContentGraphInteractive.client.vue"),
);

defineOptions({ inheritAttrs: false });

const props = defineProps<{
    view: string;
    fullHeight?: boolean;
}>();

const layouts = useRuntimeConfig().public.contentGraphLayouts;
const layout = computed(() => layouts[props.view]);
const frameStyle = computed(() => ({
    "--graph-aspect-ratio": layout.value?.aspectRatio ?? 1,
    "--graph-max-height": `${layout.value?.maxHeight ?? 560}px`,
}));
</script>

<template>
    <div
        v-bind="$attrs"
        class="content-graph-frame w-full min-w-0 portrait:hidden"
        :style="frameStyle"
    >
        <div
            class="content-graph-frame__surface"
            :class="{ 'content-graph-frame__surface--full': fullHeight }"
        >
            <ClientOnly>
                <Suspense>
                    <ContentGraphInteractive
                        :view="view"
                        :full-height="fullHeight"
                    />

                    <template #fallback>
                        <figure
                            class="grid w-full place-items-center overflow-hidden rounded-2xl border-2 border-outline bg-surface-elevated text-sm text-on-surface shadow-sm sm:rounded-3xl lg:rounded-4xl portrait:hidden"
                            style="height: 100%"
                            aria-label="Interactive graph"
                            aria-busy="true"
                        >
                            <span role="status">Loading graph...</span>
                        </figure>
                    </template>
                </Suspense>

                <template #fallback>
                    <figure
                        class="grid w-full place-items-center overflow-hidden rounded-2xl border-2 border-outline bg-surface-elevated text-sm text-on-surface shadow-sm sm:rounded-3xl lg:rounded-4xl portrait:hidden"
                        style="height: 100%"
                        aria-label="Interactive graph"
                        aria-busy="true"
                    >
                        <span role="status">Loading graph...</span>
                    </figure>
                </template>
            </ClientOnly>
        </div>
    </div>
</template>

<style scoped>
.content-graph-frame {
    container-type: inline-size;
    --graph-navigation-height: 3rem;
}

/* Reserve the final canvas, caption and borders before the client chunk loads. */
.content-graph-frame__surface {
    height: calc(
        min(
                clamp(
                    180px,
                    calc((100cqw - 4px) / var(--graph-aspect-ratio) + 80px),
                    var(--graph-max-height)
                ),
                calc(100dvh - var(--graph-navigation-height) - 2rem - 3.5rem)
            ) +
            3.5rem + 4px
    );
}

.content-graph-frame__surface--full {
    height: calc(100dvh - 5rem);
}

@media (width >= 40rem) {
    .content-graph-frame {
        --graph-navigation-height: 2.5rem;
    }
}

@media (width >= 64rem) {
    .content-graph-frame {
        --graph-navigation-height: 2.75rem;
    }
}

@media (width >= 80rem) {
    .content-graph-frame {
        --graph-navigation-height: 3.5rem;
    }
}
</style>
