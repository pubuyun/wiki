<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { onMounted, onUnmounted, ref } from "vue";
import {
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuTrigger,
} from "reka-ui";

interface DropdownLink {
    to: string;
    label: string;
    icon: string;
}

withDefaults(
    defineProps<{
        title: string;
        to?: string;
        links?: DropdownLink[];
    }>(),
    { links: () => [] },
);

const menuContent = ref<InstanceType<typeof NavigationMenuContent>>();
let observer: MutationObserver | null = null;

onMounted(() => {
    const content = menuContent.value?.$el as HTMLElement | undefined;
    if (!content) return;

    const syncHiddenContent = () => {
        const isOpen = content.dataset.state === "open";
        content.inert = !isOpen;
        content.setAttribute("aria-hidden", String(!isOpen));
    };

    syncHiddenContent();
    observer = new MutationObserver(syncHiddenContent);
    observer.observe(content, {
        attributes: true,
        attributeFilter: ["data-state"],
    });
});

onUnmounted(() => observer?.disconnect());
</script>

<template>
    <NavigationMenuItem class="relative inline-block">
        <NavigationMenuTrigger
            class="nav-menu-trigger group inline-flex cursor-pointer list-none items-center gap-1 bg-transparent px-1 py-2 text-on-surface outline-offset-4 transition-transform duration-150 select-none hover:-translate-y-0.5 hover:text-on-secondary focus-visible:outline-2 focus-visible:outline-outline"
        >
            <span
                class="decoration-2 underline-offset-2 high-contrast:group-hover:underline high-contrast:group-focus-visible:underline"
                >{{ title }}</span
            >
            <span
                class="text-lg transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180 group-data-[state=open]:rotate-180"
                aria-hidden="true"
                >&#9662;</span
            >
        </NavigationMenuTrigger>

        <NavigationMenuContent
            ref="menuContent"
            force-mount
            class="nav-menu-content absolute top-full -left-1/3 w-62 overflow-hidden rounded-2xl bg-surface-bright text-on-surface shadow-sm data-[state=closed]:pointer-events-none! data-[state=open]:pointer-events-auto!"
        >
            <div class="mx-auto flex w-fit flex-col">
                <NavigationMenuLink
                    v-for="link in links"
                    :key="link.to"
                    as-child
                >
                    <NuxtLink
                        :to="link.to"
                        @pointerdown.stop
                        class="group flex min-h-16 w-53 items-center gap-3 px-5 py-4 text-xl text-on-surface no-underline -outline-offset-2 first:rounded-t-2xl last:rounded-b-2xl focus-visible:outline-2 focus-visible:outline-outline"
                    >
                        <Icon :icon="link.icon" class="size-6 shrink-0" />
                        <span
                            class="transition-transform duration-150 ease-out group-hover:translate-x-2"
                        >
                            {{ link.label }}
                        </span>
                    </NuxtLink>
                </NavigationMenuLink>
            </div>
        </NavigationMenuContent>
    </NavigationMenuItem>
</template>

<style scoped>
:global(.nav-menu-content) {
    z-index: 50;
    clip-path: inset(0);
    transition:
        clip-path 0.3s ease,
        opacity 0.3s ease,
        visibility 0s;
}

:global(.nav-menu-content[data-state="open"]) {
    z-index: 51;
}

:global(.nav-menu-content[data-state="closed"]) {
    clip-path: inset(0 0 100% 0);
    opacity: 0;
    visibility: hidden;
    transition-delay: 0s, 0s, 0.3s;
}

@media (prefers-reduced-motion: reduce) {
    :global(.nav-menu-content) {
        transition: none;
    }
}
</style>
