<script setup lang="ts">
import { Icon } from "@iconify/vue";
import {
    buildCategoryNavTree,
    type ContentNavNode,
} from "~/utils/content-pages";

const props = defineProps<{
    pages: {
        path: string;
        title?: string;
        description?: string;
        order?: number;
    }[];
    categorySlug: string;
    categoryTitle: string;
}>();

const headingId = useId();
const groups = computed(() => {
    const pagesByPath = new Map(props.pages.map((page) => [page.path, page]));

    function descendants(nodes: ContentNavNode[]): ContentNavNode[] {
        return nodes.flatMap((node) => [
            ...(node.path ? [node] : []),
            ...descendants(node.children ?? []),
        ]);
    }

    return buildCategoryNavTree(props.pages, props.categorySlug, "").map(
        (node) => ({
            ...node,
            description: node.path
                ? pagesByPath.get(node.path)?.description
                : undefined,
            documents: descendants(node.children ?? []),
        }),
    );
});
</script>

<template>
    <nav
        :aria-labelledby="headingId"
        class="category-explore border-t border-outline-variant pt-8 sm:pt-10"
    >
        <header class="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div class="min-w-0">
                <p
                    class="mb-2 font-belanosima text-sm tracking-widest text-on-surface uppercase"
                >
                    Continue exploring
                </p>
                <h2
                    :id="headingId"
                    class="font-momo-trust-display text-2xl leading-tight wrap-anywhere text-on-surface sm:text-3xl"
                >
                    Explore {{ categoryTitle }}
                </h2>
                <p class="mt-3 max-w-prose text-base text-on-surface">
                    Take a closer look. Choose a document to keep reading.
                </p>
            </div>
            <span
                class="shrink-0 rounded-full border border-outline-variant px-4 py-2 font-belanosima text-sm text-on-surface"
            >
                {{ pages.length }}
                {{ pages.length === 1 ? "document" : "documents" }}
            </span>
        </header>

        <ul class="explore-grid grid gap-4">
            <li
                v-for="(group, index) in groups"
                :key="group.id"
                class="flex min-w-0 flex-col rounded-3xl border border-outline-variant bg-secondary text-on-secondary"
            >
                <h3 class="min-w-0 font-belanosima text-xl leading-snug">
                    <NuxtLink
                        v-if="group.path"
                        :to="group.path"
                        class="explore-link group flex min-h-20 items-center gap-4 rounded-3xl px-5 py-5 no-underline transition-colors hover:bg-accent hover:text-on-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-outline sm:px-6"
                    >
                        <span
                            aria-hidden="true"
                            class="shrink-0 text-sm tabular-nums"
                            >{{ String(index + 1).padStart(2, "0") }}</span
                        >
                        <span class="min-w-0 flex-1 wrap-anywhere">{{
                            group.label
                        }}</span>
                        <Icon
                            icon="lucide:arrow-up-right"
                            aria-hidden="true"
                            class="size-5 shrink-0"
                        />
                    </NuxtLink>
                    <span
                        v-else
                        class="block px-5 py-5 wrap-anywhere sm:px-6"
                        >{{ group.label }}</span
                    >
                </h3>
                <p
                    v-if="group.description"
                    class="px-5 pb-5 text-sm leading-relaxed wrap-anywhere sm:px-6"
                >
                    {{ group.description }}
                </p>
                <details
                    v-if="group.documents.length"
                    class="mt-auto border-t border-outline-variant"
                >
                    <summary
                        class="min-h-12 cursor-pointer rounded-b-3xl px-5 py-4 font-belanosima text-base hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-outline sm:px-6"
                    >
                        Explore {{ group.documents.length }}
                        {{
                            group.documents.length === 1
                                ? "document"
                                : "documents"
                        }}
                        inside
                    </summary>
                    <ul class="space-y-1 px-3 pb-3">
                        <li
                            v-for="document in group.documents"
                            :key="document.id"
                        >
                            <NuxtLink
                                :to="document.path"
                                class="flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm wrap-anywhere no-underline transition-colors hover:bg-accent hover:text-on-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
                            >
                                <span>{{ document.label }}</span>
                                <Icon
                                    icon="lucide:arrow-right"
                                    aria-hidden="true"
                                    class="size-4 shrink-0"
                                />
                            </NuxtLink>
                        </li>
                    </ul>
                </details>
            </li>
        </ul>
    </nav>
</template>

<style scoped>
@container reading (width >= 40rem) {
    .explore-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>
